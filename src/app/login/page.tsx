"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid PIN");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
        <h1
          className="mb-1 text-xl font-semibold text-[#222222]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Allen&apos;s Calendar
        </h1>
        <p className="mb-6 text-sm text-[#888888]">
          Enter your PIN to continue
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoFocus
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-[#FF453A]">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !pin}
            className="h-9 w-full bg-[#FEF991] text-[#222222] hover:bg-[#fef460] border-[#FEF991] font-medium"
          >
            {loading ? "Verifying..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
