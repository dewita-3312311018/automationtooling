import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/features/user";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
});

