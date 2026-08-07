import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { getProgressBar } from "@/lib/progress";

const ApproveSchema = z.object({
  visitId: z.string().min(1, "visitId es requerido"),
  staffId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ApproveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { visitId, staffId } = parsed.data;

    // Buscar visita
    const visit = await prisma.barberVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      return NextResponse.json(
        { success: false, error: "Visita no encontrada" },
        { status: 404 }
      );
    }

    // Regla de Negocio 2: Debe estar en estado PENDING
    if (visit.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `La visita ya está en estado ${visit.status}` },
        { status: 400 }
      );
    }

    // Las visitas anónimas (CF) no tienen customerId y no pasan por aprobación
    if (!visit.customerId) {
      return NextResponse.json(
        { success: false, error: "Las visitas anónimas se aprueban automáticamente" },
        { status: 400 }
      );
    }

    // Obtener cliente y barbería (validando estrictamente que el cliente pertenezca a la barbería autenticada)
    const customer = await prisma.barberCustomer.findFirst({
      where: { 
        id: visit.customerId,
        barbershopId
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado o no pertenece a su barbería" },
        { status: 403 }
      );
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: customer.barbershopId },
      include: { staff: true },
    });

    if (!barbershop) {
      return NextResponse.json({ success: false, error: "Barbería no encontrada" }, { status: 404 });
    }

    // Actualizar visita (preservar staffId pre-asignado desde QR individual del barbero)
    await prisma.barberVisit.update({
      where: { id: visitId },
      data: {
        status: "APPROVED",
        staffId: staffId ?? visit.staffId ?? null,
      },
    });

    // Verificar si la barbería tiene equipo configurado
    const staffMembers = await prisma.barberStaff.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
    });

    // Si la visita ya tiene staffId (del QR individual del barbero), saltar pregunta de selección
    const alreadyHasStaff = !!(staffId || visit.staffId);
    const hasStaffOptions = staffMembers.length > 0 && !alreadyHasStaff;
    const nextState = hasStaffOptions ? "AWAITING_STAFF" : "AWAITING_RATING";

    // Actualizar cliente (incrementar cortes y pedir profesional o rating)
    const updatedCustomer = await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: {
        cutsCount: { increment: 1 },
        lastVisitAt: new Date(),
        sessionState: nextState,
      },
    });

    // Sincronizar el contador del perfil individual (para loyaltyMode BY_PROFILE)
    if (visit.profileId) {
      await prisma.customerProfile.update({
        where: { id: visit.profileId },
        data: { cutsCount: { increment: 1 } },
      });
    }

    // Construir mensaje de WhatsApp
    const progressBar = getProgressBar(updatedCustomer.cutsCount, barbershop.requiredCuts);
    const remaining = barbershop.requiredCuts - updatedCustomer.cutsCount;

    let message = "";
    if (updatedCustomer.cutsCount >= barbershop.requiredCuts) {
      message = `✂️ ¡Tu check-in ha sido aprobado!\n\nTu progreso: ${progressBar}\n\n🎉 ¡Felicidades! Has ganado tu premio. Menciónalo en tu próxima visita.\n\n📌 *Asegúrate de guardarnos en tus contactos para que tus cortes se registren correctamente.*`;
    } else {
      message = `✂️ ¡Tu check-in ha sido aprobado!\n\nTu progreso: ${progressBar}\n\n¡Te faltan ${remaining} cortes para tu premio!\n\n📌 *Asegúrate de guardarnos en tus contactos para que tus cortes se registren correctamente.*`;
    }

    if (hasStaffOptions) {
      const optionsText = staffMembers
        .map((s, idx) => `${idx + 1}. ${s.name}`)
        .join("\n");
      message += `\n\nAntes de finalizar, ¿quién te atendió hoy?\n\n${optionsText}\n\nResponde con el nombre o número.`;
    } else {
      // Personalizar con el nombre del barbero si ya fue pre-asignado (QR individual)
      const effectiveStaffId = staffId || visit.staffId;
      const assignedStaff = effectiveStaffId
        ? staffMembers.find((s) => s.id === effectiveStaffId)
        : null;
      message += assignedStaff
        ? `\n\nPor último, del 1 al 5, ¿cómo calificas tu servicio con ${assignedStaff.name} hoy? ⭐`
        : `\n\nPor favor, responde del 1 al 5 para calificar la atención de hoy.`;
    }

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: customer.whatsapp,
      message,
    });

    return NextResponse.json({
      success: true,
      cutsCount: updatedCustomer.cutsCount,
    });
  } catch (error) {
    console.error("[Approve API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
