interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * StructuredData — Inyecta JSON-LD en el <head> vía Server Component.
 * Usar una instancia por tipo de schema por página.
 * Referencia: 03-ARQUITECTURA-WEB.md — sección "Datos estructurados".
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
