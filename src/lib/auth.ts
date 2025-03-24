import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { headers } from 'next/headers';
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getUser() {
  try {
    // Önce cookies'e bakacağız
    const cookieStore = cookies();
    let token = cookieStore.get('token')?.value;
    
    // Cookie'de token yoksa, Authorization header'ına bakacağız
    if (!token) {
      const headersList = headers();
      const authHeader = headersList.get('Authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('Token bulunamadı: Kimlik doğrulama yok');
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    // 30 günlük oturum süresi
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        if (!user.isApproved) {
          throw new Error("Hesabınız henüz onaylanmadı");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Geçersiz şifre");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // İlk giriş
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      
      // Daha önce giriş yapmış kullanıcı
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        return token;
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };
    },
  },
}; 