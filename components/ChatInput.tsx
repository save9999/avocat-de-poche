"use client";

import { FormEvent, KeyboardEvent, useRef } from "react";
import { SendIcon } from "./ScaleIcon";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Décrivez ce qui se passe...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || disabled) return;
      onSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2 rounded-2xl border border-midnight-200 bg-white p-2 shadow-soft focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-100">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="max-h-44 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-midnight-900 placeholder:text-midnight-400 focus:outline-none disabled:opacity-60 sm:text-base"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Envoyer le message"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-midnight-900 text-white transition-all hover:bg-midnight-800 disabled:cursor-not-allowed disabled:bg-midnight-300"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 px-2 text-xs text-midnight-400">
        Entrée pour envoyer · Maj+Entrée pour aller à la ligne
      </p>
    </form>
  );
}
