import React from "react";

export default function FloatingElement({
  children,
  delay = 0,
}: Readonly<{
  children: React.ReactNode;
  delay?: number;
}>) {
  return (
    <div className="animate-float" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
