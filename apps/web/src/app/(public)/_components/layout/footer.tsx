import Link from "next/link";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
  { label: "Log in", href: "/login" },
];

export function Footer() {
  return (
    <footer className="notched-card relative mx-2 mb-2 overflow-hidden bg-gray-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-14 md:flex-row md:items-start md:justify-between md:px-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>

            <span className="font-semibold tracking-tight">Clarus</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            Turn financial documents into precise, structured answers.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/70">
            {LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-10 w-full max-w-7xl px-6 text-xs text-muted-foreground md:px-10">
        &copy; {new Date().getFullYear()} Clarus. All rights reserved.
      </p>

      {/* Decorative wordmark, cut off by the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none mt-4 -mb-[7vw] select-none whitespace-nowrap text-center text-[27vw] font-bold leading-[0.9] tracking-tighter text-foreground/[0.05]"
      >
        Clarus
      </div>
    </footer>
  );
}
