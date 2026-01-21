"use server";

import { auth } from "@/auth";

export async function searchUserByName(name: string) {
  if (!name || name.length < 2) {
    return null;
  }

  const session = await auth();
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    console.error("[searchUser] No accessToken en sesión");
    return null;
  }

  try {
    // Buscar usuarios en Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${encodeURIComponent(name)}')&$select=displayName,mail,jobTitle&$top=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[searchUser] Graph API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = (await response.json()) as { value?: Array<{ displayName?: string; mail?: string; jobTitle?: string }> };
    
    if (data.value && data.value.length > 0) {
      // Buscar el mejor match (coincidencia exacta o más cercana)
      const exactMatch = data.value.find(u => 
        u.displayName?.toLowerCase() === name.toLowerCase()
      );
      const user = exactMatch || data.value[0];
      
      return {
        nombre: user.displayName || "",
        email: user.mail || "",
        cargo: user.jobTitle || "",
      };
    }

    return null;
  } catch (error) {
    console.error("[searchUser] Error:", error);
    return null;
  }
}
