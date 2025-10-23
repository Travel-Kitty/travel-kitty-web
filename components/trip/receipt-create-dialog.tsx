"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const DialogAction = dynamic(() => import("@/components/ui/dialog-action"), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { CustomField } from "@/components/ui/form-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageUpload } from "@/components/ui/image-upload";

import { useOcrExtract } from "@/hooks/handler-request/use-ocr";

const FormSchema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  currency: z.string().min(2).max(6),
  image: z.instanceof(File).optional(),
  hint: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Required"),
        qty: z.number().min(1, "Must be > 0"),
        unitPrice: z.number().min(0, ">= 0"),
      })
    )
    .min(1, "At least one item is required"),
  total: z.number().min(0, "Must be >= 0"),
});
export type ReceiptCreateForm = z.infer<typeof FormSchema>;

export function ReceiptCreateDialog(
  props: Readonly<{
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSubmitFinal: (payload: ReceiptCreateForm) => Promise<void> | void;
  }>
) {
  const { open, onOpenChange, onSubmitFinal } = props;
  const form = useForm<ReceiptCreateForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      items: [],
      hint: "",
      image: undefined,
      total: 0,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const ocr = useOcrExtract();
  const itemsWatch = form.watch("items");
  const itemsJson = JSON.stringify(itemsWatch);
  const total = useMemo(() => {
    return (itemsWatch || []).reduce((sum, it) => {
      const q = Number(it?.qty ?? 0) || 0;
      const p = Number(it?.unitPrice ?? 0) || 0;
      return sum + q * p;
    }, 0);
  }, [itemsJson]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isFinite(n) ? n : 0);

  const handleExtract = useCallback(async () => {
    const file = form.getValues("image");
    if (!file) return;

    const hint = form.getValues("hint");
    const res = await ocr.mutateAsync({ file, hint: hint || undefined });
    if (res?.currency) {
      form.setValue("currency", String(res.currency).toUpperCase());
    }
    const items = Array.isArray(res?.items) ? res.items : [];
    const mapped = items
      .filter((it) => !!it?.name)
      .map((it) => ({
        name: String(it.name),
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.price) || 0,
      }));

    if (mapped.length > 0) {
      form.setValue("items", mapped, { shouldValidate: true });
    }
  }, [form, ocr]);

  const onSubmit = async (values: ReceiptCreateForm) => {
    try {
      await onSubmitFinal({ ...values, total });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("ReceiptCreateDialog: onSubmit error", error);
    }
  };

  return (
    <DialogAction
      className="min-w-xl w-full max-h-11/12 overflow-y-auto"
      title="Create Trip"
      description="Fill in the trip name, upload a receipt image, and extract line items."
      isOpen={open}
      onClose={() => onOpenChange(false)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomField
            control={form.control}
            name="name"
            label="Trip name"
            primary
            render={({ field }) => (
              <Input placeholder="e.g., Bali Offsite" {...field} />
            )}
          />
          <CustomField
            control={form.control}
            name="currency"
            label="Currency"
            primary
            render={({ field }) => (
              <Input placeholder="USD / IDR / SGD / EUR ..." {...field} />
            )}
          />
          <CustomField
            control={form.control}
            name="image"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                label="Receipt image"
              />
            )}
          />

          <div className="flex justify-between items-end gap-2">
            <CustomField
              control={form.control}
              name="hint"
              label="OCR Hint"
              className="w-full"
              render={({ field }) => (
                <Input
                  placeholder="e.g., 'prices in IDR' or 'handwritten receipt'"
                  {...field}
                />
              )}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={
                !form.watch("image") ||
                ocr.isPending ||
                form.formState.isSubmitting
              }
              onClick={handleExtract}
              className="whitespace-nowrap"
            >
              {ocr.isPending ? "Extracting…" : "Extract Image"}
            </Button>
          </div>

          {ocr.isError && (
            <p className="text-sm text-red-400">
              {(ocr.error as Error)?.message ?? "OCR failed"}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label>Items</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ name: "", qty: 1, unitPrice: 0 })}
                disabled={form.formState.isSubmitting || ocr.isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Item Name</TableHead>
                    <TableHead className="w-[15%]">Qty</TableHead>
                    <TableHead className="w-[25%]">
                      Unit Price ({form.watch("currency")})
                    </TableHead>
                    <TableHead className="w-[15%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-neutral-400 py-8"
                      >
                        No items yet. Add rows manually or extract from image.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, idx) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <CustomField
                            control={form.control}
                            name={`items.${idx}.name`}
                            render={({ field }) => (
                              <Input placeholder="Item name" {...field} />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <CustomField
                            control={form.control}
                            name={`items.${idx}.qty`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="1"
                                min="1"
                                placeholder="1"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? "" : Number(value)
                                  );
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <CustomField
                            control={form.control}
                            name={`items.${idx}.unitPrice`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? "" : Number(value)
                                  );
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end pt-3">
              <div className="text-right">
                <div className="text-sm text-neutral-400">
                  Total ({form.watch("currency")})
                </div>
                <div className="text-xl font-semibold">{fmt(total)}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting || ocr.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || ocr.isPending}
            >
              {form.formState.isSubmitting ? "Saving…" : "Create Trip"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogAction>
  );
}
