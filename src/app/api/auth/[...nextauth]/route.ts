import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Next.js router handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 