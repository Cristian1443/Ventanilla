import { auth } from "@/auth";
import CreateTicketForm from "@/components/CreateTicketForm";
import Link from "next/link";
import Image from "next/image";
import SignIn from "@/components/SignIn";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen w-full bg-white">
      {/* Left Column: Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-[40%] xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-10">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight text-zinc-900 md:text-4xl lg:text-5xl">
              Sistema de Solicitud de Obstáculos
            </h1>
            <p className="text-2xl font-medium text-zinc-700">
              Ventanilla Digital
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <SignIn />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Image Background */}
      <div className="relative hidden w-[60%] lg:block">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/login-bg.jpg')",
          }}
        >
          {/* Overlay to darken slightly if needed */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Curved Separator (White overlap) */}
        {/* Using a SVG or clip-path to simulate the curve from the mockup */}
        <div className="absolute inset-y-0 left-0 w-24 bg-white" style={{ clipPath: "ellipse(100% 50% at 0% 50%)", width: "15%" }}></div>
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: -1,
          width: '150px',
          background: 'white',
          clipPath: 'ellipse(60% 70% at 0% 50%)'
        }}></div>

        {/* Logo Overlay */}
        <div className="absolute right-8 top-8 z-10">
          <Image
            src="/logo-iib-full.png"
            alt="Invest in Bogotá"
            width={200}
            height={80}
            className="h-16 w-auto drop-shadow-md"
            priority
          />
        </div>
      </div>
    </main>
  );
}
