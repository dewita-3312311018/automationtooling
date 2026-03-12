import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUser } from "../api/use-create-user";

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useCreateUser();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setName("");
      setUsername("");
      setPassword("");
    }
  };

  const onSubmit = () => {
    if (!name || !username || !password || password.length < 6) {
      toast.error("Please fill in all fields (password min 6 chars).");
      return;
    }

    mutate(
      { name, username, password },
      {
        onSuccess: () => {
          toast.success("User account created successfully.");
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create user.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Staff Member</DialogTitle>
          <DialogDescription>
            Create an internal account for a new employee. They will use these credentials to log
            in.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={onSubmit}>
            {isPending ? "Creating..." : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CreateUserDialog };
