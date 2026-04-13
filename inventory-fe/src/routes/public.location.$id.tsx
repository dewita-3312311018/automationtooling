import { createFileRoute } from "@tanstack/react-router";
import { PublicLocationPage } from "@/features/location";

export const Route = createFileRoute("/public/location/$id")({
  component: PublicLocationPage,
});

