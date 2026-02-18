import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { CryptoWalletSection } from "@/components/crypto-wallet-section";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* USUARIO NO AUTENTICADO */}
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Bienvenido a Hackathon Chipi
          </h1>

          <SignInButton mode="modal">
            <button className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium border">
              Iniciar sesión
            </button>
          </SignInButton>

          <div className="mt-4">
            <SignUpButton mode="modal">
              <button className="underline">
                Crear cuenta
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      {/* USUARIO AUTENTICADO */}
      <SignedIn>
        <div className="text-center max-w-2xl w-full space-y-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-4xl font-bold">
              ¡Estás autenticado!
            </h1>
            <UserButton />
          </div>

          <CryptoWalletSection />
        </div>
      </SignedIn>
    </main>
  );
}
