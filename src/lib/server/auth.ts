import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "Necesitás iniciar sesión para activar tu participación.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

function logAuthDebug(provider: string, hasAuthorizationHeader: boolean, userFound: boolean) {
  if (process.env.NODE_ENV === "production") return;

  console.info("[payments:auth]", {
    provider,
    hasAuthorizationHeader,
    userFound,
  });
}

async function getUserFromBearerToken(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createSupabaseClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

async function getUserFromCookies() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getAuthenticatedUser(request: Request, provider = "unknown"): Promise<User> {
  const bearerToken = getBearerToken(request);
  let user = bearerToken ? await getUserFromBearerToken(bearerToken) : null;

  if (!user) {
    user = await getUserFromCookies();
  }

  logAuthDebug(provider, Boolean(bearerToken), Boolean(user));

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
