"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/panel", label: "Dashboard", exact: true },
  { href: "/panel/clientes", label: "Clientes" },
  { href: "/panel/barberos", label: "Barberos" },
  { href: "/panel/whatsapp", label: "Configuración" },
];

export default function PanelNav({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#2a2520] bg-[#0a0807]/95 backdrop-blur-sm flex items-center px-4 sm:px-6 justify-between">
        {/* Logo */}
        <Link
          href="/panel"
          className="font-display text-xl font-light tracking-widest text-[#f3ece1] hover:text-[#d97644] transition-colors"
        >
          BarberOS
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-mono text-xs tracking-[0.2em] uppercase transition-colors ${
                    isActive ? "text-[#d97644]" : "text-[#5c554c] hover:text-[#a89e90]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout + hamburger */}
        <div className="flex items-center gap-4">
          <form action={logoutAction} className="hidden md:block">
            <button
              type="submit"
              className="font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] hover:text-[#d97644] transition-colors"
            >
              Salir
            </button>
          </form>

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span
              className={`block h-[1.5px] w-6 bg-[#a89e90] transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-6 bg-[#a89e90] transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-6 bg-[#a89e90] transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 bottom-0 bg-[#0a0807] z-40 transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-10 pb-16">
          <ul className="flex flex-col items-center gap-8">
            {navLinks.map(({ href, label, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`font-display text-3xl font-light tracking-widest transition-colors ${
                      isActive ? "text-[#d97644]" : "text-[#f3ece1]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <form action={logoutAction}>
            <button
              type="submit"
              className="font-mono text-sm tracking-[0.3em] uppercase text-[#5c554c] hover:text-[#d97644] transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
