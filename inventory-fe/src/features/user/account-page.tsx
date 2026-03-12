import {
  Loader2,
} from "lucide-react";
import { useProfile } from "@/features/profile/api/use-profile";
import { ProfileCard } from "./components/profile-card";

function AccountPage() {
  const { data: response, isLoading: isLoadingProfile } = useProfile();

  const user = response;

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 space-y-8 p-8 max-w-2xl mx-auto">
      <div className="grid gap-8">
        <ProfileCard user={user} />
      </div>
    </div>
  );
}

export { AccountPage };
