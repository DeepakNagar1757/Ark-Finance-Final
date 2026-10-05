#!/usr/bin/env node
/**
 * Create the first admin user (or an additional one) directly via the service role.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     ADMIN_EMAIL=karan@arkfinance.in ADMIN_PASSWORD='a strong password' node scripts/create-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const role = (process.env.ADMIN_ROLE ?? "admin").trim();

if (!url || !key || !email || password.length < 8) {
  console.error(
    "Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars).",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: existing } = await supabase
  .from("admin_users")
  .select("id")
  .eq("email", email)
  .maybeSingle();

if (existing) {
  console.log(`Admin ${email} already exists (id=${existing.id}).`);
  process.exit(0);
}

const password_hash = await bcrypt.hash(password, 12);
const { data, error } = await supabase
  .from("admin_users")
  .insert({ email, password_hash, role, name: "Administrator" })
  .select("id, email, role")
  .single();

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}
console.log(`Created ${data.role}: ${data.email} (id=${data.id}).`);