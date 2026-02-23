# Credential status: por qué “no pasaba nada” y qué se hizo

## Causa del problema

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
