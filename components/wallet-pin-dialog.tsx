"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
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

  useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  const handleOpenChange = (v: boolean) => {
    if (!v) onCancel();
  };

  const handleSubmit = () => {
    if (pin.length !== 4) return;
    setIsSubmitting(true);
    onSubmit(pin);
    setPin("");
    setIsSubmitting(false);
  };

  const canSubmit = pin.length === 4 && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex w-full max-w-sm flex-col items-center border-2 border-[#111111] bg-[#F9F9F7] p-6 shadow-[6px_6px_0px_0px_#111111] sm:p-8 [&>:not(button)]:w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => onCancel()}
      >
        <div className="flex w-full flex-col items-center gap-4">
          <DialogHeader className="flex flex-col items-center gap-3 text-center [&>*]:text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#111111] bg-[#CC0000]/10">
              <Lock className="h-6 w-6 text-[#CC0000]" aria-hidden />
            </div>
            <DialogTitle className="font-headline text-xl font-bold tracking-tight text-[#111111]">
              Enter your PIN
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-[#111111]/70">
              Your wallet is protected. Enter the 4-digit PIN to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex w-full flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="pin-otp" className="font-mono-data text-xs font-medium uppercase tracking-widest text-[#111111]/80">
                PIN (4 digits)
              </Label>
              <InputOTP
                id="pin-otp"
                maxLength={4}
                value={pin}
                type="password"
                onChange={setPin}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="off"
                containerClassName="justify-center"
                className="font-mono-data text-lg tabular-nums"
              >
                <InputOTPGroup className="gap-2 rounded-none border-0 bg-transparent">
                  <InputOTPSlot
                    index={0}
                    className="h-12 w-12 rounded-none border-2 border-[#111111] bg-white font-semibold text-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-colors focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 data-[active=true]:border-[#CC0000] data-[active=true]:ring-2 data-[active=true]:ring-[#CC0000]/20"
                  />
                  <InputOTPSlot
                    index={1}
                    className="h-12 w-12 rounded-none border-2 border-[#111111] bg-white font-semibold text-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-colors focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 data-[active=true]:border-[#CC0000] data-[active=true]:ring-2 data-[active=true]:ring-[#CC0000]/20"
                  />
                  <InputOTPSlot
                    index={2}
                    className="h-12 w-12 rounded-none border-2 border-[#111111] bg-white font-semibold text-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-colors focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 data-[active=true]:border-[#CC0000] data-[active=true]:ring-2 data-[active=true]:ring-[#CC0000]/20"
                  />
                  <InputOTPSlot
                    index={3}
                    className="h-12 w-12 rounded-none border-2 border-[#111111] bg-white font-semibold text-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-colors focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 data-[active=true]:border-[#CC0000] data-[active=true]:ring-2 data-[active=true]:ring-[#CC0000]/20"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </div>

        <DialogFooter className="w-full flex-row gap-2 border-t border-[#111111]/10 pt-6 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-none border-2 border-[#111111] bg-transparent font-medium text-[#111111] hover:bg-[#111111]/10 hover:text-[#111111] sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex-1 rounded-none border-2 border-[#111111] bg-[#111111] font-medium text-white hover:bg-[#111111]/90 hover:shadow-[4px_4px_0px_0px_#111111] disabled:opacity-50 sm:flex-initial"
          >
            {isSubmitting ? "Verifying…" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
