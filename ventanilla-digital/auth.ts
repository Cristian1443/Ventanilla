import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
const issuer =
  process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ||
  (tenantId ? `https://login.microsoftonline.com/${tenantId}/v2.0` : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? "",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? "",
      tenantId: tenantId ?? "",
      issuer,
      authorization: {
        params: {
          scope: "openid profile email User.Read User.ReadBasic.All offline_access",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        (token as { accessToken?: string }).accessToken = account.access_token;
        try {
          const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=jobTitle,department", {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          if (response.ok) {
            const profile = (await response.json()) as { jobTitle?: string | null; department?: string | null };
            if (profile.jobTitle) {
              token.cargo = profile.jobTitle;
            }
            if (profile.department) {
              (token as any).gerencia = profile.department;
            }
          }
        } catch {
          // No bloquear login si Graph falla
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.cargo = (token as { cargo?: string }).cargo ?? session.user.cargo;
        (session.user as any).gerencia = (token as any).gerencia ?? (session.user as any).gerencia;
        (session as any).accessToken = (token as { accessToken?: string }).accessToken;
      }
      if (
        ((!session.user?.cargo || !(session.user as any)?.gerencia) as boolean) &&
        (token as { accessToken?: string }).accessToken
      ) {
        try {
          const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=jobTitle,department", {
            headers: { Authorization: `Bearer ${(token as { accessToken?: string }).accessToken}` },
          });
          if (response.ok) {
            const profile = (await response.json()) as { jobTitle?: string | null; department?: string | null };
            if (profile.jobTitle && session.user) {
              session.user.cargo = profile.jobTitle;
            }
            if (profile.department && session.user) {
              (session.user as any).gerencia = profile.department;
            }
          }
        } catch {
          // No bloquear sesión si Graph falla
        }
      }
      return session;
    },
  },
});
