import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Bienvenido a Hackathon Chipi</h1>

          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium border"
          >
            Iniciar sesión
          </Link>

          <div className="mt-4">
            <Link href="/sign-up" className="underline">
              Crear cuenta
            </Link>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">¡Estás autenticado!</h1>
          <p className="mb-8">Tu wallet se creará aquí</p>
          <UserButton />
        </div>
      </SignedIn>
    </main>
  );
}
