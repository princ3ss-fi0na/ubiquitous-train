import { Order, STATUS_LABELS } from "./orders";

const BOT_TOKEN = "8522642079:AAE6tS0Z8eiAjm2u23aKAEudfv-KyqsIVsc";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ADMIN_CHAT_ID = 1696302243;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendMessage(chatId: number, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyAdminNewOrder(order: Order): Promise<boolean> {
  const items = order.items
    .map((i) => `  • ${escapeHtml(i.name)} (${i.brand}) × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} ₽`)
    .join("\n");

  const text =
    `🛒 <b>Новый заказ #${order.id}</b>\n\n` +
    `👤 ${escapeHtml(order.customerName)}\n` +
    `📱 ${escapeHtml(order.customerPhone)}\n` +
    `${(order as any).customerRegion ? `🗺 ${escapeHtml((order as any).customerRegion)}\n` : ""}` +
    `${order.customerCity ? `🏙 ${escapeHtml(order.customerCity)}\n` : ""}` +
    `📍 ${escapeHtml(order.customerAddress)}\n` +
    `${order.comment ? `💬 ${escapeHtml(order.comment)}\n` : ""}` +
    `\n📦 <b>Товары:</b>\n${items}\n\n` +
    `💰 <b>Итого: ${order.total.toLocaleString()} ₽</b>\n` +
    `🆔 Telegram: ${order.telegramId ?? "N/A"}`;

  return sendMessage(ADMIN_CHAT_ID, text);
}

export async function notifyUserOrderConfirmed(order: Order): Promise<boolean> {
  if (!order.telegramId) return false;
  const text =
    `✅ <b>Заказ #${order.id} подтверждён!</b>\n\n` +
    `Мы начали обработку вашего заказа.\n` +
    `Общая сумма: <b>${order.total.toLocaleString()} ₽</b>\n\n` +
    `Мы уведомим вас, когда заказ будет отправлен.`;
  return sendMessage(order.telegramId, text);
}

export async function notifyUserTrackingUpdate(order: Order): Promise<boolean> {
  if (!order.telegramId) return false;
  const statusLabel = STATUS_LABELS[order.status];
  let text = `📋 <b>Заказ #${order.id}</b>\nСтатус: <b>${statusLabel}</b>`;
  if (order.trackingNumber) {
    text += `\n\n📦 Трек-номер: <code>${escapeHtml(order.trackingNumber)}</code>`;
    if (order.trackingCarrier) {
      text += `\nСлужба доставки: ${escapeHtml(order.trackingCarrier)}`;
    }
    text += `\n\nОтследить: https://track24.ru/?code=${encodeURIComponent(order.trackingNumber)}`;
  }
  return sendMessage(order.telegramId, text);
}

export async function notifyUserOrderDelivered(order: Order): Promise<boolean> {
  if (!order.telegramId) return false;
  const text =
    `🎉 <b>Заказ #${order.id} доставлен!</b>\n\n` +
    `Спасибо за покупку в CarTech!\n` +
    `Будем рады видеть вас снова.`;
  return sendMessage(order.telegramId, text);
}
