"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <AlertCircle className="h-14 w-14 shrink-0 text-[#CC0000]" aria-hidden />
      <h1 className="mt-6 font-headline text-2xl font-bold uppercase tracking-tight text-[#111111] md:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md font-body text-[#111111]/70">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button
          type="button"
          onClick={() => reset()}
          variant="outline"
          className="rounded-none border-2 border-[#111111] font-semibold uppercase tracking-wide hover:bg-[#111111] hover:text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button
          asChild
          className="rounded-none bg-[#111111] font-semibold uppercase tracking-wide text-white hover:bg-[#111111]/90"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
