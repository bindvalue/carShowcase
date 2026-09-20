"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "admin-sidebar-collapsed";

export async function getSidebarCollapsed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "true";
}

export async function setSidebarCollapsed(collapsed: boolean): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, String(collapsed), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    sameSite: "lax",
  });
}