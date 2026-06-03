"use client";

import ReactMarkdown from "react-markdown";
import { ScaleIcon } from "./ScaleIcon";

export type ChatRole = "user" | "assistant";

export interface ChatSource {
  reference: string;
  code?: string;
  similarity?: number;
  url?: string;
}

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`fade-in flex w-full items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-midnight-900 text-brass-200">
          <ScaleIcon className="h-5 w-5" />
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-[15px] ${
          isUser
            ? "rounded-tr-sm bg-midnight-900 text-white"
            : "rounded-tl-sm border border-paper-200 bg-white text-midnight-900"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-legal">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc pl-5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal pl-5">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="text-midnight-900">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote>{children}</blockquote>
                ),
                code: ({ children }) => <code>{children}</code>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-paper-200 pt-2.5">
                {message.sources.map((src, i) => (
                  src.url ? (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 text-[11px] font-medium text-sage-800 transition hover:bg-sage-100 hover:text-sage-900"
                    >
                      {src.reference} →
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-paper-200 bg-paper-100 px-2.5 py-1 text-[11px] font-medium text-midnight-600"
                    >
                      {src.reference}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-midnight-100 text-midnight-700">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="fade-in flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-midnight-900 text-brass-200">
        <ScaleIcon className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-paper-200 bg-white px-4 py-3 shadow-sm">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}
