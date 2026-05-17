export type TeamAssetType = "flag" | "crest" | "hero_image" | "background" | "home_kit" | "away_kit" | "third_kit" | "logo_alt";

export type TeamAssetLike = {
  asset_type?: string | null;
  url?: string | null;
  storage_path?: string | null;
  is_primary?: boolean | null;
};

export type PlayerPhotoLike = {
  photo_url?: string | null;
  photo_path?: string | null;
  photo_storage_path?: string | null;
};

const STORAGE_BUCKET = "worldcup-assets";

function cleanValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function encodeStoragePath(storagePath: string): string {
  return storagePath
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function buildPublicStorageUrl(storagePath: string | null | undefined): string | null {
  const cleanPath = cleanValue(storagePath);
  if (!cleanPath) return null;
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;

  const supabaseUrl = cleanValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!supabaseUrl) return null;

  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeStoragePath(cleanPath)}`;
}

export function getTeamAssetUrl(
  teamAssets: TeamAssetLike[] | null | undefined,
  type: TeamAssetType,
): string | null {
  if (!teamAssets || teamAssets.length === 0) return null;

  const asset = teamAssets
    .filter((item) => item.asset_type === type)
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))[0];

  if (!asset) return null;
  return cleanValue(asset.url) ?? buildPublicStorageUrl(asset.storage_path);
}

export function getTeamFlagUrl(teamAssets: TeamAssetLike[] | null | undefined): string | null {
  return getTeamAssetUrl(teamAssets, "flag");
}

export function getTeamCrestUrl(teamAssets: TeamAssetLike[] | null | undefined): string | null {
  return getTeamAssetUrl(teamAssets, "crest");
}

export function getTeamHeroUrl(teamAssets: TeamAssetLike[] | null | undefined): string | null {
  return getTeamAssetUrl(teamAssets, "hero_image");
}

export function getTeamBackgroundUrl(teamAssets: TeamAssetLike[] | null | undefined): string | null {
  return getTeamAssetUrl(teamAssets, "background");
}

export function getPlayerPhotoUrl(player: PlayerPhotoLike | null | undefined): string | null {
  if (!player) return null;
  return cleanValue(player.photo_url) ?? buildPublicStorageUrl(player.photo_storage_path ?? player.photo_path);
}

export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
