import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseTarget = import.meta.env.SUPABASE_TARGET ?? "local";

const supabaseConfigByTarget = {
  cloud: {
    url: import.meta.env.SUPABASE_CLOUD_URL,
    publishableKey: import.meta.env.SUPABASE_CLOUD_PUBLISHABLE_KEY,
  },
  local: {
    url: import.meta.env.SUPABASE_LOCAL_URL,
    publishableKey: import.meta.env.SUPABASE_LOCAL_PUBLISHABLE_KEY,
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
