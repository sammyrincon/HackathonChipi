"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useCreateWallet, Chain } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";

const FormSchema = z
  .object({
    pin: z.string().min(4, {
      message: "PIN must be 4 characters.",
    }),
    confirmPin: z.string().min(4, {
      message: "Confirm PIN must be 4 characters.",
    }),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs don't match",
    path: ["confirmPin"],
  });

export function CreateWalletDialog({
  onSuccess,
  hasExistingWallet = false,
}: {
  onSuccess?: () => void;
  /** When true, we NEVER call createWallet — safety guard to avoid overwriting funded wallets. */
  hasExistingWallet?: boolean;
}) {
  const { getToken, userId: clerkUserId } = useAuth();
  const [open, setOpen] = useState(false);
  const { createWalletAsync, isLoading } = useCreateWallet();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (hasExistingWallet) {
      toast.error("A wallet already exists. Do not regenerate.");
      return;
    }
    const token = await getToken();
    if (!token || !clerkUserId) {
      toast.error("Authentication failed");
      return;
    }

    try {
      await createWalletAsync({
        params: {
          encryptKey: data.pin,
          externalUserId: clerkUserId,
          chain: Chain.STARKNET,
        },
        bearerToken: token,
      });
      // Call onSuccess first (e.g. persist stage + reload) so it runs before dialog closes
      onSuccess?.();
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create wallet");
      console.error("Wallet creation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Wallet</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Wallet</DialogTitle>
          <DialogDescription>
            Create a PIN to protect your wallet and funds
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter PIN</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm PIN</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating…" : "Create Wallet"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
