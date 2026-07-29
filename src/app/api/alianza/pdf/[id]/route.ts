// src/app/api/alianza/pdf/[id]/route.ts
// GET /api/alianza/pdf/[id]
// Devuelve el PDF persistido en la AlianzaContract.
// Auth: Bearer ADMIN_SECRET (para Cesar/admin). Público NO, porque contiene
//       datos personales (cédula, dirección).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const alianza = await prisma.alianzaContract.findUnique({
      where: { id },
      select: {
        id: true,
        pdfBytes: true,
        pdfMimeType: true,
        pdfSize: true,
        vendedor: {
          select: { codigoUnico: true, nombre: true },
        },
      },
    });

    if (!alianza || !alianza.pdfBytes) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Prisma devuelve Bytes como Uint8Array en Node. Lo pasamos a Buffer
    // para satisfacer el BodyInit de NextResponse.
    const bytes = Buffer.from(alianza.pdfBytes as unknown as Uint8Array);
    const filename = `Alianza-BarberosPlus-${alianza.vendedor.codigoUnico}.pdf`;

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": alianza.pdfMimeType || "application/pdf",
        "Content-Length": String(alianza.pdfSize),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/alianza/pdf/[id]] error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}