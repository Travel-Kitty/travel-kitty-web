/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOcrExtract } from "@/hooks/handler-request/use-ocr";
import { cn } from "@/lib/utils";

// ---- Schema: currency berlaku global untuk semua harga ----
const ItemSchema = z.object({
  name: z.string().min(1, "Required"),
  qty: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().positive("Must be > 0").optional()
  ),
  unitPrice: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().nonnegative(">= 0").optional()
  ),
});

const FormSchema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  currency: z.string().min(2).max(6), // allow e.g., "IDR", "USD", "SGD", "RM"
  image: z.instanceof(File).optional(),
  hint: z.string().optional(),
  items: z.array(ItemSchema).default([]),
});
export type ReceiptCreateForm = z.infer<typeof FormSchema>;

export function ReceiptCreateDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitFinal: (payload: ReceiptCreateForm) => Promise<void> | void;
}) {
  const { open, onOpenChange, onSubmitFinal } = props;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ReceiptCreateForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", currency: "USD", items: [], hint: "" },
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const ocr = useOcrExtract();

  // ---- Drop & click to upload ----
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onPick = useCallback(() => inputRef.current?.click(), []);
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) {
        form.setValue("image", f, { shouldValidate: true });
      }
    },
    [form]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
        form.setValue("image", f, { shouldValidate: true });
      }
    },
    [form]
  );

  // ---- Build preview URL ----
  useEffect(() => {
    const f = form.getValues("image");
    if (!f) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    // cleanup on unmount or image change
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.watch("image")]);

  // ---- Extract via OCR then map to form items/currency ----
  const handleExtract = useCallback(async () => {
    const f = form.getValues("image");
    if (!f) return;
    const hint = form.getValues("hint");
    const res = await ocr.mutateAsync({ file: f, hint: hint || undefined });

    // currency (fallback keep previous)
    if (res?.currency) {
      form.setValue("currency", String(res.currency).toUpperCase());
    }

    // items map
    const items = Array.isArray(res?.items) ? res.items : [];
    const mapped = items
      .filter((it) => !!it?.name)
      .map((it) => ({
        name: String(it.name),
        qty: it.qty ?? undefined,
        unitPrice: it.price ?? undefined,
      }));

    if (mapped.length > 0) {
      form.setValue("items", mapped, { shouldValidate: true });
    }
  }, [form, ocr]);

  // ---- Submit final (kembali ke parent) ----
  const onSubmit = useCallback(
    async (values: ReceiptCreateForm) => {
      await onSubmitFinal(values);
      onOpenChange(false);
      form.reset({
        name: "",
        currency: "USD",
        items: [],
        hint: "",
        image: undefined,
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    },
    [onSubmitFinal, onOpenChange, form, previewUrl]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Trip</DialogTitle>
          <DialogDescription>
            Fill in the trip name, upload a receipt image (optional), and
            extract line items.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bali Offsite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency applies to all prices */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD / IDR / SGD / EUR ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload area */}
            <div className="space-y-2">
              <Label>Receipt image (optional)</Label>
              <div
                onClick={onPick}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className={cn(
                  "relative flex h-36 w-full cursor-pointer items-center justify-center rounded-md border border-dashed",
                  "border-neutral-700 hover:bg-neutral-900/40"
                )}
              >
                {!previewUrl ? (
                  <div className="text-center text-sm text-neutral-400">
                    Letakkan file Excel Anda di sini
                    <br />
                    atau <span className="underline">pilih file</span> dari
                    komputer Anda
                    <div className="text-xs opacity-70">
                      Format didukung: .jpg, .jpeg, .png
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-full w-full object-contain rounded-md"
                  />
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Optional hint for OCR, e.g., 'prices in IDR'"
                  {...form.register("hint")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!form.getValues("image") || ocr.isPending}
                  onClick={handleExtract}
                >
                  {ocr.isPending ? "Extracting…" : "Extract Image"}
                </Button>
              </div>
              {ocr.isError && (
                <p className="text-sm text-red-400">
                  {(ocr.error as Error)?.message ?? "OCR failed"}
                </p>
              )}
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <Label>Items</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Name</TableHead>
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
                      <TableCell colSpan={4} className="text-neutral-400">
                        No items. Add rows manually or extract from image.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((f, idx) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <Input
                            placeholder="Item name"
                            {...form.register(`items.${idx}.name` as const)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="Qty"
                            {...form.register(`items.${idx}.qty` as const)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...form.register(
                              `items.${idx}.unitPrice` as const
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(idx)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    append({ name: "", qty: undefined, unitPrice: undefined })
                  }
                >
                  Add Row
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
