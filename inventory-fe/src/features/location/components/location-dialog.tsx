import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLocation } from "../api/use-create-location";
import { useUpdateLocation } from "../api/use-update-location";
import type { LocationInfo } from "../api/use-locations";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  floor: z.string().optional(),
});

type LocationSchema = z.infer<typeof locationSchema>;

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: LocationInfo;
}

function LocationDialog({ open, onOpenChange, location }: LocationDialogProps) {
  const { mutate: createLocation, isPending: isCreating } = useCreateLocation();
  const { mutate: updateLocation, isPending: isUpdating } = useUpdateLocation();

  const form = useForm<LocationSchema>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
      floor: "",
    },
  });

  useEffect(() => {
    if (location && open) {
      form.reset({
        name: location.name,
        description: location.description || "",
        floor: location.floor || "",
      });
    } else if (!open) {
      form.reset({
        name: "",
        description: "",
        floor: "",
      });
    }
  }, [location, open, form]);

  const onSubmit = (values: LocationSchema) => {
    if (location) {
      updateLocation(
        { id: location.id, ...values },
        {
          onSuccess: () => {
            toast.success("Location updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message || "Failed to update location"),
        }
      );
    } else {
      createLocation(values, {
        onSuccess: () => {
          toast.success("Location created successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Failed to create location"),
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Create New Location"}</DialogTitle>
          <DialogDescription>
            {location
              ? "Update the details of this storage area."
              : "Define a new physical area for inventory tracking."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id="location-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Aisle B, Shelf 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor / Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ground Floor, Basement 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Used for electrical components only"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" id="submit-location" form="location-form" disabled={isPending}>
            {isPending ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LocationDialog };
export type { LocationSchema };
