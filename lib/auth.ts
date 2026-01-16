import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || "common"}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async signIn() {
      // Simply allow sign-in - validation happens in survey access endpoint
      return true
    },
    async jwt({ token, account, profile }) {
      // Add tenant ID to JWT token
      if (account && profile) {
        token.tenantId = (account as any)?.tenantId || (profile as any)?.tid
        token.objectId = (profile as any)?.oid
      }
      return token
    },
    async session({ session, token }) {
      // Add tenant ID to session
      if (session.user) {
        (session.user as any).tenantId = token.tenantId as string
        (session.user as any).objectId = token.objectId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/survey/auth/signin',
    error: '/survey/auth/error',
  },
})
