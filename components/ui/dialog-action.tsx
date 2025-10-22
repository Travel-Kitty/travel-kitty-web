"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Separator } from "../ui/separator";
import { X } from "lucide-react";

type CustomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

function DialogAction({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: CustomDialogProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-description" : undefined}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Overlay supports dark mode */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/60 transition-opacity" />

      {/* Click outside to close */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={[
            "relative w-full max-w-md transform overflow-hidden rounded-xl",
            "border border-border bg-background p-6 text-foreground shadow-lg transition-all",
            className || "",
          ].join(" ")}
        >
          <div
            className={`flex items-start justify-between ${
              title ? "mb-6" : ""
            }`}
          >
            <div className="min-w-0">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-base font-semibold leading-none tracking-tight"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id="dialog-description"
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={[
                "ml-4 inline-flex h-8 w-8 items-center justify-center rounded-md",
                "text-muted-foreground hover:text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "ring-offset-background transition-colors",
              ].join(" ")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {title && <Separator className="mb-0" />}

          <div className={title ? "pt-6" : ""}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DialogAction;
