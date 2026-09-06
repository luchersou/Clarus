"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
    a: "Instead of writing prompts, you pick from a fixed set of actions — Summary, Extract values, Deadlines, or Compare. This keeps results consistent and predictable, instead of depending on how a question is phrased.",
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
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;

  return (
    <div className={cn("overflow-hidden mx-4", !isLast && "border-b border-foreground/5")}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 p-2 md:p-4 text-left select-none group/faq-btn transition-colors duration-200 cursor-pointer"
      >
        <span className="text-xs md:text-sm text-foreground group-hover/faq-btn:text-primary transition-colors duration-200">
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
          <div className="pb-4 md:pb-6 px-2 md:px-4 text-xs md:text-sm text-muted-foreground leading-relaxed pr-8">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-28 relative z-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5 md:mb-3">
            FAQ
          </p>
          <h2 className="text-lg md:text-3xl font-extrabold tracking-tight text-foreground mb-2 md:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Got questions about Clarus? We&apos;ve got answers.
          </p>
        </div>

        <div className="border border-foreground/5 rounded-2xl bg-muted/20 backdrop-blur-xl py-2">
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
    </section>
  );
}