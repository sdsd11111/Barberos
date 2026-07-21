import NavPublic from "@/components/shared/NavPublic";
import FooterPublic from "@/components/shared/FooterPublic";
import CustomCursor from "@/components/landing/CustomCursor";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0a0807] text-[#f3ece1] min-h-screen flex flex-col">
      {/* Cursor personalizado — solo desktop, sin SSR */}
      <CustomCursor />

      {/* Navegación persistente */}
      <NavPublic />

      {/* Contenido con padding-top para compensar la nav fija (h-16 = 64px) */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer compartido */}
      <FooterPublic />
    </div>
  );
}
