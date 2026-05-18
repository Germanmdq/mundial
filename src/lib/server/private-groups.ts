import { getAppUrl } from "@/lib/server/payments";
import { getServiceSupabase, isUserParticipationActive } from "@/lib/server/payments";
import { PaymentRequiredError } from "@/lib/server/predictions";

export type PrivateGroup = {
  id: string;
  name: string;
  slug: string | null;
  invite_code: string;
  owner_id: string | null;
  created_at: string;
  updated_at?: string | null;
  member_count?: number;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function cleanInput(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

async function assertCanUsePrivateGroups(userId: string) {
  if (!(await isUserParticipationActive(userId))) {
    throw new PaymentRequiredError("Activá tu participación para crear grupos privados.");
  }
}

export async function createPrivateGroup(userId: string, name: string) {
  await assertCanUsePrivateGroups(userId);

  const groupName = cleanInput(name);
  if (groupName.length < 3) {
    throw new Error("El nombre del grupo debe tener al menos 3 caracteres.");
  }

  const supabase = getServiceSupabase();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = createInviteCode();
    const { data: group, error } = await supabase
      .from("private_groups")
      .insert({
        name: groupName,
        slug: slugify(groupName),
        invite_code: inviteCode,
        owner_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select("id, name, slug, invite_code, owner_id, created_at, updated_at")
      .single();

    if (error) {
      lastError = error;
      if (error.code === "23505") continue;
      throw error;
    }

    const { error: memberError } = await supabase
      .from("private_group_members")
      .upsert(
        {
          group_id: group.id,
          user_id: userId,
          role: "owner",
        },
        { onConflict: "group_id,user_id" },
      );

    if (memberError) throw memberError;

    return {
      group: group as PrivateGroup,
      inviteUrl: `${getAppUrl()}/grupos/invitar/${inviteCode}`,
    };
  }

  throw lastError instanceof Error ? lastError : new Error("No se pudo crear el grupo.");
}

export async function getMyPrivateGroups(userId: string) {
  const supabase = getServiceSupabase();

  const { data: memberships, error: membershipError } = await supabase
    .from("private_group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (membershipError) throw membershipError;

  const groupIds = [...new Set((memberships ?? []).map((membership) => String(membership.group_id)).filter(Boolean))];
  if (groupIds.length === 0) return [];

  const [{ data: groups, error: groupsError }, { data: members, error: membersError }] = await Promise.all([
    supabase
      .from("private_groups")
      .select("id, name, slug, invite_code, owner_id, created_at, updated_at")
      .in("id", groupIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("private_group_members")
      .select("group_id")
      .in("group_id", groupIds),
  ]);

  if (groupsError) throw groupsError;
  if (membersError) throw membersError;

  const counts = new Map<string, number>();
  for (const member of members ?? []) {
    const groupId = String(member.group_id);
    counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
  }

  return ((groups ?? []) as PrivateGroup[]).map((group) => ({
    ...group,
    member_count: counts.get(group.id) ?? 0,
  }));
}

export async function getPrivateGroupForMember(userId: string, groupId: string) {
  const supabase = getServiceSupabase();
  const { data: membership, error: membershipError } = await supabase
    .from("private_group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const [{ data: group, error: groupError }, { data: members, error: membersError }] = await Promise.all([
    supabase
      .from("private_groups")
      .select("id, name, slug, invite_code, owner_id, created_at, updated_at")
      .eq("id", groupId)
      .single(),
    supabase
      .from("private_group_members")
      .select("user_id")
      .eq("group_id", groupId),
  ]);

  if (groupError) throw groupError;
  if (membersError) throw membersError;

  return {
    group: {
      ...(group as PrivateGroup),
      member_count: members?.length ?? 0,
    },
    memberIds: [...new Set((members ?? []).map((member) => String(member.user_id)).filter(Boolean))],
  };
}

export async function joinPrivateGroupByInviteCode(userId: string, inviteCode: string) {
  await assertCanUsePrivateGroups(userId);

  const code = cleanInput(inviteCode).toUpperCase();
  if (code.length < 4) {
    throw new Error("Ingresá un código de invitación válido.");
  }

  const supabase = getServiceSupabase();
  const { data: group, error } = await supabase
    .from("private_groups")
    .select("id, name, slug, invite_code, owner_id, created_at, updated_at")
    .ilike("invite_code", code)
    .maybeSingle();

  if (error) throw error;
  if (!group) throw new Error("No encontramos un grupo con ese código.");

  const { error: memberError } = await supabase
    .from("private_group_members")
    .upsert(
      {
        group_id: group.id,
        user_id: userId,
        role: "member",
      },
      { onConflict: "group_id,user_id" },
    );

  if (memberError) throw memberError;
  return group as PrivateGroup;
}
