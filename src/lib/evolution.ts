import axios from "axios";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

interface SendMessageParams {
  instance: string;
  apiKey: string;
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({
  instance,
  apiKey,
  to,
  message,
}: SendMessageParams): Promise<void> {
  const url = `${EVOLUTION_API_URL}/message/sendText/${instance}`;
  const number = to.replace(/\D/g, "");

  try {
    await axios.post(
      url,
      {
        number,
        text: message,
        options: {
          delay: 1200,
        },
        textMessage: {
          text: message,
        },
      },
      {
        headers: {
          apikey: apiKey || EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown }; message?: string };
    console.error("[Evolution API] Error sending WhatsApp message:", axiosError.message ?? error);
    if (axiosError.response?.data) {
      console.error("[Evolution API] Response data:", JSON.stringify(axiosError.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Crea una instancia dinámica en Evolution API
 */
export async function createEvolutionInstance(instanceName: string): Promise<boolean> {
  try {
    const url = `${EVOLUTION_API_URL}/instance/create`;
    const response = await axios.post(
      url,
      {
        instanceName,
        token: "",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      },
      {
        headers: {
          apikey: EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status === 201 || response.status === 200;
  } catch (error: any) {
    // Si la instancia ya existe (409 Conflict o 403 Forbidden con "already in use"), se considera exitoso
    const status = error.response?.status;
    const message = JSON.stringify(error.response?.data || "");
    if (status === 409 || (status === 403 && message.includes("already in use"))) {
      console.log(`[Evolution API] Instance ${instanceName} already exists. Continuing...`);
      return true;
    }
    console.error("[Evolution API] Error creating instance:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Configura el webhook para una instancia específica en Evolution API
 */
export async function configureEvolutionWebhook(instanceName: string, webhookUrl: string): Promise<boolean> {
  try {
    const url = `${EVOLUTION_API_URL}/webhook/set/${instanceName}`;
    const response = await axios.post(
      url,
      {
        webhook: {
          enabled: true,
          url: webhookUrl,
          webhookByEvents: true,
          events: [
            "MESSAGES_UPSERT",
            "CONNECTION_UPDATE"
          ]
        }
      },
      {
        headers: {
          apikey: EVOLUTION_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error("[Evolution API] Error configuring webhook:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Obtiene el código QR fresco para la instancia en formato base64/JSON con reintentos para máxima estabilidad
 */
export async function getFreshQR(instanceName: string): Promise<{ qrcode?: string; code?: string; success: boolean }> {
  const url = `${EVOLUTION_API_URL}/instance/connect/${instanceName}`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          apikey: EVOLUTION_API_KEY,
        },
        timeout: 5000,
      });

      const data = response.data;
      const base64 = data?.base64 || data?.qrcode?.base64 || data?.code;

      if (base64) {
        // Asegurar prefijo data:image/png;base64, si viene raw
        const formattedQr = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
        return { qrcode: formattedQr, code: data?.pairingCode || data?.code, success: true };
      }

      // Si no devolvió QR en este intento, esperar 800ms y reintentar
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (error: any) {
      console.error(`[Evolution API] Intento ${attempt} fallido obteniendo QR:`, error.response?.data || error.message);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  return { success: false };
}

/**
 * Obtiene el estado de conexión de la instancia
 */
export async function getEvolutionStatus(instanceName: string): Promise<string> {
  try {
    const url = `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
    const response = await axios.get(url, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
    });
    return response.data?.instance?.state || "DISCONNECTED";
  } catch (error: any) {
    console.error("[Evolution API] Error getting connection state:", error.response?.data || error.message);
    return "DISCONNECTED";
  }
}

/**
 * Elimina una instancia de Evolution API
 */
export async function deleteEvolutionInstance(instanceName: string): Promise<boolean> {
  try {
    const url = `${EVOLUTION_API_URL}/instance/delete/${instanceName}`;
    await axios.delete(url, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
    });
    console.log(`[Evolution API] Instance ${instanceName} deleted successfully.`);
    return true;
  } catch (error: any) {
    console.error("[Evolution API] Error deleting instance:", error.response?.data || error.message);
    return false;
  }
}

