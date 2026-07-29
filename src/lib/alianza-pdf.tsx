// src/lib/alianza-pdf.tsx
// Documento PDF del "Programa de Aliados Comerciales — BarberosPlus.com".
// Texto contractual COPIADO LITERAL del documento legal provisto por Cesar.
// Render server-side vía renderToBuffer() en el route handler.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { AlianzaInput } from "@/lib/alianza-schema";

// ============================================================
// PALETA — versión IMPRIMIR: fondo blanco, tinta negra
// ============================================================
const C = {
  bg: "#ffffff",
  surface: "#f5f5f5",
  border: "#d0d0d0",
  muted: "#666666",
  text: "#111111",
  text2: "#444444",
  accent: "#c05030", // rojo terracota oscuro (legible en blanco)
  accent2: "#8a6000", // ámbar oscuro para campos rellenados
  positive: "#1a7a40",
};

const F = {
  serif: "Times-Roman", // fallback estándar embebido en @react-pdf/renderer
  sans: "Helvetica",
  mono: "Courier",
};

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingTop: 42,
    paddingBottom: 50,
    paddingHorizontal: 52,
    fontFamily: F.sans,
    fontSize: 9.5,
    color: C.text,
    lineHeight: 1.25,
  },

  // Header de cada página
  header: {
    position: "absolute",
    top: 18,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingBottom: 8,
  },
  headerBrand: {
    fontFamily: F.serif,
    fontSize: 11,
    letterSpacing: 2,
    color: C.accent,
  },
  headerDoc: {
    fontFamily: F.mono,
    fontSize: 7.5,
    letterSpacing: 1.5,
    color: C.muted,
    textTransform: "uppercase",
  },

  // Footer de cada página
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerLeft: {
    fontFamily: F.mono,
    fontSize: 7,
    letterSpacing: 1.2,
    color: C.muted,
    textTransform: "uppercase",
  },
  footerRight: {
    fontFamily: F.mono,
    fontSize: 7,
    letterSpacing: 1.2,
    color: C.muted,
  },

  // Tipografía
  h1: {
    fontFamily: F.serif,
    fontSize: 20,
    color: C.accent,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  h2: {
    fontFamily: F.serif,
    fontSize: 12,
    color: C.accent,
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  h3: {
    fontFamily: F.sans,
    fontSize: 10,
    fontWeight: "bold",
    color: C.text,
    marginTop: 4,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  eyebrow: {
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 2,
    color: C.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  p: {
    marginBottom: 3,
    color: C.text,
    textAlign: "justify",
  },
  pMuted: {
    color: C.text2,
    marginBottom: 3,
    fontFamily: F.sans,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 10,
  },
  bulletDot: {
    width: 10,
    color: C.accent,
    fontFamily: F.mono,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    color: C.text,
  },
  hr: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginVertical: 12,
  },

  // Bloque "entre los suscritos" — 2 columnas para compactar
  partiesBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 4,
    padding: 5,
    backgroundColor: C.surface,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  partyRow: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 1,
    paddingRight: 6,
  },
  partyLabel: {
    fontFamily: F.mono,
    fontSize: 7,
    letterSpacing: 1.2,
    color: C.muted,
    textTransform: "uppercase",
    width: 70,
  },
  partyValue: {
    flex: 1,
    color: C.text,
    fontFamily: F.sans,
    fontSize: 9,
  },
  partyValueAccent: {
    flex: 1,
    color: C.accent2,
    fontFamily: F.mono,
    fontSize: 9,
    fontWeight: "bold",
  },

  // Bloque de firma
  signatureBlock: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureCol: {
    width: "45%",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.text,
    height: 28,
    marginBottom: 4,
  },
  signatureName: {
    fontFamily: F.sans,
    fontSize: 10.5,
    color: C.text,
    fontWeight: "bold",
  },
  signatureMeta: {
    fontFamily: F.mono,
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
  },

  // Watermark sutil en la portada (deshabilitado en v2)
  watermark: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: F.serif,
    fontSize: 90,
    color: C.border,
    opacity: 0.35,
    letterSpacing: 8,
  },

  // Resumen ejecutivo (portada)
  summaryBlock: {
    marginTop: 10,
    marginBottom: 8,
    padding: 8,
    backgroundColor: C.surface,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: C.border,
    borderRightColor: C.border,
    borderBottomColor: C.border,
  },
  summaryTitle: {
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 2,
    color: C.accent,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  summaryText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.text,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  summaryAccent: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.accent,
    fontWeight: "bold",
  },
  summaryLink: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.accent2,
    textDecoration: "underline",
  },

  // Bold inline
  bold: {
    fontWeight: "bold",
  },

  // Campo rellenado en línea de párrafo (no en bloque)
  fieldAccent: {
    color: C.accent2,
    fontFamily: F.mono,
    fontWeight: "bold",
  },

  // Tabla de comisiones (Cláusula Tercera)
  table: {
    marginTop: 2,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    fontFamily: F.mono,
    fontSize: 7,
    letterSpacing: 1.2,
    color: C.accent,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 5,
    backgroundColor: C.surface,
  },
  tableCell: {
    flex: 1,
    fontFamily: F.sans,
    fontSize: 8.5,
    color: C.text,
    paddingRight: 3,
  },

  // Bloque de aceptación electrónica al pie
  acceptedBlock: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    alignItems: "center",
  },
  acceptedText: {
    fontFamily: F.mono,
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: C.muted,
    textTransform: "uppercase",
  },
});

