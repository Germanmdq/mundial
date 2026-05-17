"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/getUser";

export type PrivateGroup = {
  id: string;
  name: string;
  slug: string | null;
  invite_code: string;
  owner_id: string | null;
  created_at: string;
  member_count?: number;
};

export type GroupRankingEntry = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  rank: number;
};

export type GroupRanking = {
  group: PrivateGroup | null;
  members_count: number;
  ranking: GroupRankingEntry[];
  error?: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function createInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function cleanInput(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export async function createGroup(name: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Tenés que iniciar sesión para crear un grupo." };

  const groupName = cleanInput(name);
  if (groupName.length < 3) return { success: false, error: "El nombre del grupo debe tener al menos 3 caracteres." };

  const supabase = await createClient();
  let lastError = "No se pudo crear el grupo.";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = createInviteCode();
    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        slug: slugify(groupName),
        invite_code: inviteCode,
        owner_id: user.id,
      })
      .select("id, name, slug, invite_code, owner_id, created_at")
      .single();

    if (error) {
      lastError = error.message;
      if (error.code === "23505") continue;
      return { success: false, error: "No se pudo crear el grupo." };
    }

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      return { success: false, error: "El grupo se creó, pero no se pudo asociar tu usuario." };
    }

    revalidatePath("/grupos");
    return { success: true, group: group as PrivateGroup };
  }

  return { success: false, error: lastError };
}

export async function joinGroup(inviteCode: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Tenés que iniciar sesión para unirte a un grupo." };

  const code = cleanInput(inviteCode).toUpperCase();
  if (code.length < 4) return { success: false, error: "Ingresá un código de invitación válido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group_by_invite_code", { invite_code_input: code });

  if (error) {
    return { success: false, error: "No encontramos un grupo con ese código." };
  }

  revalidatePath("/grupos");
  return { success: true, group: data as PrivateGroup };
}

export async function getMyGroups(): Promise<PrivateGroup[]> {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data: groups, error } = await supabase
    .from("groups")
    .select("id, name, slug, invite_code, owner_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[groups] Error fetching groups:", error.message);
    return [];
  }

  const groupRows = (groups ?? []) as PrivateGroup[];
  if (groupRows.length === 0) return [];

  const { data: members } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupRows.map((group) => group.id));

  const counts = new Map<string, number>();
  for (const member of members ?? []) {
    const groupId = String(member.group_id);
    counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
  }

  return groupRows.map((group) => ({
    ...group,
    member_count: counts.get(group.id) ?? 0,
  }));
}

export async function getGroupRanking(groupId: string): Promise<GroupRanking> {
  const user = await getUser();
  if (!user) return { group: null, members_count: 0, ranking: [], error: "Tenés que iniciar sesión." };

  const supabase = await createClient();
  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return { group: null, members_count: 0, ranking: [], error: "No tenés acceso a este grupo." };
  }

  const [{ data: group, error: groupError }, { data: members, error: membersError }] = await Promise.all([
    supabase.from("groups").select("id, name, slug, invite_code, owner_id, created_at").eq("id", groupId).single(),
    supabase.from("group_members").select("user_id").eq("group_id", groupId),
  ]);

  if (groupError || membersError || !group) {
    return { group: null, members_count: 0, ranking: [], error: "No se pudo cargar el grupo." };
  }

  const memberIds = [...new Set((members ?? []).map((member) => String(member.user_id)).filter(Boolean))];
  if (memberIds.length === 0) return { group: group as PrivateGroup, members_count: 0, ranking: [] };

  const { data: leaderboard, error: leaderboardError } = await supabase
    .from("leaderboards")
    .select("user_id, display_name, avatar_url, total_points")
    .eq("type", "global")
    .in("user_id", memberIds);

  if (leaderboardError) {
    console.warn("[groups] Error fetching group ranking:", leaderboardError.message);
  }

  const leaderboardByUser = new Map(
    ((leaderboard ?? []) as Omit<GroupRankingEntry, "rank">[]).map((entry) => [entry.user_id, entry]),
  );

  const ranking = memberIds
    .map((userId) => {
      const entry = leaderboardByUser.get(userId);
      return {
        user_id: userId,
        display_name: entry?.display_name || "Participante",
        avatar_url: entry?.avatar_url ?? null,
        total_points: entry?.total_points ?? 0,
        rank: 0,
      };
    })
    .sort((a, b) => b.total_points - a.total_points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    group: group as PrivateGroup,
    members_count: memberIds.length,
    ranking,
  };
}
