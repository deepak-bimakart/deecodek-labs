// Types matching our extended NextAuth session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  }
}
