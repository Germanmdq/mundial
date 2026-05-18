export type PrivateGroup = {
  id: string;
  name: string;
  slug?: string | null;
  invite_code: string;
  inviteCode?: string | null;
  inviteUrl?: string | null;
  owner_id?: string | null;
  ownerId?: string | null;
  role?: string | null;
  member_count?: number | null;
  memberCount?: number | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
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
