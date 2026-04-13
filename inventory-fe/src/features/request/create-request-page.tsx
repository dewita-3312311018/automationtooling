import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send, Package, AlertCircle, FileText, Hash, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { StockPicker } from "@/features/stock/components/stock-picker";
import { useCreateRequest } from "./api/use-create-request";
import { toast } from "sonner";
import type { RequestUrgency } from "./types";

const requestSchema = z
  .object({
    requestType: z.enum(["existing", "new"]),
    stockId: z.string().optional(),
    requestedModelNumber: z.string().optional(),
    requestedBrand: z.string().optional(),
    requestedDescription: z.string().optional(),
    quantity: z
      .union([z.string(), z.number()])
      .transform((val) => (val === "" ? "" : Number(val)))
      .refine((val) => val !== "" && Number(val) > 0, {
        message: "Quantity must be at least 1",
      }),
    urgency: z.enum(["low", "normal", "high"]),
    note: z.string().optional(),
    eta: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requestType === "existing" && !data.stockId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a stock item",
        path: ["stockId"],
      });
    }
    if (data.requestType === "new") {
      if (!data.requestedModelNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model number is required",
          path: ["requestedModelNumber"],
        });
      }
      if (!data.requestedBrand) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Brand is required",
          path: ["requestedBrand"],
        });
      }
    }
    if (data.eta && data.eta.trim() !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(data.eta.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a valid date",
        path: ["eta"],
      });
    }
  });

function CreateRequestPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateRequest();

  const form = useForm<z.input<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: "existing",
      stockId: "",
      requestedModelNumber: "",
      requestedBrand: "",
      requestedDescription: "",
      quantity: "",
      urgency: "normal",
      note: "",
      eta: "",
    },
  });

  const onSubmit = (values: z.input<typeof requestSchema>) => {
    // We can safely cast because the refine schema guarantees it's a number > 0 on valid submit
    const parsedQuantity = Number(values.quantity);

    mutate(
      {
        stockId: values.requestType === "existing" ? values.stockId : undefined,
        requestedModelNumber:
          values.requestType === "new" ? values.requestedModelNumber : undefined,
        requestedBrand: values.requestType === "new" ? values.requestedBrand : undefined,
        requestedDescription:
          values.requestType === "new" ? values.requestedDescription : undefined,
        quantity: parsedQuantity,
        urgency: values.urgency as RequestUrgency,
        note: values.note || undefined,
        eta: values.eta?.trim() ? values.eta.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Request submitted successfully!");
          navigate({ to: "/requests" });
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit request.");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Request</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Submit a formal request for stock procurement.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-md">
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
          <CardHeader className="px-8 pb-6 bg-muted/10 border-b border-border/40">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Request Information
            </CardTitle>
            <CardDescription className="text-sm mt-1.5">
              Please provide accurate details for your procurement request to ensure timely
              processing.
            </CardDescription>
          </CardHeader>

          <CardContent className="py-4">
            <FieldGroup>
              <Tabs
                value={form.watch("requestType")}
                onValueChange={(val: string) => {
                  form.setValue("requestType", val as "existing" | "new");
                  form.clearErrors();
                }}
                className="w-full mb-6"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="existing">Existing Item</TabsTrigger>
                  <TabsTrigger value="new">New Item Request</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="stockId" className="text-sm font-medium flex items-center">
                      Stock Item
                    </FieldLabel>
                    <StockPicker
                      value={form.watch("stockId")}
                      onChange={(val) => form.setValue("stockId", val, { shouldValidate: true })}
                      disabled={isPending}
                    />
                    {form.formState.errors.stockId && (
                      <FieldError>{form.formState.errors.stockId.message}</FieldError>
                    )}
                  </Field>
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="requestedModelNumber" className="text-sm font-medium">
                        Model Number <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="requestedModelNumber"
                        placeholder="e.g. MOD-1234"
                        {...form.register("requestedModelNumber")}
                        disabled={isPending}
                      />
                      {form.formState.errors.requestedModelNumber && (
                        <FieldError>
                          {form.formState.errors.requestedModelNumber.message}
                        </FieldError>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="requestedBrand" className="text-sm font-medium">
                        Brand <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="requestedBrand"
                        placeholder="e.g. Siemens"
                        {...form.register("requestedBrand")}
                        disabled={isPending}
                      />
                      {form.formState.errors.requestedBrand && (
                        <FieldError>{form.formState.errors.requestedBrand.message}</FieldError>
                      )}
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="requestedDescription" className="text-sm font-medium">
                      Description{" "}
                      <span className="text-muted-foreground font-normal">(Optional)</span>
                    </FieldLabel>
                    <Input
                      id="requestedDescription"
                      placeholder="Brief description of the item"
                      {...form.register("requestedDescription")}
                      disabled={isPending}
                    />
                  </Field>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="quantity"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    Quantity
                  </FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    className="font-medium"
                    {...form.register("quantity")}
                    disabled={isPending}
                  />
                  {form.formState.errors.quantity && (
                    <FieldError>{form.formState.errors.quantity.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="urgency"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    Urgency Level
                  </FieldLabel>
                  <Select
                    value={form.watch("urgency")}
                    onValueChange={(val) =>
                      form.setValue("urgency", val as "low" | "normal" | "high", {
                        shouldValidate: true,
                      })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger id="urgency" className="w-full">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Routine Stock</SelectItem>
                      <SelectItem value="normal">Normal - Standard Priority</SelectItem>
                      <SelectItem value="high">High - Urgent Requirement</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.urgency && (
                    <FieldError>{form.formState.errors.urgency.message}</FieldError>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="eta" className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  Expected arrival (ETA){" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </FieldLabel>
                <Input
                  id="eta"
                  type="date"
                  className="max-w-xs"
                  {...form.register("eta")}
                  disabled={isPending}
                />
                {form.formState.errors.eta && (
                  <FieldError>{form.formState.errors.eta.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="note" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Notes / Justification
                </FieldLabel>
                <Textarea
                  id="note"
                  placeholder="Provide any context, project name, or justification for this request..."
                  rows={4}
                  className="resize-y"
                  {...form.register("note")}
                  disabled={isPending}
                />
                {form.formState.errors.note && (
                  <FieldError>{form.formState.errors.note.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="ghost" type="button" asChild className="h-11 px-6">
              <Link to="/requests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending} className="h-11 px-8 shadow-sm">
              {isPending ? (
                "Submitting..."
              ) : (
                <>
                  Submit Request
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export { CreateRequestPage };
