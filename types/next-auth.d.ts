import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Kullanıcı oturumu için ek özellikleri tanımlar
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * Kullanıcı nesnesi için rol özelliğini tanımlar
   */
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * JWT token için ek özellikleri tanımlar
   */
  interface JWT {
    id: string;
    role: string;
  }
} 