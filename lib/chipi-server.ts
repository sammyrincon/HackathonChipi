import {
  createChipiServer,
  getChipiServer,
} from "@chipi-stack/nextjs/server";

/**
 * Get the Chipi server instance, creating it from env if not yet initialized.
 * Use this in Server Components / API routes so getChipiServer() works even when
 * the layout's ChipiProvider runs in a different process (e.g. serverless).
 */
export function getOrCreateChipiServer() {
  try {
    return getChipiServer();
  } catch {
    const apiPublicKey = process.env.NEXT_PUBLIC_CHIPI_API_KEY;
    const apiSecretKey = process.env.CHIPI_SECRET_KEY;
    const alphaUrl = process.env.NEXT_PUBLIC_ALPHA_URL;
    if (!apiPublicKey || !apiSecretKey) {
      throw new Error(
        "Missing Chipi env: set NEXT_PUBLIC_CHIPI_API_KEY and CHIPI_SECRET_KEY"
      );
    }
    createChipiServer({
      apiPublicKey,
      apiSecretKey,
      ...(alphaUrl && { alphaUrl }),
    });
    return getChipiServer();
  }
}