// ============================================================
// HELPERS
// ============================================================
const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const fmt = (n: number) => String(n).padStart(2, "0");

const fmtFechaCorta = (d: Date) =>
  `${fmt(d.getUTCDate())}/${fmt(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;

const fmtFechaLarga = (d: Date) =>
  `${d.getUTCDate()} de ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][d.getUTCMonth()]} de ${d.getUTCFullYear()}`;

const metodoPagoLabel = (m: AlianzaInput["metodoPago"]) =>
  ({
    transferencia: "Transferencia bancaria",
    payphone: "Payphone",
    efectivo: "Efectivo",
    otro: "Otro (especificar)",
  }[m]);

// ============================================================
// HEADER / FOOTER REUTILIZABLES
// ============================================================
const PageHeader = () => (
  <View style={styles.header} fixed>
    <Text style={styles.headerBrand}>BARBEROSPLUS.COM</Text>
    <Text style={styles.headerDoc}>Alianza Estratégica Comercial · v1</Text>
  </View>
);

const PageFooter = ({ generatedAt }: { generatedAt: string }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerLeft}>
      Generado el {generatedAt} · BarberOSPlus.com
    </Text>
    <Text
      style={styles.footerRight}
      render={({ pageNumber, totalPages }) =>
        `Página ${pageNumber} / ${totalPages}`
      }
    />
  </View>
);

// ============================================================
// COMPONENTE PRINCIPAL — 4 páginas, redacción condensada
// ============================================================
export function AlianzaDocument({
  data,
  generatedAt,
  acceptedAt,
}: {
  data: AlianzaInput;
  generatedAt: string;
  acceptedAt: string;
}) {
  const fechaAsignacionStr = `${String(data.diaFirma).padStart(2, "0")}/${String(MES_IDX(data.mesFirma) + 1).padStart(2, "0")}/${data.anioFirma}`;

  return (
    <Document
      title="Alianza Estratégica Comercial — BarberOSPlus.com"
      author="Cesar Reyes · BarberosPlus.com"
      subject="Programa de Aliados Comerciales"
      creator="BarberOS"
    >
      {/* ============================================================ */}
      {/* PÁGINA ÚNICA — contenido fluye automáticamente           */}
      {/* con wrap; @react-pdf/renderer paginiza según overflow   */}
      {/* ============================================================ */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />

        <View style={{ marginTop: 8 }}>
          <Text style={styles.eyebrow}>Programa de Aliados Comerciales · v1</Text>
          <Text style={styles.h1}>ALIANZA ESTRATÉGICA{"\n"}COMERCIAL</Text>
          <Text
            style={{
              fontFamily: F.mono,
              fontSize: 8,
              letterSpacing: 2,
              color: C.muted,
              marginTop: 2,
            }}
          >
            BARBEROSPLUS.COM
          </Text>
        </View>

        {/* Resumen ejecutivo — 5 líneas para que el aliado entienda sin leer */}
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryTitle}>Resumen ejecutivo</Text>
          <Text style={styles.summaryText}>
            Por medio de esta Alianza, EL ALIADO refiere dueños de barbería o
            salón — desde su propia cartera de contactos — al canal oficial de
            WhatsApp de BarberosPlus y recibe comisión por cada activación
            pagada, bajo dos modalidades:{" "}
            <Text style={styles.summaryAccent}>Referido</Text>{" "}
            (pago fijo por derivación) o{" "}
            <Text style={styles.summaryAccent}>Cierre</Text>{" "}
            (pago fijo por configuración + 10% de la mensualidad del plan, de
            por vida). Esta Alianza no genera relación laboral. Para precios
            vigentes consultar{" "}
            <Text style={styles.summaryLink}>barberosplus.com/precios</Text>.
          </Text>
        </View>

        {/* Entre los suscritos (compacto) + datos del ALIADO */}
        <Text style={styles.p}>
          Entre los suscritos, por una parte <Text style={styles.bold}>CESAR REYES</Text>,
          persona natural, titular del nombre comercial BARBEROSPLUS.COM
          (BarberosPlus.com no constituye actualmente una persona jurídica
          formalmente constituida; este contrato se suscribe a título personal
          de Cesar Reyes), en adelante <Text style={styles.bold}>"BARBEROSPLUS"</Text>;
          y por otra parte, en adelante <Text style={styles.bold}>"EL ALIADO"</Text>,
          cuyos datos son:
        </Text>

        <View style={styles.partiesBlock}>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Nombre completo</Text>
            <Text style={styles.partyValueAccent}>{data.nombreCompleto}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Cédula de identidad</Text>
            <Text style={styles.partyValueAccent}>{data.cedula}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Teléfono / WhatsApp</Text>
            <Text style={styles.partyValueAccent}>{data.celular}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Nombre del negocio</Text>
            <Text style={styles.partyValueAccent}>{data.nombreNegocio}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Dirección</Text>
            <Text style={styles.partyValueAccent}>{data.direccion}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Código asignado</Text>
            <Text style={styles.partyValueAccent}>{data.codigoAsignado}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Fecha de asignación</Text>
            <Text style={styles.partyValueAccent}>{fechaAsignacionStr}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Zona / territorio</Text>
            <Text style={styles.partyValueAccent}>
              {data.zonaTerritorio?.trim() ? data.zonaTerritorio : "No aplica"}
            </Text>
          </View>
        </View>

        <Text style={styles.h2}>CLÁUSULA PRIMERA — OBJETO DE LA ALIANZA</Text>
        <Text style={styles.p}>
          EL ALIADO cuenta con una cartera propia de contactos y clientes (por
          ejemplo, dueños de barberías o salones que compran insumos, equipos o
          servicios en su negocio) con quienes mantiene una relación de
          confianza previa e independiente de BarberosPlus. Dentro de esa
          relación ya existente, EL ALIADO plantea preguntas simples que
          despierten curiosidad genuina sobre el control real del negocio.
          Preguntas orientadoras:
        </Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>"¿Cómo te aseguras de que un cliente vuelva?"</Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>"¿Sabes cuántos clientes tienes ahorita, en este momento?"</Text>
        </View>
        <Text style={styles.p}>
          Si el dueño muestra interés, EL ALIADO lo dirige al canal oficial de
          WhatsApp de BarberosPlus con su código asignado. A partir de ahí, el
          proceso de información, demostración y activación continúa conforme a
          la Cláusula Cuarta. Este documento no constituye relación laboral:
          no genera nómina, décimos, vacaciones, seguro social patronal ni
          ningún otro beneficio propio de una relación de dependencia.
        </Text>

        <Text style={styles.h2}>CLÁUSULA SEGUNDA — MODALIDADES DE PARTICIPACIÓN</Text>
        <Text style={styles.p}>
          EL ALIADO puede generar comisión bajo dos modalidades que se
          determinan por cada activación individual según cómo se haya
          gestionado:
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Modalidad Referido.</Text>{" "}
          EL ALIADO únicamente despierta el interés y deriva al prospecto al
          canal de WhatsApp. BarberosPlus asume desde ahí toda la información,
          demostración y cierre de la venta.
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Modalidad Cierre.</Text>{" "}
          EL ALIADO, además de derivar, participa activamente del proceso de
          demostración, manejo de objeciones y cierre hasta lograr la
          activación pagada. La modalidad aplicable se determina según quién
          haya realizado la gestión de cierre, registrada por BarberosPlus al
          activar la cuenta. En caso de discrepancia, BarberosPlus determinará
          la modalidad con base en su registro.
        </Text>

        <Text style={styles.p}>
          Las comisiones se generan únicamente cuando el cliente paga
          efectivamente (no por registro en periodo de prueba sin conversión a
          pago). El detalle monetario, por modalidad y tipo de plan, es:
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Modalidad</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Plan Pro / Premium (mensual o anual)</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Plan Lifetime (Pro o Premium)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Referido</Text>
            <Text style={styles.tableCell}>USD 10 fijos por activación</Text>
            <Text style={styles.tableCell}>USD 25 fijos por activación</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCell}>Cierre</Text>
            <Text style={styles.tableCell}>USD 25 por configuración + 10% mensual de por vida</Text>
            <Text style={styles.tableCell}>10% del total Lifetime (USD 500 Pro / USD 1.000 Premium)</Text>
          </View>
        </View>
        <Text style={styles.p}>
          El 10% se calcula únicamente sobre la mensualidad del plan. Los toques
          de Inteligencia Artificial (USD 5/mes, opcionales) NO generan
          comisión. Si el cliente migra de Pro a Premium, la comisión se
          recalcula automáticamente sobre la nueva mensualidad. En planes
          Lifetime pagados en cuotas (hasta 12, vía Payphone), la comisión se
          libera proporcionalmente conforme BarberosPlus reciba cada cuota. El
          periodo de prueba gratuito de 15 días aplica únicamente al plan Pro.
        </Text>
        <Text style={styles.p}>
          Todo pago del cliente final se realiza directamente a las cuentas de
          BarberosPlus / Cesar Reyes. EL ALIADO en ningún momento recibe pagos
          directos del cliente. Las comisiones se pagan mensualmente, dentro de
          los primeros{" "}
          <Text style={styles.fieldAccent}>{data.diasPagoComision}</Text>{" "}
          días de cada mes, sobre lo efectivamente cobrado el mes anterior.
          Método de pago:{" "}
          <Text style={styles.fieldAccent}>{metodoPagoLabel(data.metodoPago)}</Text>.
        </Text>

        <Text style={styles.h2}>CLÁUSULA CUARTA — DERIVACIÓN Y ATRIBUCIÓN DEL PROSPECTO</Text>
        <Text style={styles.p}>
          4.1 EL ALIADO identifica, dentro de su cartera habitual, a un dueño
          de barbería o salón con quien ya tiene relación de confianza, y
          utiliza las preguntas simples de la Cláusula Primera para despertar
          interés genuino. Si el dueño muestra interés, EL ALIADO lo dirige al
          canal oficial de WhatsApp con su código asignado.
        </Text>
        <Text style={styles.p}>
          4.2 Al escribir por ese canal, el prospecto queda registrado y
          atribuido al código de EL ALIADO durante <Text style={styles.bold}>30
          días naturales</Text>. Cualquier activación pagada en esa ventana se
          reconoce a favor de EL ALIADO, sin importar si el cierre final lo
          gestiona BarberosPlus (Referido) o el propio ALIADO (Cierre). Vencido
          el plazo de 30 días sin activación pagada, la atribución se libera y
          puede ser asignada nuevamente al Aliado que retome el contacto.
        </Text>
        <Text style={styles.p}>
          4.3 Si dos o más códigos quedan asociados al mismo prospecto dentro
          de la ventana vigente, prevalece el primero que haya logrado la
          activación pagada efectiva.
        </Text>
        <Text style={styles.p}>
          4.4 El negocio propio de EL ALIADO, si decide activar BarberosPlus
          para uso personal, queda EXCLUIDO de generar comisión a su favor.
        </Text>

        <Text style={styles.h2}>CLÁUSULAS QUINTA Y SEXTA — CAPACITACIÓN, METAS Y CONTINUIDAD</Text>
        <Text style={styles.p}>
          EL ALIADO declara haber completado la capacitación previa impartida
          por BarberosPlus sobre preguntas orientadoras, límites operativos
          (Cláusula Octava) y proceso de derivación. Se espera una meta mínima
          orientativa de activaciones pagadas por mes, comunicada al asignar el
          código. Su incumplimiento reiterado puede derivar en el retiro del
          código, previa notificación. El retiro NUNCA afecta las comisiones
          ya devengadas —se pagan en su totalidad— ni la comisión recurrente
          de por vida sobre barberías ya activadas (ver Cláusula Novena 9.3).
        </Text>

        <Text style={styles.p}>
          Si el prospecto derivado corresponde a una cadena o franquicia con
          múltiples locales, este caso NO se rige automáticamente por la
          estructura de comisión estándar. BarberosPlus y EL ALIADO acordarán
          las condiciones comerciales aplicables por escrito ANTES de iniciar
          cualquier gestión de cierre con ese prospecto.
        </Text>

        <Text style={styles.h2}>CLÁUSULA OCTAVA — LÍMITES OPERATIVOS</Text>
        <Text style={styles.p}>
          EL ALIADO se obliga a NO usar la palabra "gratis" para la
          configuración inicial (USD 50, valor promocional vigente), NO
          mencionar "inteligencia artificial" como gancho de venta, NO prometer
          reseñas automáticas de Google en plazo fijo (solo se envía
          automáticamente con 5 estrellas; calificaciones menores generan
          comentario privado), NO inventar precios fuera de{" "}
          <Text style={styles.summaryLink}>barberosplus.com/precios</Text>, NO
          prometer plazos de soporte o funcionalidades no confirmadas, y NO
          realizar declaraciones falsas sobre su cartera. El incumplimiento
          causa revocación inmediata del código, sin perjuicio de las
          comisiones ya devengadas. El detalle operativo completo se entrega en
          el <Text style={styles.bold}>Manual del Aliado</Text> que EL ALIADO
          recibe al activar su código.
        </Text>

        <Text style={styles.h2}>CLÁUSULA NOVENA — VIGENCIA Y TERMINACIÓN</Text>
        <Text style={styles.p}>
          9.1 Vigencia indefinida desde la firma, sujeta a las metas de la
          Cláusula Sexta.
        </Text>
        <Text style={styles.p}>
          9.2 Cualquier parte puede terminar la Alianza con preaviso de 15
          días, sin necesidad de justificación.
        </Text>
        <Text style={styles.p}>
          9.3 La terminación NO extingue la comisión recurrente del 10%
          mensual (Modalidad Cierre) sobre las barberías ya activadas, mientras
          permanezcan como clientes activos de BarberosPlus. Este derecho
          sobrevive a la terminación.
        </Text>

        <Text style={styles.h2}>CLÁUSULA DÉCIMA — NATURALEZA DEL ACUERDO</Text>
        <Text style={styles.p}>
          Las partes declaran que la presente Alianza es de naturaleza
          civil-mercantil y no laboral. EL ALIADO actúa como colaborador
          comercial independiente, sin subordinación, sin horario impuesto, y
          sin exclusividad salvo lo indicado respecto a zona/territorio si
          aplica. EL ALIADO es responsable de sus obligaciones tributarias
          derivadas de las comisiones percibidas, conforme a la normativa
          vigente en Ecuador.
        </Text>

        <Text style={styles.h2}>CLÁUSULA DÉCIMO PRIMERA — CONFIDENCIALIDAD</Text>
        <Text style={styles.p}>
          EL ALIADO se compromete a mantener confidencialidad sobre precios
          internos no publicados, estructura de comisiones de otros Aliados, y
          cualquier información estratégica de BarberosPlus a la que tenga
          acceso en el marco de esta Alianza.
        </Text>

        <Text style={styles.pMuted}>
          Nota: las modificaciones a esta Alianza deben constar por escrito y ser
          firmadas por ambas partes, conforme al Código Civil ecuatoriano.
        </Text>

        <Text style={styles.p}>
          Leído y aceptado en su totalidad por ambas partes, firman en la
          ciudad de{" "}
          <Text style={styles.fieldAccent}>{data.ciudadFirma}</Text>, a los{" "}
          <Text style={styles.fieldAccent}>{data.diaFirma}</Text> días del mes
          de <Text style={styles.fieldAccent}>{data.mesFirma}</Text> del año{" "}
          <Text style={styles.fieldAccent}>{data.anioFirma}</Text>. Se emite un
          ejemplar digital para cada parte; ambos tienen igual contenido y
          validez. Para referencias operativas (precios, preguntas orientadoras,
          límites completos) consultar el Manual del Aliado y{" "}
          <Text style={styles.summaryLink}>barberosplus.com/precios</Text>.
        </Text>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureCol}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>César Reyes</Text>
            <Text style={styles.signatureMeta}>BarberosPlus.com</Text>
            <Text style={styles.signatureMeta}>Persona natural · Titular del negocio</Text>
          </View>
          <View style={styles.signatureCol}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{data.nombreCompleto}</Text>
            <Text style={styles.signatureMeta}>EL ALIADO</Text>
            <Text style={styles.signatureMeta}>C.I.: {data.cedula}</Text>
            <Text style={styles.signatureMeta}>WhatsApp: {data.celular}</Text>
          </View>
        </View>

        <View style={styles.acceptedBlock}>
          <Text style={styles.acceptedText}>
            ACEPTADO ELECTRÓNICAMENTE ·{" "}
            {new Date(acceptedAt).toLocaleString("es-EC", {
              timeZone: "America/Guayaquil",
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            (UTC-5) · IP registrada
          </Text>
        </View>

        <PageFooter generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}

// ============================================================
// UTILS PRIVADOS
// ============================================================
const MES_IDX = (mes: AlianzaInput["mesFirma"]) =>
  [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ].indexOf(mes);

export async function renderAlianzaPdf(
  data: AlianzaInput,
  meta: { generatedAt?: string; acceptedAt?: string } = {}
): Promise<Buffer> {
  const now = new Date();
  const generatedAt = meta.generatedAt ?? now.toISOString();
  const acceptedAt = meta.acceptedAt ?? generatedAt;

  return await renderToBuffer(
    <AlianzaDocument data={data} generatedAt={generatedAt} acceptedAt={acceptedAt} />
  );
}