# Request a /kyc en Network

El request que aparece en la pestaña Network a **`/kyc`** (con initiator layout.tsx o similar) **no es un error**.

- **`/kyc`** es la **ruta de la página** (documento HTML). Next.js la solicita cuando:
  - El usuario hace clic en un enlace "Get Verified" / "Complete KYC" (navegación), o
  - Un `<Link href="/kyc">` entra en el viewport y Next.js hace **prefetch** por defecto.
- **`/api/kyc`** es el **endpoint de la API** que crea/actualiza la credencial (POST). Ese es el que debe usarse para crear la fila en Credential.

No hay ningún `fetch("/kyc")` en el código. Los únicos usos de "/kyc" son `Link href="/kyc"` (navegación correcta a la página). Si quieres que no aparezca un request a /kyc hasta que el usuario haga clic, los enlaces a /kyc pueden usar `prefetch={false}`.
