"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function WalletPinDialog({
  open,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(pin);
    setPin("");
    setIsSubmitting(false);
  };

  const disabled = pin?.length !== 4 || isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="border-2 border-[#111111] p-8">
        <DialogHeader>
          <DialogTitle className="font-headline text-[#111111]">Enter your PIN</DialogTitle>
          <DialogDescription className="font-body text-[#111111]/70">
            Your wallet is protected — enter your PIN to continue.
          </DialogDescription>
          <Label>PIN (4 digits)</Label>
          <InputOTP
            maxLength={4}
            value={pin}
            type="password"
            onChange={(value) => setPin(value)}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="off"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            disabled={disabled}
            onClick={handleSubmit}
            className="border-2 border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
