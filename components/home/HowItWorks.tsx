"use client";

import { Shield, BadgeCheck, QrCode } from "lucide-react";
import { isFrontendDemo } from "@/lib/demo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Complete KYC",
    description:
      "Upload your ID and a selfie. Your wallet is created during the flow. One-time payment of 1 USDC to issue your credential.",
    descriptionDemo:
      "Upload your ID and a selfie. Your wallet is created during the flow. Demo payment (1 USDC shown) to issue your credential.",
    icon: Shield,
    iconLabel: "Identity verification",
  },
  {
    step: "02",
    title: "Receive credential",
    description:
      "Your ZeroPass credential is issued on Starknet and linked to your Chipi wallet. No personal data is stored on-chain.",
    icon: BadgeCheck,
    iconLabel: "Credential issued",
  },
  {
    step: "03",
    title: "Access anywhere",
    description:
      "Show your QR code or share your wallet address. Businesses verify your credential instantly. No forms, no repeated KYC.",
    icon: QrCode,
    iconLabel: "Scan to verify",
  },
];

export function HowItWorks() {
  const isDemo = isFrontendDemo;

  return (
    <section
      className="relative overflow-hidden border-t border-white/10 py-16 md:py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0d0d0d]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 md:mb-14">
          <h2
            id="how-it-works-heading"
            className="font-headline text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl"
          >
            How it works
          </h2>
          <CardDescription className="mt-2 max-w-xl text-base leading-relaxed text-white/60">
            ZeroPass issues privacy-preserving credentials on Starknet. Prove your identity instantly and without sharing personal data.
          </CardDescription>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const description =
              index === 0 && isDemo ? item.descriptionDemo : item.description;

            const delayClass =
              index === 0 ? "how-it-works-card-0" : index === 1 ? "how-it-works-card-1" : "how-it-works-card-2";

            return (
              <Card
                key={item.step}
                className={`how-it-works-card ${delayClass} rounded-lg border border-white/15 bg-white/[0.03] shadow-lg shadow-black/20`}
              >
                <CardHeader className="flex flex-col items-start gap-4 space-y-0 px-6 pt-6 md:px-8 md:pt-8">
                  <Badge
                    variant="outline"
                    className="w-fit rounded-none border-[#CC0000]/40 bg-[#CC0000]/10 px-2 py-0.5 font-headline text-xs font-bold text-[#CC0000]"
                    aria-hidden
                  >
                    {item.step}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-5 w-5 shrink-0 text-[#4ade80]/90"
                      aria-label={item.iconLabel}
                    />
                    <CardTitle className="font-headline text-xl leading-snug text-white">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="max-w-[38ch] px-6 pb-6 font-sans text-sm leading-relaxed text-white/70 md:px-8 md:pb-8">
                  {description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
