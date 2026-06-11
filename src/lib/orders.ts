export const ORDER_STATUS_STEPS = ["Pending", "Confirmed", "Packed", "Out For Delivery"] as const;

export type OrderStatus = (typeof ORDER_STATUS_STEPS)[number];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-purple-100 text-purple-700",
  "Out For Delivery": "bg-green-100 text-green-700",
};

export function normalizeOrderStatus(status: string): OrderStatus {
  return ORDER_STATUS_STEPS.includes(status as OrderStatus) ? (status as OrderStatus) : "Confirmed";
}

export function getOrderStatusStep(status: string) {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_STEPS.indexOf(normalized);
}

export const WHATSAPP_SUPPORT_NUMBER = "919999999999";

export function buildCancellationMessage(orderNumber: string) {
  return encodeURIComponent(
    `Hello Drace Core,\n\nI would like to request cancellation of my order.\n\nOrder ID: ${orderNumber}\n\nPlease assist me.`,
  );
}

export function openCancellationWhatsApp(orderNumber: string) {
  const message = buildCancellationMessage(orderNumber);
  window.open(
    `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${message}`,
    "_blank",
    "noopener,noreferrer",
  );
}
