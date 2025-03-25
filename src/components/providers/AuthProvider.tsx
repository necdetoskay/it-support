"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Next-Auth oturum yönetimi için provider bileşeni
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider session={undefined}>{children}</SessionProvider>;
} 