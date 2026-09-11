import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLoginPage = nextUrl.pathname === "/admin/login";

      if (isOnAdmin && !isOnLoginPage && !isLoggedIn) {
        return false; // redirects to signIn page automatically
      }
      return true;
    },
  },
  providers: [], // filled in by the full auth.ts
};