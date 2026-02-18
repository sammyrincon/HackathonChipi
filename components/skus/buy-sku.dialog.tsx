"use client";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";
import {
  GetWalletResponse,
  Sku,
  usePurchaseSku,
  Chain,
  ChainToken,
} from "@chipi-stack/nextjs";
import { Currency } from "@chipi-stack/types";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";

export function BuySkuDialog({
  sku,
  walletResponse,
}: {
  sku: Sku;
  walletResponse: GetWalletResponse;
}) {
  const [showPin, setShowPin] = useState(false);
  const { getToken } = useAuth();
  // const { data: userWallet } = useGetWallet({
  //   getBearerToken: getToken,
  //   params: {
  //     externalUserId: clerkUserId || "",
  //   },
  // });
  const {
    purchaseSkuAsync,
    data: purchasedSkuTransaction,
    error: purchaseSkuError,
  } = usePurchaseSku();

  // Create dynamic schema based on SKU validation rules
  const FormSchema = useMemo(() => {
    return z.object({
      reference: z
        .string()
        .min(1, {
          message: "Reference is required",
        })
        .regex(new RegExp(sku.referenceRegexValidation), {
          message: `Invalid format. ${sku.referenceLabel || "Please check your reference"}`,
        }),
      amount: z
        .string()
        .min(1, {
          message: "Amount is required",
        })
        .regex(new RegExp(sku.amountRegexValidation), {
          message: `Invalid format. ${sku.amountLabel || "Please check your amount"}`,
        }),
    });
  }, [
    sku.referenceRegexValidation,
    sku.amountRegexValidation,
    sku.referenceLabel,
    sku.amountLabel,
  ]);

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reference: "",
      amount: sku.fixedAmount?.toString() || "",
    },
  });

  console.log("form errors", form.formState.errors);

  const onSubmit = (data: FormValues) => {
    console.log("Form validated data:", data);
    setShowPin(true);
  };

  const handlePinSubmit = async (pin: string) => {
    const token = await getToken();
    if (!token) {
      toast.error("Submit failed");
      return;
    }

    const { reference, amount } = form.getValues();

    try {
      await purchaseSkuAsync({
        params: {
          skuId: sku.id,
          skuReference: reference,
          currencyAmount: Number(amount),
          currency: Currency.MXN,
          chain: Chain.STARKNET,
          token: ChainToken.USDC,
          encryptKey: pin,
          wallet: {
            publicKey: walletResponse.publicKey,
            encryptedPrivateKey: walletResponse.encryptedPrivateKey,
          },
        },
        bearerToken: token,
      });
      toast.success("Transaction created successfully!");
    } catch (error) {
      toast.error("Failed to create sku transaction");
      console.error(error);
    }
    setShowPin(false);
  };

  return (
    <>
      {/* PIN Dialog */}
      <WalletPinDialog
        open={showPin}
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPin(false)}
      />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Buy</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {sku.name}</DialogTitle>
            <DialogDescription>Pay this with your wallet</DialogDescription>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {sku.referenceLabel || "Payment Reference"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={
                            sku.referenceLabel || "Payment Reference"
                          }
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sku.amountLabel || "Amount"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={sku.amountLabel || "Amount"}
                          required
                          disabled={!!sku.fixedAmount}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Buy Product</Button>
              </form>
            </Form>
          </DialogHeader>

          <DialogFooter>
            {purchasedSkuTransaction && (
              <Alert>
                <CheckCircleIcon />
                <AlertTitle>Transaction Created Successfully!</AlertTitle>
                <AlertDescription>
                  <p>Transaction ID: {purchasedSkuTransaction.id}</p>
                  <p>
                    Status:{" "}
                    {purchasedSkuTransaction.skuStatus ||
                      purchasedSkuTransaction.status}
                  </p>
                  <p>
                    Amount: {purchasedSkuTransaction.skuPurchaseAmount}{" "}
                    {purchasedSkuTransaction.skuPurchaseCurrency}
                  </p>
                </AlertDescription>
              </Alert>
            )}
            {purchaseSkuError && (
              <Alert>
                <AlertTitle>Errors</AlertTitle>
                <AlertDescription>
                  <p>{purchaseSkuError.message}</p>
                </AlertDescription>
              </Alert>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
