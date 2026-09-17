export const API_URL = import.meta.env.VITE_API_URL || "/api";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options?: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "signin";
            }
          ) => void;
          prompt: (
            moment?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
        };
      };
    };
  }
}

export type GoogleAuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
};

export async function signInWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Google sign-in failed.");
  }

  return res.json();
}

/**
 * FedCM Migration Info:
 * - The Google One Tap UI is being deprecated in favor of Federated Credential Management (FedCM)
 * - FedCM provides better privacy by reducing cross-site tracking
 * - To opt-in to FedCM, ensure your Google credentials are configured correctly:
 *   1. Update your OAuth consent screen in Google Cloud Console
 *   2. Add your application domain to the authorized redirect URIs
 *   3. Test in Chrome with FedCM enabled
 * - For now, we use renderButton() as a transition approach
 * - See: https://developers.google.com/identity/gsi/web/guides/fedcm-migration
 */
