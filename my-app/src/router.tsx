import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  let isPopStateNavigation = false;
  let hasRendered = false;

  window.addEventListener("popstate", () => {
    isPopStateNavigation = true;
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: ({ location }) => {
      // Let the router restore cached positions for browser history entries.
      return isPopStateNavigation || Boolean(location.hash);
    },
    scrollRestorationBehavior: "auto",
    defaultPreloadStaleTime: 0,
  });

  router.subscribe("onRendered", ({ toLocation }) => {
    if (!hasRendered) {
      hasRendered = true;
      isPopStateNavigation = false;
      return;
    }

    if (!isPopStateNavigation && !toLocation.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }

    isPopStateNavigation = false;
  });

  return router;
};
