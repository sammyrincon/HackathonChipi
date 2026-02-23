# Credential status: por qué “no pasaba nada” y qué se hizo

## Dónde se crea la credencial

**Archivo:** `app/api/kyc/route.ts`  
**Método:** `POST`  
**Lógica:** `prisma.credential.upsert` por `clerkUserId` (create si no existe, update si existe). La credencial se crea cuando el front llama a `POST /api/kyc` con `{ walletAddress, transactionHash }` después del pago.

## Por qué no se registraban después del reset

1. **Tipo de `status`:** El schema usa el enum `CredentialStatus`. Se pasaban strings en el upsert; el cliente de Prisma puede exigir el enum.
2. **`walletAddress` sin normalizar:** No se guardaba en lowercase; verify/credential/status buscan por wallet en minúsculas.
3. **Logging:** El catch no identificaba claramente el error de creación.

**Correcciones:** enum `CredentialStatus` de `@prisma/client`, `walletAddress` en lowercase, log `CREATE CREDENTIAL ERROR:` en el catch. Se mantiene `upsert` para no violar el unique de `clerkUserId`.

## Por qué no se insertaba (flujo Get Verified / KYC)

- **Body sin wallet:** El validador aceptaba `walletAddress` opcional; si el front enviaba `{}` o no enviaba wallet a tiempo, el API devolvía 400 pero el flujo solo creaba fila al hacer pago. Ahora el API exige `wallet` o `walletAddress` (400 con `code: "MISSING_WALLET"`) y el front envía siempre ambos y valida antes de llamar.
- **Solo se creaba al pagar:** La fila en Credential solo se creaba al llamar `POST /api/kyc` con `transactionHash`. Si el usuario estaba en el paso de pago sin haber pagado, no existía fila. Ahora, al entrar en el paso de pago con wallet, se llama una vez `POST /api/kyc` con `{ walletAddress }` para crear/actualizar una fila PENDING.
- **Ruta:** El front ya llamaba `fetch("/api/kyc", …)` (no `/kyc`). Se mantiene y se refuerza el body con `wallet` y `walletAddress`.

## Verificación en Supabase

Después de completar el flujo (Get Verified → paso de pago con wallet, o completar pago):

```sql
SELECT id, "clerkUserId", "walletAddress", status, "expiresAt", "createdAt"
FROM "Credential"
ORDER BY "createdAt" DESC
LIMIT 5;
```

Deberías ver al menos una fila con `walletAddress` en minúsculas y `status` = `PENDING` o `VERIFIED`.

---

## Causa del problema (UI)

1. **Estado por sesión, no por wallet**  
   El dashboard usaba `GET /api/kyc/status`, que devuelve la credencial del usuario logueado (por `clerkUserId`). No había un endpoint que consultara por **wallet**, que es lo que tiene el front después de crear la wallet o completar KYC.

2. **Cache del navegador**  
   Las peticiones a `/api/kyc/status` podían servirse desde cache. Tras completar KYC o crear la wallet, la UI seguía mostrando el estado antiguo porque no se forzaba una petición nueva.

3. **Sin refetch al volver al dashboard**  
   Tras “Go to dashboard” o recargar, el componente de estado solo hacía una petición al montar. No se volvía a pedir el estado al recuperar el foco de la pestaña ni se usaba `cache: 'no-store'`.

4. **Race al crear credencial**  
   Al terminar el pago KYC, el backend respondía 200/201 pero la UI no tenía una forma fiable de refrescar el estado “por wallet” justo después, ni un único endpoint que reflejara el estado real de esa wallet.

## Cambios realizados

- **`GET /api/credential/status?wallet=0x...`**  
  Consulta por `walletAddress` (normalizado a lowercase), devuelve `{ exists, status, expiresAt }`, orden por `expiresAt` desc y lógica de `EXPIRED` cuando `expiresAt < now`.

- **Hook `useCredentialStatus(wallet)`**  
  Pide ese endpoint con `cache: 'no-store'`, deriva estados `loading | pending | verified | expired | error | idle` y expone `refetch`. Refetch al montar y al recuperar foco de ventana.

- **`CredentialStatusPanel`**  
  Usa el hook y muestra loading, verified, pending, expired, error e idle, con “Get Verified” / “Complete KYC” / “Retry” según el caso, y Revoke cuando aplica.

- **Dashboard**  
  Usa `CredentialStatusPanel` con la wallet (Chipi) en lugar del editorial anterior. Así el estado que se muestra es el de la wallet actual y se actualiza al montar y al volver a la pestaña.

- **Peticiones sin cache**  
  El hook usa `cache: 'no-store'` y en `DashboardRecentActivity` se añadió `cache: 'no-store'` a `/api/kyc/status` para no mostrar datos viejos.

Con esto, al crear la wallet o completar KYC, el dashboard (al montar o al volver a la pestaña) vuelve a pedir el estado por wallet y la UI refleja el estado real de la credencial.

---

## RLS en Supabase

Si la base de datos es **Supabase (PostgreSQL)** y tienes **Row Level Security (RLS)** activado en la tabla `Credential`:

- Los `INSERT`/`UPDATE` que hace Prisma usan el usuario de la conexión (el que pones en `DATABASE_URL`). Si RLS está ON y no existe una policy que permita `INSERT` o `UPDATE` para ese rol, **los inserts/updates pueden fallar** sin un error muy claro en la app.
- Comprueba en Supabase: Table Editor → `Credential` → Policies. Debe haber al menos una policy que permita al rol que usa Prisma (p. ej. `authenticated` o el rol de la connection string) hacer `INSERT` y `UPDATE` en las filas que correspondan (o en todas si es un backend de confianza).
- Si no usas RLS en esta tabla, no aplica; el insert no está siendo bloqueado por RLS.
