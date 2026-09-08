import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );

        if (!isValid) return null;

        return { id: admin.id.toString(), email: admin.email };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});