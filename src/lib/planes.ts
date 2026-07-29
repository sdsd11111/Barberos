// src/lib/planes.ts
// Definición canónica de los planes de BarberOS.
// Única fuente de verdad — consumido por /precios, /pro y /premium.
// Cualquier cambio en precios, features o copy de plan debe hacerse aquí.

export interface Plan {
  tipo: string;
  precio: string;
  periodo: string;
  descripcion: string;
  incluye: string[];
  nota: string;
  destacado: boolean;
  whatsapp: boolean;
}

export const planesPro: Plan[] = [
  {
    tipo: "Prueba 15 días",
    precio: "$0",
    periodo: "15 días",
    descripcion: "Prueba BarberOS Pro gratis. Sin tarjeta, sin compromiso.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Setup regular USD 100 → Oferta USD 50 al activar",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Mensual",
    precio: "$9.99",
    periodo: "/ mes",
    descripcion: "Paga mes a mes sin compromiso.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Setup regular USD 100 → Oferta USD 50 al activar",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Anual",
    precio: "$99",
    periodo: "/ año",
    descripcion: "Ahorra más de USD 20 al año.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Equivale a $8.25/mes + Setup regular USD 100 (Oferta $50)",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Lifetime",
    precio: "$500",
    periodo: "pago único",
    descripcion: "Acceso permanente sin mensualidades.",
    incluye: [
      "Todo lo del plan Anual",
      "Actualizaciones gratis de por vida",
      "Sin costos mensuales",
      "Soporte por WhatsApp",
    ],
    nota: "Setup USD 50 en oferta incluido. O hasta 12 cuotas sin intereses",
    destacado: true,
    whatsapp: true,
  },
];

export const planesPremium: Plan[] = [
  {
    tipo: "Mensual",
    precio: "$19.99",
    periodo: "/ mes",
    descripcion: "Paga mes a mes sin compromiso.",
    incluye: [
      "Todo lo del plan Pro",
      "Motor de Conocimiento",
      "IA especializada en tu barbería",
      "Recomendaciones automáticas",
      "Alertas inteligentes",
      "Consultor IA 24/7",
    ],
    nota: "+ USD 5/mes tokens IA. Setup regular USD 100 → Oferta USD 50",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Anual",
    precio: "$199",
    periodo: "/ año",
    descripcion: "Ahorra más de USD 40 al año.",
    incluye: [
      "Todo lo del plan Pro",
      "Motor de Conocimiento",
      "IA especializada en tu barbería",
      "Recomendaciones automáticas",
      "Alertas inteligentes",
      "Consultor IA 24/7",
    ],
    nota: "Equivale a $16.58/mes + tokens. Setup regular USD 100 (Oferta $50)",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Lifetime",
    precio: "$1000",
    periodo: "pago único",
    descripcion: "Acceso permanente sin mensualidades.",
    incluye: [
      "Todo lo del plan Anual",
      "Actualizaciones gratis de por vida",
      "Sin costos mensuales",
      "Soporte prioritario por WhatsApp",
    ],
    nota: "Setup USD 50 en oferta incluido. Tokens IA 2 años. Hasta 12 cuotas",
    destacado: true,
    whatsapp: true,
  },
];