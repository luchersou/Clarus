"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "../reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How accurate is Clarus's document analysis?",
    a: "Clarus combines RAG-based retrieval with structured extraction, so answers are grounded in the actual content of your document rather than generated freely. Every extracted value can be traced back to the page it came from.",
  },
  {
    q: "What file formats are supported?",
    a: "Clarus currently supports PDF, DOCX, and XLSX. Contracts, invoices, financial reports, and spreadsheets can all be processed the same way.",
  },
  {
    q: "How is this different from just using a chatbot?",
    a: "Clarus has a chat too, but its answers are grounded in your own documents, not generated freely. And for recurring work you can skip the prompt: Summary, Extract values, Deadlines, and Compare give consistent results, however the question would have been phrased.",
  },
  {
    q: "Is my data secure and private?",
    a: "Yes. Documents are encrypted (AES-256), processed in isolated workspaces, and never used to train shared models. Access to your workspace is restricted to your account.",
  },
];

function FaqItem({
  q,
  a,
  index,
  isLast,
}: {
  q: string;
  a: string;
  index: number;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(index === 0);
  const panelId = `faq-panel-${index}`;

  return (
    <Reveal
      y={16}
      delay={index * 0.08}
      className={cn("overflow-hidden mx-5 md:mx-6", !isLast && "border-b border-foreground/10")}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 py-4 md:py-5 text-left select-none group/faq-btn transition-colors duration-200 cursor-pointer"
      >
        <span className="text-sm md:text-base font-medium text-foreground group-hover/faq-btn:text-primary transition-colors duration-200">
          {q}
        </span>
        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-foreground/3 group-hover/faq-btn:bg-foreground/8 transition-colors duration-200 shrink-0">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground transition-transform duration-300 ease-out",
              open && "rotate-180 text-foreground"
            )}
          />
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pr-10 text-sm leading-relaxed text-foreground/70">
            {a}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function FAQ() {
  return (
    <Reveal className="py-20 md:py-28">
      <div id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-3 max-w-md text-foreground/70">
            Got questions about Clarus? We&apos;ve got answers.
          </p>
        </div>

        <div className="rounded-2xl bg-gray-100 py-1">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              index={index}
              isLast={index === FAQS.length - 1}
            />
          ))}
        </div>
      </div>
    </Reveal>
  );
}