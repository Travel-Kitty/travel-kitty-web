import React from "react";

export default function FooterTrip() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items(center) justify-between gap-4 text-sm text-neutral-600 dark:text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>✨ Built on Base Sepolia</span>
            <span>·</span>
            <span>Web3 + AI Powered</span>
          </div>
          <p>
            © {new Date().getFullYear()} Travel Kitty. Split expenses instantly.
          </p>
        </div>
      </div>
    </footer>
  );
}
