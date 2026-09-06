"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "How it works", path: "/#how-it-works" },
  { name: "Features", path: "/#features" },
  { name: "FAQ", path: "/#faq" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const id = path.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop & Mobile Floating Header Container */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto flex items-center justify-between w-full max-w-xl sm:max-w-3xl h-14 px-3 sm:px-4 rounded-lg",
            "bg-background/80 backdrop-blur-md border border-foreground/5 shadow-lg transition-all duration-300"
          )}
        >
          {/* Left: Logo */}
          <div className="flex items-center md:-ml-1">
            <Link href="/" onClick={handleLogoClick} className="inline-flex items-center gap-2 group">
              <div className="bg-primary/80 p-0.5 rounded-sm">
                <span className="flex h-7.5 w-7.5 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-base transition-transform duration-300 group-hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
                  C
                </span>
              </div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors">
                Clarus
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors relative py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" className="h-8 px-4 text-xs font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/registro" className="hidden md:block">
              <Button className="h-8 px-4 text-xs font-medium">Get started</Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full sm:hidden h-8 w-8 text-foreground"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-21 left-4 right-4 z-40 p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-foreground/5 shadow-2xl flex flex-col gap-4 sm:hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="block px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full h-10 text-sm font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setMobileOpen(false)}>
                <Button className="w-full h-10 text-sm font-medium">Get started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}