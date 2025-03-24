"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface NextAuthProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export function NextAuthProvider({ children, session }: NextAuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 