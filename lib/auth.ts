import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Email ou téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const login = credentials.login as string;
        const password = credentials.password as string;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: login.toLowerCase() },
              { phone: login },
            ],
          },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
});
