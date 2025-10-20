import React from "react";

export default function TripLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="!cursor-auto">{children}</div>;
}
