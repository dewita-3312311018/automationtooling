import { useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "../../location/components/location-picker";
import { useCreateStock } from "../api/use-create-stock";
import { useUpdateStock } from "../api/use-update-stock";
import type { StockInfo } from "../types";
import { UNITS_OF_MEASUREMENT } from "../stock-create-page";

const stockSchema = z.object({
  modelNumber: z.string().min(1, "Model number is required"),
  description: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  uom: z.string().min(1, "Unit of measurement is required"),
  projectType: z.string().optional(),
  type: z.enum(["mechanical", "electrical"]),
  minStockLevel: z.number().min(0, "Min stock level must be at least 0"),
  locations: z.array(z.object({
    locationId: z.string().min(1, "Location is required"),
    quantity: z.number().min(0, "Quantity must be at least 0")
  })).min(1, "Please assign at least one storage location"),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface StockFormProps {
  initialData?: StockInfo & { locations?: { locationId: string, quantity: number }[] };
}

function StockForm({ initialData }: StockFormProps) {
  const navigate = useNavigate();
  const isEdit = !!initialData;
  const { mutate: createStock, isPending: isCreating } = useCreateStock();
  const { mutate: updateStock, isPending: isUpdating } = useUpdateStock(initialData?.id || "");

  const isPending = isCreating || isUpdating;

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      modelNumber: initialData?.modelNumber || "",
      description: initialData?.description || "",
      brand: initialData?.brand || "",
      uom: initialData?.uom || "pcs",
      projectType: initialData?.projectType || "",
      type: initialData?.type || "mechanical",
      minStockLevel: initialData?.minStockLevel || 5,
      locations: initialData?.locations || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations"
  });

  const onSubmit = (values: StockFormValues) => {
    if (isEdit) {
      updateStock(values, {
        onSuccess: () => {
          toast.success("Stock item updated successfully.");
          navigate({ to: "/stock" });
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update stock item.");
        },
      });
    } else {
      createStock(values, {
        onSuccess: () => {
          toast.success("Stock item created successfully.");
          navigate({ to: "/stock" });
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create stock item.");
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate({ to: "/stock" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Stock Item" : "Create New Stock"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isEdit
              ? "Update details for an existing stock item."
              : "Add a new stock item to your inventory."}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="px-8 pb-6 bg-muted/10 border-b border-border/40">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Stock Information
            </CardTitle>
            <CardDescription className="text-sm mt-1.5">
              Please provide the primary details for this stock item.
            </CardDescription>
          </CardHeader>

          <CardContent className="py-4">
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="modelNumber" className="text-sm font-medium">
                    Model Number <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="modelNumber"
                    placeholder="e.g. SENS-01X"
                    {...form.register("modelNumber")}
                    disabled={isPending}
                  />
                  {form.formState.errors.modelNumber && (
                    <FieldError>{form.formState.errors.modelNumber.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="brand" className="text-sm font-medium">
                    Brand / Manufacturer <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="brand"
                    placeholder="e.g. Siemens"
                    {...form.register("brand")}
                    disabled={isPending}
                  />
                  {form.formState.errors.brand && (
                    <FieldError>{form.formState.errors.brand.message}</FieldError>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-muted-foreground font-normal">(Optional)</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Detailed usage or technical specifications..."
                  className="resize-y"
                  rows={3}
                  {...form.register("description")}
                  disabled={isPending}
                />
                {form.formState.errors.description && (
                  <FieldError>{form.formState.errors.description.message}</FieldError>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="type" className="text-sm font-medium">
                    Equipment Type
                  </FieldLabel>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(val) => form.setValue("type", val as "mechanical" | "electrical", { shouldValidate: true })}
                    disabled={isPending}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <FieldError>{form.formState.errors.type.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="projectType" className="text-sm font-medium">
                    Project / Department <span className="text-muted-foreground font-normal">(Optional)</span>
                  </FieldLabel>
                  <Input
                    id="projectType"
                    placeholder="e.g. Automation AI"
                    {...form.register("projectType")}
                    disabled={isPending}
                  />
                  {form.formState.errors.projectType && (
                    <FieldError>{form.formState.errors.projectType.message}</FieldError>
                  )}
                </Field>
              </div>

              <div className="space-y-4 rounded-md border p-4 bg-muted/10 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Storage Locations</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Map to locations and define available quantities</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background"
                    onClick={() => append({ locationId: "", quantity: 0 })}
                    disabled={isPending}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Location
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md bg-transparent">
                    No locations added yet.
                  </div>
                )}
                {form.formState.errors.locations?.root && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.locations.root.message}
                  </p>
                )}
                {form.formState.errors.locations?.message && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.locations.message}
                  </p>
                )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <Field className="flex-1">
                        <LocationPicker
                          value={form.watch(`locations.${index}.locationId`)}
                          onChange={(val) => form.setValue(`locations.${index}.locationId`, val, { shouldValidate: true })}
                          disabled={isPending}
                        />
                        {form.formState.errors.locations?.[index]?.locationId && (
                          <FieldError>{form.formState.errors.locations[index]?.locationId?.message}</FieldError>
                        )}
                      </Field>

                      <Field className="w-32">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Qty"
                          {...form.register(`locations.${index}.quantity`, { valueAsNumber: true })}
                          disabled={isPending}
                        />
                        {form.formState.errors.locations?.[index]?.quantity && (
                          <FieldError>{form.formState.errors.locations[index]?.quantity?.message}</FieldError>
                        )}
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => remove(index)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="uom" className="text-sm font-medium">
                    Unit of Measurement <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={form.watch("uom")}
                    onValueChange={(val) => form.setValue("uom", val, { shouldValidate: true })}
                    disabled={isPending}
                  >
                    <SelectTrigger id="uom" className="w-full">
                      <SelectValue placeholder="Select UoM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNITS_OF_MEASUREMENT).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.uom && (
                    <FieldError>{form.formState.errors.uom.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="minStockLevel" className="text-sm font-medium">
                    Minimum Stock Threshold
                  </FieldLabel>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...form.register("minStockLevel", { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {form.formState.errors.minStockLevel && (
                    <FieldError>{form.formState.errors.minStockLevel.message}</FieldError>
                  )}
                </Field>
              </div>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-6"
              onClick={() => navigate({ to: "/stock" })}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-11 px-8 shadow-sm">
              {isPending ? (
                isEdit ? "Updating..." : "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Update Stock" : "Save Inventory Entry"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export { StockForm };
export type { StockFormValues };
