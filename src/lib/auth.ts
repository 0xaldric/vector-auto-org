import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          if (!res.ok) return null;

          const json = await res.json();
          const { user, token } = json.data;

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            image: user.avatarUrl,
            role: user.role,
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google/authenticate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: account.id_token }),
            }
          );

          if (!res.ok) return false;

          const json = await res.json();
          const { user: backendUser, token } = json.data;

          user.id = backendUser.id;
          user.role = backendUser.role;
          user.name = backendUser.displayName;
          user.image = backendUser.avatarUrl;
          user.accessToken = token;

          if (backendUser.role !== "admin") {
            return "/login?error=AdminOnly";
          }

          return true;
        } catch {
          return false;
        }
      }
      // Credentials provider: user object comes from authorize()
      if (user.role !== "admin") {
        return "/login?error=AdminOnly";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
