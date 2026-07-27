const WHATSAPP_NUMBER = "593963425323";

export function getWhatsAppUrl(codigoUnico: string): string {
  const text = encodeURIComponent(`Hola, me interesa el sistema, vengo de parte de ${codigoUnico}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function getQrDataUrl(codigoUnico: string, size: number = 256): string {
  const url = getWhatsAppUrl(codigoUnico);
  // Usamos API de QR Server para generar el QR
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
