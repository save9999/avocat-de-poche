export function Disclaimer() {
  return (
    <div className="border-b border-brass-200 bg-brass-50">
      <div className="mx-auto flex max-w-5xl items-start gap-2.5 px-4 py-2.5 sm:px-6">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brass-700" fill="none" aria-hidden="true">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-xs leading-relaxed text-brass-900">
          <span className="font-semibold">Information juridique</span> — fondée sur la loi en
          vigueur. Ne remplace pas la consultation d'un avocat ou d'un professionnel du droit.
        </p>
      </div>
    </div>
  );
}
