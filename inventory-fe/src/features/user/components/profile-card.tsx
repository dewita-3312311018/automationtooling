import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Shield, KeyRound, Pencil, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DialogTrigger } from "@/components/ui/dialog";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useUpdateProfile } from "@/features/profile";
import { toast } from "sonner";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

interface ProfileCardProps {
  user: {
    name: string | null;
    username: string;
    role: string | null;
  };
}

function ProfileCard({ user }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { mutate, isPending } = useUpdateProfile();

  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      username: user.username,
    },
  });

  const handleEdit = () => {
    form.reset({ name: user.name ?? "", username: user.username });
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: UpdateProfileSchema) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated successfully.");
        setIsEditing(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile.");
      },
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="min-w-[80px]"
              form="profile-form"
              type="submit"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md">
            <UserIcon className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            {user.role && (
              <Badge variant="secondary" className="mt-1 capitalize">
                {user.role}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {isEditing ? (
          <Form {...form}>
            <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium truncate">{user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{user.role ?? "—"}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center sm:items-end">
              <ChangePasswordDialog
                renderTrigger={
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="gap-2">
                        <KeyRound className="h-4 w-4" />
                        Change Password
                      </Button>
                    }
                  />
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ProfileCard };
