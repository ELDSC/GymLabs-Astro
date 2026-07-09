import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./supabase.types";

const env = {
  SUPABASE_TARGET: import.meta.env.SUPABASE_TARGET,
  SUPABASE_CLOUD_URL: import.meta.env.SUPABASE_CLOUD_URL,
  SUPABASE_CLOUD_PUBLISHABLE_KEY: import.meta.env.SUPABASE_CLOUD_PUBLISHABLE_KEY,
  SUPABASE_LOCAL_URL: import.meta.env.SUPABASE_LOCAL_URL,
  SUPABASE_LOCAL_PUBLISHABLE_KEY: import.meta.env.SUPABASE_LOCAL_PUBLISHABLE_KEY,
  SUPABASE_PRODUCT_IMAGE_BUCKET: import.meta.env.SUPABASE_PRODUCT_IMAGE_BUCKET,
  SUPABASE_HOME_VIDEO_BUCKET: import.meta.env.SUPABASE_HOME_VIDEO_BUCKET,
  SUPABASE_HOME_VIDEO_PATH: import.meta.env.SUPABASE_HOME_VIDEO_PATH,
} as const;

function getRequiredEnv(name: keyof typeof env) {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
}

const supabaseTarget = getRequiredEnv("SUPABASE_TARGET");

const supabaseConfigByTarget = {
  cloud: {
    url: env.SUPABASE_CLOUD_URL,
    publishableKey: env.SUPABASE_CLOUD_PUBLISHABLE_KEY,
  },
  local: {
    url: env.SUPABASE_LOCAL_URL,
    publishableKey: env.SUPABASE_LOCAL_PUBLISHABLE_KEY,
  },
} as const;

const selectedConfig =
  supabaseConfigByTarget[supabaseTarget as keyof typeof supabaseConfigByTarget];

if (!selectedConfig) {
  throw new Error(
    `Invalid SUPABASE_TARGET "${supabaseTarget}". Use "local" or "cloud".`,
  );
}

if (!selectedConfig.url || !selectedConfig.publishableKey) {
  throw new Error(
    `Supabase environment variables are not configured for target "${supabaseTarget}".`,
  );
}

export const supabase = createClient<Database>(
  selectedConfig.url,
  selectedConfig.publishableKey,
);

export function createSupabaseServerClient({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) {
  const serverCookieMethods: CookieMethodsServer = {
    getAll() {
      return parseCookieHeader(request.headers.get("Cookie") ?? "").reduce<
        { name: string; value: string }[]
      >((parsedCookies, { name, value }) => {
        if (value === undefined) {
          return parsedCookies;
        }

        parsedCookies.push({ name, value });
        return parsedCookies;
      }, []);
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookies.set(name, value, options);
      });
    },
  };

  return createServerClient<Database>(
    selectedConfig.url,
    selectedConfig.publishableKey,
    {
      cookies: serverCookieMethods,
    },
  );
}

export async function getAdminUser(
  client: ReturnType<typeof createSupabaseServerClient>,
) {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await client
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    return null;
  }

  return user;
}

export function getSupabasePublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

const productImageBucket = getRequiredEnv("SUPABASE_PRODUCT_IMAGE_BUCKET");

export function getProductImageUrl(path: string) {
  return getSupabasePublicUrl(productImageBucket, path);
}

export { getRequiredEnv };
