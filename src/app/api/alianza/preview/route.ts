// src/app/api/alianza/preview/route.ts
// POST /api/alianza/preview
// Renderiza el PDF con los datos del formulario SIN persistir nada en la DB.
// Devuelve el PDF con Content-Disposition: inline para que el navegador lo muestre
// embebido en el modal de vista previa.
//
// El aliado revisa, y solo si hace click en "Confirmar y firmar" el form hace
// POST /api/alianza (que sí persiste).

import { NextRequest, NextResponse } from "next/server";
import { alianzaInputSchema } from "@/lib/alianza-schema";
import { renderAlianzaPdf } from "@/lib/alianza-pdf";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = alianzaInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validación fallida",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const previewBuffer = await renderAlianzaPdf(data, {
      generatedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    });

    return new NextResponse(Buffer.from(previewBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(previewBuffer.length),
        "Content-Disposition": 'inline; filename="Alianza-PREVIO.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[POST /api/alianza/preview] error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}