"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function HomePageDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-md border-white/20 bg-transparent font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          Learn more
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg border-[#111111]/20 bg-newsprint text-[#111111] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-lg font-semibold">
            What is ZeroPass?
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-[#111111]/80">
            ZeroPass issues a privacy-preserving credential on Starknet. Complete KYC once,
            receive a verifiable credential linked to your Chipi wallet, and prove your identity
            anywhere without sharing personal data.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
