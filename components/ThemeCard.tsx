import Link from "next/link";
import { ReactNode } from "react";

interface ThemeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  disabled?: boolean;
  accent?: "active" | "muted";
}

export function ThemeCard({
  title,
  description,
  icon,
  href,
  disabled = false,
  accent = "muted",
}: ThemeCardProps) {
  const baseClasses =
    "group relative flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-200";
  const activeClasses =
    "border-midnight-200 bg-white shadow-soft hover:-translate-y-1 hover:border-sage-300 hover:shadow-lg";
  const disabledClasses =
    "border-midnight-100 bg-midnight-50/60 cursor-not-allowed opacity-70";

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            disabled
              ? "bg-midnight-100 text-midnight-400"
              : "bg-midnight-900 text-white"
          }`}
        >
          {icon}
        </div>
        {disabled ? (
          <span className="rounded-full bg-midnight-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-midnight-500">
            Bientôt
          </span>
        ) : (
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sage-700">
            Disponible
          </span>
        )}
      </div>
      <div className="mt-6">
        <h3 className="font-serif text-2xl font-semibold text-midnight-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-midnight-600">
          {description}
        </p>
      </div>
      {!disabled && (
        <div className="mt-6 flex items-center text-sm font-medium text-sage-700 transition-transform group-hover:translate-x-1">
          Commencer la consultation
          <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14m-6-6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );

  if (disabled || !href) {
    return (
      <div
        className={`${baseClasses} ${disabledClasses}`}
        aria-disabled="true"
        title="Module en cours de développement"
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${activeClasses}`}>
      {content}
    </Link>
  );
}
