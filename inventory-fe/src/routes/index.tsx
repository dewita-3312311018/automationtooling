import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: () => null,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({
        to: "/stock",
      });
    } else {
      throw redirect({
        to: "/login",
      });
    }
  },
});
