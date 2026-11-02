"use server";

import { signOut as nextSignOut } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function signOut() {
  await nextSignOut(authOptions);
  redirect("/admin/login");
}
