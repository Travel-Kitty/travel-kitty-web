import React from "react";
import TanstackQueryProvider from "@/lib/tanstack-query";

export default function TripLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="!cursor-auto">
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </div>
  );
}
