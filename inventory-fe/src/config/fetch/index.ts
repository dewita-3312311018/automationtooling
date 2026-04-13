import { createFetch } from "@better-fetch/fetch";
import { logout, getAuthToken } from "@/lib/auth";
import { env } from "@/config/env";
import { toast } from "sonner";
import { getRouter } from "@/router";

const $fetch = createFetch({
  baseURL: env.VITE_API_URL,
  auth: {
    type: "Bearer",
    token: getAuthToken,
  },
  onError: (context) => {
    const isLoginEndpoint = context.request.url.toString().endsWith("/auth/login");

    if (context.response.status === 401 && !isLoginEndpoint) {
      logout();
    }
    if (context.response.status === 403) {
      toast('You do not have permission to perform this action');
      const router = getRouter();

      router.navigate({ to: '/forbidden', replace: true });
    }
  },
});

export { $fetch };
