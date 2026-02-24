# Wallet no aparece en Voyager — Diagnóstico (Chipi MCP)

## Resumen del debug con Chipi MCP

Se usó el **chipiMcp** `debug_error` con el problema: *"Wallet address does not show on Voyager mainnet, contract not found"*.

### Diagnóstico devuelto por Chipi MCP

1. **El contrato no existe en StarkNet**
   - **Causa:** Dirección inválida, contrato no desplegado, o red equivocada.
   - **Recomendación:** Verificar el contrato en **Starkscan**: https://starkscan.co/contract/{address}

2. **Formato de dirección**
   - Las direcciones deben cumplir: `/^0x[0-9a-fA-F]{64}$/` (0x + 64 caracteres hex).
   - Tu dirección `0x8f5daedcd256bfb6009a7cf5e7cf82671f2643bd1d1d7a76cb73784596c3ecce` cumple el formato.

### Qué se hizo en la app

- **Solo mainnet:** Los enlaces usan Voyager y Starkscan en mainnet (Chipi dev usa mainnet).
- **Enlace a Starkscan:** Además de Voyager, se añadió enlace a Starkscan (recomendado por Chipi MCP para verificar contratos).
- **Texto en UI:** Se indica que si no aparece en Voyager, pruebes Starkscan y que el contrato puede no estar desplegado hasta la primera transacción.

### Enlaces directos para tu wallet

- **Voyager (mainnet):** https://voyager.online/contract/0x8f5daedcd256bfb6009a7cf5e7cf82671f2643bd1d1d7a76cb73784596c3ecce  
- **Starkscan (mainnet):** https://starkscan.co/contract/0x8f5daedcd256bfb6009a7cf5e7cf82671f2643bd1d1d7a76cb73784596c3ecce  

### Causa encontrada en código (Chipi SDK)

El tipo **GetWalletResponse** de Chipi incluye **`isDeployed: boolean`**. Si es `false`, el contrato **aún no está desplegado on-chain** y por eso no aparece en Voyager ni Starkscan.

- **Solución:** Hacer la **primera transacción** desde la app (por ejemplo **Enviar USDC**). Eso despliega el contrato en StarkNet; después la wallet aparecerá en los exploradores.
- En el **Dashboard** se muestra el mensaje en amarillo cuando `isDeployed === false`: *"Tu wallet aún no está desplegada en StarkNet. No aparecerá en Voyager ni Starkscan hasta que hagas tu primera transacción (ej. enviar USDC desde la app)."*

### Si sigue sin aparecer

1. **Probar Starkscan** — A veces un explorador indexa antes que el otro.
2. **Primera transacción** — Enviar aunque sea 0.01 USDC (o la mínima cantidad) desde la app para forzar el despliegue on-chain.
3. **Contactar a Chipi** — Si tras una transacción sigue sin aparecer, puede ser tema de backend o indexación; soporte: dashboard.chipipay.com.
