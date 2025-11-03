import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      namaLengkap: string
      role: string
      foto?: string
      name?: string
      email?: string
      image?: string
    }
  }

  interface User {
    id: string
    username: string
    namaLengkap: string
    role: string
    foto?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    namaLengkap: string
    role: string
    foto?: string
  }
}