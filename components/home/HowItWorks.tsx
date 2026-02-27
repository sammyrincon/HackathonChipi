"use client";

import { Shield, BadgeCheck, QrCode } from "lucide-react";
import { isFrontendDemo } from "@/lib/demo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "What is ZeroPass?",
    a: "ZeroPass is a privacy-preserving identity infrastructure built on Starknet. Users verify their identity once and can later prove regulatory attributes without revealing personal data.",
  },
  {
    q: "How is this different from traditional KYC?",
    a: "Traditional KYC requires users to submit documents repeatedly. ZeroPass enables one-time verification and reusable cryptographic proofs, reducing friction and data exposure.",
  },
  {
    q: "Does ZeroPass store personal data on-chain?",
    a: "No. Only cryptographic commitments are stored. Personal documents are never published on-chain.",
  },
  {
    q: "Is this production-ready?",
    a: "ZeroPass is currently in demo stage. The architecture is designed for scalable, compliance-grade deployment.",
  }
];

const steps = [
  {
    step: "01",
    title: "Complete KYC",
    description:
      "Upload your ID and a selfie. Your wallet is created during the flow.",
    descriptionDemo:
      "Upload your ID and a selfie. Your wallet is created during the flow.",
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
      className="relative overflow-hidden border-t border-[#111111]/10 bg-newsprint py-16 md:py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        {/* FAQ */}
        <div className="mb-12 md:mb-14">
          <h4 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight text-[#d90000]">
            Frequently asked questions
          </h4>
          <Accordion type="single" collapsible className="mt-4 w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-[#111111]/15 px-0"
              >
                <AccordionTrigger className="font-body py-4 text-left text-[#111111] hover:no-underline hover:text-[#CC0000] [&[data-state=open]]:text-[#CC0000]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-[#111111]/80">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="mb-10 border-0 bg-transparent shadow-none md:mb-12">
          <CardHeader className="space-y-2 px-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="how-it-works-heading"
                className="font-headline text-3xl font-bold leading-tight tracking-tight text-[#111111] md:text-4xl"
              >
                How it works
              </h2>

            </div>
            <CardDescription className="max-w-xl text-base leading-relaxed text-[#111111]/70">
              ZeroPass issues privacy-preserving credentials on Starknet. Prove your identity instantly and without sharing personal data.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const description =
              index === 0 && isDemo ? item.descriptionDemo : item.description;

            const delayClass =
              index === 0 ? "how-it-works-card-0" : index === 1 ? "how-it-works-card-1" : "how-it-works-card-2";

            return (
              <Card
                key={item.step}
                className={`how-it-works-card-editorial ${delayClass} flex flex-col rounded-xl border border-[#111111]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#111111]/15 hover:shadow-md md:p-8`}
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#CC0000]/10">
                    <Icon
                      className="h-6 w-6 text-[#CC0000]"
                      aria-label={item.iconLabel}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Badge
                      variant="outline"
                      className="rounded-md border-[#CC0000]/40 bg-[#CC0000]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#CC0000]"
                      aria-hidden
                    >
                      {item.step}
                    </Badge>
                    <CardTitle className="font-headline text-xl leading-snug text-[#111111]">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 flex-1 p-0">
                  <CardDescription className="max-w-[38ch] font-body text-sm leading-relaxed text-[#111111]/75">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
