import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-compatible auth config — no Prisma, no bcrypt.
// Actual credential verification happens in lib/auth.ts via the authorize callback.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Email ou téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      // authorize is defined in the full auth.ts (not here — Edge can't use Prisma)
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.phone = (user as { phone: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
};
