import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, users } from "@basis-forum/database";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

type BasisRole = 'student' | 'moderator' | 'admin';
type TokenWithRole = { role?: BasisRole };
type SessionUserWithRole = { id?: string; role?: BasisRole };

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim();
        const password = String(credentials?.password || '');

        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(
          or(eq(users.email, email), eq(users.username, email)),
        );

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as typeof token & TokenWithRole).role = (user as typeof user & TokenWithRole).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & SessionUserWithRole;
        const authToken = token as typeof token & TokenWithRole;
        sessionUser.role = authToken.role;
        sessionUser.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
