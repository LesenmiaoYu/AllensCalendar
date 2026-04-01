"use client";

import { useRouter } from "next/navigation";
import { Cog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 sm:px-6">
      <h1
        className="text-lg font-semibold text-[#222222]"
        style={{ letterSpacing: "-0.02em" }}
      >
        Allen&apos;s Calendar
      </h1>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/settings")}
          aria-label="Settings"
        >
          <Cog className="size-4 text-[#222222]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="size-4 text-[#222222]" />
        </Button>
      </div>
    </header>
  );
}
