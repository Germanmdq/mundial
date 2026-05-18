"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/getUser";
import {
  createPrivateGroup,
  getPrivateGroupForMember,
  getMyPrivateGroups,
  joinPrivateGroupByInviteCode,
  type PrivateGroup,
} from "@/lib/server/private-groups";
import { getOfficialLeaderboard } from "@/lib/server/ranking";
import { PaymentRequiredError } from "@/lib/server/predictions";

export type { PrivateGroup };

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

export async function createGroup(name: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Tenés que iniciar sesión para crear un grupo." };

  try {
    const { group } = await createPrivateGroup(user.id, name);
    revalidatePath("/grupos");
    return { success: true, group };
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return { success: false, error: error.message, code: "payment_required" };
    }

    console.error("[groups:createGroup]", error);
    return { success: false, error: "No se pudo crear el grupo." };
  }
}

export async function joinGroup(inviteCode: string) {
  const user = await getUser();
  if (!user) return { success: false, error: "Tenés que iniciar sesión para unirte a un grupo." };

  try {
    const group = await joinPrivateGroupByInviteCode(user.id, inviteCode);
    revalidatePath("/grupos");
    return { success: true, group };
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return { success: false, error: error.message, code: "payment_required" };
    }

    return { success: false, error: "No encontramos un grupo con ese código." };
  }
}

export async function getMyGroups(): Promise<PrivateGroup[]> {
  const user = await getUser();
  if (!user) return [];

  try {
    return await getMyPrivateGroups(user.id);
  } catch (error) {
    console.warn("[groups] Error fetching private groups:", error);
    return [];
  }
}

export async function getGroupRanking(groupId: string): Promise<GroupRanking> {
  const user = await getUser();
  if (!user) return { group: null, members_count: 0, ranking: [], error: "Tenés que iniciar sesión." };

  const result = await getPrivateGroupForMember(user.id, groupId);
  if (!result) {
    return { group: null, members_count: 0, ranking: [], error: "No tenés acceso a este grupo." };
  }

  const leaderboard = await getOfficialLeaderboard();
  const memberIds = new Set(result.memberIds);
  return {
    group: result.group,
    members_count: result.memberIds.length,
    ranking: leaderboard
      .filter((entry) => memberIds.has(entry.user_id))
      .map((entry, index) => ({
        user_id: entry.user_id,
        display_name: entry.display_name,
        avatar_url: null,
        total_points: entry.total_points,
        rank: index + 1,
      })),
  };
}
