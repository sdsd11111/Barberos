// src/app/api/alianza/route.ts
// POST /api/alianza
// Flujo público:
//   1. Valida con Zod (alianzaInputSchema)
//   2. Genera código único si el cliente no lo trae
//   3. Crea ReferralVendedor (si no existe por cédula) + AlianzaContract en TX
//   4. Renderiza el PDF y guarda los bytes en la AlianzaContract
//   5. Devuelve { vendedorId, alianzaId, codigo, pdfUrl } para descarga inmediata
//
// Decisión de diseño: si ya existe un vendedor con la misma cédula, reutilizamos
// el registro. Esto evita duplicados por doble submission del formulario.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { alianzaInputSchema } from "@/lib/alianza-schema";
import { renderAlianzaPdf } from "@/lib/alianza-pdf";
import { Prisma } from "@prisma/client";

// Genera código único de 8 caracteres alfanuméricos (mayúsculas sin O/I).
// Mismo alfabeto que /api/referidos/route.ts para mantener consistencia.
function generateCodigoUnico(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? null;

    // 1) Asegurar código único. Si el cliente lo trae pero ya existe,
    //    lo regeneramos (el servidor tiene la última palabra).
    let codigoUnico = data.codigoAsignado.toUpperCase();
    let attempts = 0;
    while (attempts < 8) {
      const taken = await prisma.referralVendedor.findUnique({
        where: { codigoUnico },
        select: { id: true, cedula: true },
      });
      if (!taken) break;
      if (taken.cedula === data.cedula) break; // es nuestro propio registro
      codigoUnico = generateCodigoUnico();
      attempts++;
    }

    // 2) Render PDF (necesitamos los datos finales)
    const dataForPdf = { ...data, codigoAsignado: codigoUnico };
    const pdfBuffer = await renderAlianzaPdf(dataForPdf, {
      acceptedAt: new Date().toISOString(),
    });

    // 3) Persistir en una sola transacción.
    //    - Si ya existe vendedor por cédula, lo reutilizamos.
    //    - Si no, lo creamos.
    //    - Siempre creamos el AlianzaContract nuevo (1:1 idempotente
    //      vía upsert por vendedorId).
    const result = await prisma.$transaction(async (tx) => {
      let vendedor = await tx.referralVendedor.findUnique({
        where: { cedula: data.cedula },
      });

      if (!vendedor) {
        vendedor = await tx.referralVendedor.create({
          data: {
            nombre: data.nombreCompleto,
            celular: data.celular,
            negocio: data.nombreNegocio,
            direccion: data.direccion,
            cedula: data.cedula,
            codigoUnico,
          },
        });
      } else {
        // actualizar datos no contractuales si difieren
        vendedor = await tx.referralVendedor.update({
          where: { id: vendedor.id },
          data: {
            nombre: data.nombreCompleto,
            celular: data.celular,
            negocio: data.nombreNegocio,
            direccion: data.direccion,
            codigoUnico,
          },
        });
      }

      // upsert del contrato (1 vendedor = 1 alianza)
      const fechaAsignacionDate = new Date(
        Date.UTC(data.anioFirma, MES_IDX(data.mesFirma), data.diaFirma)
      );

      const alianza = await tx.alianzaContract.upsert({
        where: { vendedorId: vendedor.id },
        create: {
          vendedorId: vendedor.id,
          fechaAsignacion: fechaAsignacionDate,
          zonaTerritorio: data.zonaTerritorio?.trim() || null,
          diasPagoComision: data.diasPagoComision,
          metodoPago: data.metodoPago,
          ciudadFirma: data.ciudadFirma,
          diaFirma: data.diaFirma,
          mesFirma: data.mesFirma,
          anioFirma: data.anioFirma,
          pdfBytes: pdfBuffer as unknown as Prisma.Bytes,
          pdfMimeType: "application/pdf",
          pdfSize: pdfBuffer.length,
          ipAceptacion: ip,
          userAgent,
          aceptadoAt: new Date(),
        },
        update: {
          // re-firma del mismo aliado: actualizamos datos + PDF
          fechaAsignacion: fechaAsignacionDate,
          zonaTerritorio: data.zonaTerritorio?.trim() || null,
          diasPagoComision: data.diasPagoComision,
          metodoPago: data.metodoPago,
          ciudadFirma: data.ciudadFirma,
          diaFirma: data.diaFirma,
          mesFirma: data.mesFirma,
          anioFirma: data.anioFirma,
          pdfBytes: pdfBuffer as unknown as Prisma.Bytes,
          pdfMimeType: "application/pdf",
          pdfSize: pdfBuffer.length,
          ipAceptacion: ip,
          userAgent,
          aceptadoAt: new Date(),
        },
      });

      return { vendedor, alianza };
    });

    return NextResponse.json(
      {
        ok: true,
        vendedorId: result.vendedor.id,
        alianzaId: result.alianza.id,
        codigo: result.vendedor.codigoUnico,
        pdfUrl: `/api/alianza/pdf/${result.alianza.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/alianza] error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint (cedula ya usada con otra codigo)
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un vendedor con esa cédula o código." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function MES_IDX(mes: string): number {
  return [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ].indexOf(mes);
}