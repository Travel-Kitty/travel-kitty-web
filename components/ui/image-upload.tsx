"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  label?: string;
  accept?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  accept = "image/*",
  className,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPick = useCallback(() => inputRef.current?.click(), []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onChange(file);
      }
    },
    [onChange]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onChange(file);
      }
    },
    [onChange]
  );

  const onRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onChange]
  );

  // Build preview URL
  useEffect(() => {
    if (!value) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value, previewUrl]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div
        onClick={onPick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "relative flex h-36 w-full cursor-pointer items-center justify-center rounded-md border border-dashed",
          "border-neutral-700 dark:hover:bg-neutral-900/40 hover:bg-neutral-200/40 transition-colors"
        )}
      >
        {!previewUrl ? (
          <div className="text-center text-sm text-neutral-400 p-4">
            Drag and drop your image here
            <br />
            or <span className="underline">select file</span> from your computer
            <div className="text-xs opacity-70 mt-1">
              Supported formats: .jpg, .jpeg, .png
            </div>
          </div>
        ) : (
          <>
            <img
              src={previewUrl}
              alt="preview"
              className="h-full w-full object-contain rounded-md"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
              title="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
