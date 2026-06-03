"use client";

import { useState } from "react";

export interface FaqEntry {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-paper-200 overflow-hidden rounded-2xl border border-paper-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        const btnId = `faq-btn-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-paper-50 sm:px-6"
              >
                <span className="text-[15px] font-semibold text-midnight-900">
                  {item.question}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 flex-shrink-0 text-brass-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-5 pb-5 sm:px-6"
            >
              <p className="text-sm leading-relaxed text-midnight-600">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
