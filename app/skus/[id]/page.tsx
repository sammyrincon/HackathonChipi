import { getChipiServer } from "@chipi-stack/nextjs/server";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { BuySkuDialog } from "@/components/skus/buy-sku.dialog";

export default async function SkuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: skuId } = await params;
  const { userId: externalUserId } = await auth();
  const chipiServer = getChipiServer();
  const sku = await chipiServer.getSku(skuId);
  const walletResponse = await chipiServer.getWallet({
    externalUserId: externalUserId || "",
  });

  if (!walletResponse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!sku) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-center gap-2">
            <img
              src="https://chipi-carriers-public.s3.us-west-2.amazonaws.com/1/logotipo.png"
              alt={sku.name}
              width={200}
              height={200}
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold">{sku.name}</h1>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {sku.fixedAmount
                ? `$${(sku.fixedAmount ?? 0 / 100).toFixed(2)}`
                : "Flexible amount"}
            </span>
            <span className="text-muted-foreground text-xl">MXN</span>
          </div>
        </CardContent>
        <CardFooter>
          <BuySkuDialog sku={sku} walletResponse={walletResponse} />
        </CardFooter>
      </Card>
    </div>
  );
}
