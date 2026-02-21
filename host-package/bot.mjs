/**
 * CarTech Telegram Bot
 * Запуск: node bot.mjs
 *
 * Функции:
 * - /start — Приветствие + открытие WebApp
 * - /mycar — Выбор/просмотр авто в гараже
 * - /profile — Профиль пользователя
 * - /orders — Мои заказы
 * - /track <номер> — Отслеживание посылки
 * - /support — Связь с менеджером
 * - /help — Помощь
 *
 * Данные хранятся в SQLite (cartech.db)
 */

import * as DB from "./db.mjs";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err?.message, err?.stack);
});
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED:", err?.message, err?.stack);
});

const BOT_TOKEN = "8522642079:AAE6tS0Z8eiAjm2u23aKAEudfv-KyqsIVsc";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBAPP_URL = "https://bekker6v.beget.tech/";
const ADMIN_ID = 1696302243;

// Only transient UI state stays in memory
const userStates = new Map();

// ============== SUPPORT CHAT (DB-backed) ==============

async function handleSupport(chatId, user) {
  const existing = DB.getActiveSupportSession(chatId);
  if (existing && existing.status === "active") {
    return sendMessage(chatId,
      "💬 <b>Вы уже в чате с менеджером.</b>\n\nПросто пишите сообщение — оно будет переслано.\n\nДля завершения: /endchat"
    );
  }
  if (existing && existing.status === "waiting") {
    return sendMessage(chatId,
      "⏳ <b>Ваш запрос уже в очереди.</b>\n\nМенеджер скоро подключится. Пока можете описать проблему — всё будет переслано."
    );
  }

  userStates.set(chatId, { action: "awaiting_support_question" });
  await sendMessage(chatId,
    "💬 <b>Связь с менеджером</b>\n\n" +
    "Опишите ваш вопрос или проблему одним сообщением.\n" +
    "Менеджер получит его и подключится к диалогу.",
    makeKeyboard([[{ text: "← Отмена", callback_data: "support_cancel" }]])
  );
}

async function handleSupportQuestion(chatId, text, user) {
  const userName = user?.first_name || "Пользователь";
  const profile = DB.getProfile(chatId);
  const fullName = profile.name || userName;
  const phone = profile.phone || "не указан";
  const garage = DB.getGarage(chatId);
  const carInfo = garage.length > 0
    ? garage.filter(c => c.is_primary).map(c => `${c.brand} ${c.model} ${c.year}`).join(", ") || garage.map(c => `${c.brand} ${c.model}`).join(", ")
    : "не указано";

  const sessionId = DB.createSupportSession(chatId, {
    userName: fullName, userTgName: userName, question: text, phone, car: carInfo,
  });
  userStates.delete(chatId);

  await sendMessage(chatId,
    "✅ <b>Запрос отправлен!</b>\n\n" +
    "⏳ Ожидайте подключения менеджера.\n" +
    "Вы можете продолжать писать — все сообщения будут сохранены и переданы.\n\n" +
    "Для отмены: /endchat"
  );

  const queueCount = DB.getWaitingSupportSessions().length;

  const adminText =
    `🔔 <b>Новый запрос в поддержку</b>\n\n` +
    `👤 <b>${fullName}</b> (@${user?.username || "—"})\n` +
    `🆔 <code>${chatId}</code>\n` +
    `📱 ${phone}\n` +
    `🚗 ${carInfo}\n\n` +
    `💬 <b>Вопрос:</b>\n${text}\n\n` +
    `📋 В очереди: ${queueCount}`;

  await sendMessage(ADMIN_ID, adminText, makeKeyboard([
    [{ text: "✅ Принять запрос", callback_data: `sup_accept_${chatId}` }],
    [{ text: "❌ Отклонить", callback_data: `sup_reject_${chatId}` }],
  ]));
}

async function handleSupportAccept(adminChatId, messageId, userId) {
  if (!isAdmin(adminChatId)) return;

  const session = DB.getActiveSupportSession(userId);
  if (!session) {
    return editMessage(adminChatId, messageId, "❌ Сессия не найдена или уже закрыта.",
      makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]]));
  }
  if (session.status === "active") {
    return editMessage(adminChatId, messageId, "ℹ️ Вы уже в диалоге с этим пользователем.",
      makeKeyboard([[{ text: "🔚 Завершить чат", callback_data: `sup_close_${userId}` }]]));
  }

  DB.acceptSupportSession(session.id);
  userStates.set(adminChatId, { action: "support_chat", targetUserId: userId });

  const messages = DB.getSupportMessages(session.id);
  const accumulated = messages.length > 1
    ? `📝 <b>Накопленные сообщения:</b>\n${messages.map(h => `${h.sender === "user" ? "👤" : "👨‍💼"} ${h.text}`).join("\n")}\n\n`
    : "";

  await editMessage(adminChatId, messageId,
    `✅ <b>Чат с ${session.user_name} открыт</b>\n\n` +
    `👤 ${session.user_name} (ID: <code>${userId}</code>)\n` +
    `📱 ${session.phone}\n` +
    `🚗 ${session.car}\n\n` +
    `💬 <b>Вопрос:</b> ${session.question}\n\n` +
    accumulated +
    `<i>Теперь все ваши сообщения будут пересылаться клиенту. Для завершения: /endchat</i>`,
    makeKeyboard([[{ text: "🔚 Завершить чат", callback_data: `sup_close_${userId}` }]])
  );

  await sendMessage(userId,
    "✅ <b>Менеджер подключился!</b>\n\n" +
    "Теперь вы общаетесь напрямую с менеджером.\n" +
    "Просто пишите сообщения — они будут переданы.\n\n" +
    "Для завершения: /endchat"
  );
}

async function handleSupportReject(adminChatId, messageId, userId) {
  if (!isAdmin(adminChatId)) return;

  const session = DB.getActiveSupportSession(userId);
  if (!session) {
    return editMessage(adminChatId, messageId, "❌ Сессия не найдена.",
      makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]]));
  }

  DB.closeSupportSession(session.id);

  await editMessage(adminChatId, messageId,
    `❌ Запрос от <b>${session.user_name}</b> отклонён.`,
    makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]])
  );

  await sendMessage(userId,
    "❌ <b>Запрос отклонён</b>\n\n" +
    "К сожалению, менеджер сейчас не может ответить.\n" +
    "Попробуйте позже или напишите: @CMOLEHCK"
  );
}

async function handleSupportClose(chatId, messageId, userId) {
  const session = DB.getActiveSupportSession(userId);
  if (session) DB.closeSupportSession(session.id);

  if (chatId === ADMIN_ID) {
    const adminState = userStates.get(chatId);
    if (adminState?.action === "support_chat") userStates.delete(chatId);
  }

  const closedBy = chatId === ADMIN_ID ? "менеджером" : "пользователем";
  const uname = session?.user_name || userId;

  if (chatId === ADMIN_ID) {
    const method = messageId ? editMessage : sendMessage;
    const args = messageId ? [chatId, messageId] : [chatId];
    await method(...args,
      `🔚 Чат с <b>${uname}</b> завершён.`,
      makeKeyboard([
        [{ text: "📋 Очередь", callback_data: "sup_queue" }],
        [{ text: "← Админ", callback_data: "adm_back" }],
      ])
    );
  }

  if (chatId === ADMIN_ID && userId !== ADMIN_ID) {
    await sendMessage(userId,
      `🔚 <b>Чат завершён ${closedBy}.</b>\n\nЕсли остались вопросы — /support`
    );
  } else if (chatId !== ADMIN_ID) {
    await sendMessage(chatId,
      `🔚 <b>Чат завершён.</b>\n\nЕсли остались вопросы — /support`
    );
    const adminState = userStates.get(ADMIN_ID);
    if (adminState?.action === "support_chat" && adminState?.targetUserId === chatId) {
      userStates.delete(ADMIN_ID);
      await sendMessage(ADMIN_ID,
        `🔚 Пользователь <b>${uname}</b> завершил чат.`,
        makeKeyboard([
          [{ text: "📋 Очередь", callback_data: "sup_queue" }],
          [{ text: "← Админ", callback_data: "adm_back" }],
        ])
      );
    }
  }
}

async function forwardToAdmin(userId, text, user) {
  const session = DB.getActiveSupportSession(userId);
  if (!session) return false;

  DB.addSupportMessage(session.id, "user", text);

  if (session.status === "active") {
    const userName = session.user_name || user?.first_name || "Пользователь";
    await sendMessage(ADMIN_ID,
      `👤 <b>${userName}:</b>\n${text}`,
      makeKeyboard([[{ text: "🔚 Завершить чат", callback_data: `sup_close_${userId}` }]])
    );
  }
  return true;
}

async function forwardToUser(adminChatId, targetUserId, text) {
  const session = DB.getActiveSupportSession(targetUserId);
  if (!session || session.status !== "active") {
    await sendMessage(adminChatId, "⚠️ Сессия не активна. Диалог уже завершён.");
    userStates.delete(adminChatId);
    return;
  }

  DB.addSupportMessage(session.id, "admin", text);
  await sendMessage(targetUserId, `👨‍💼 <b>Менеджер:</b>\n${text}`);
}

async function handleEndChat(chatId) {
  const session = DB.getActiveSupportSession(chatId);
  if (session) {
    return handleSupportClose(chatId, null, chatId);
  }

  if (chatId === ADMIN_ID) {
    const state = userStates.get(chatId);
    if (state?.action === "support_chat") {
      return handleSupportClose(chatId, null, state.targetUserId);
    }
  }

  await sendMessage(chatId, "ℹ️ Нет активного диалога с поддержкой.");
}

async function handleSupportQueue(chatId, messageId) {
  if (!isAdmin(chatId)) return;

  const waiting = DB.getWaitingSupportSessions();
  const active = DB.getActiveSupportSessions();

  let text = "📋 <b>Очередь поддержки</b>\n\n";

  if (active.length > 0) {
    text += "🟢 <b>Активные чаты:</b>\n";
    active.forEach(s => {
      const msgCount = DB.getSupportMessages(s.id).length;
      text += `  👤 <b>${s.user_name}</b> (ID: <code>${s.user_id}</code>)\n`;
      text += `  💬 ${(s.question || "").slice(0, 60)}${(s.question || "").length > 60 ? "…" : ""}\n`;
      text += `  📝 Сообщений: ${msgCount}\n\n`;
    });
  }

  if (waiting.length > 0) {
    text += "🟡 <b>Ожидают ответа:</b>\n";
    waiting.forEach((s, i) => {
      const ago = Math.round((Date.now() - new Date(s.created_at).getTime()) / 60000);
      text += `  ${i + 1}. <b>${s.user_name}</b> (ID: <code>${s.user_id}</code>)\n`;
      text += `  💬 ${(s.question || "").slice(0, 60)}${(s.question || "").length > 60 ? "…" : ""}\n`;
      text += `  ⏱ ${ago} мин. назад\n\n`;
    });
  }

  if (waiting.length === 0 && active.length === 0) {
    text += "Нет активных или ожидающих запросов.";
  }

  const buttons = [];
  waiting.forEach(s => {
    buttons.push([{ text: `✅ Принять — ${s.user_name}`, callback_data: `sup_accept_${s.user_id}` }]);
  });
  active.forEach(s => {
    buttons.push([
      { text: `💬 ${s.user_name}`, callback_data: `sup_chat_${s.user_id}` },
      { text: `🔚 Закрыть`, callback_data: `sup_close_${s.user_id}` },
    ]);
  });
  buttons.push([{ text: "← Админ", callback_data: "adm_back" }]);

  if (messageId) return editMessage(chatId, messageId, text, makeKeyboard(buttons));
  return sendMessage(chatId, text, makeKeyboard(buttons));
}

async function handleSupportChatSwitch(adminChatId, messageId, userId) {
  if (!isAdmin(adminChatId)) return;

  const session = DB.getActiveSupportSession(userId);
  if (!session || session.status !== "active") {
    return editMessage(adminChatId, messageId, "⚠️ Сессия не активна.",
      makeKeyboard([[{ text: "📋 Очередь", callback_data: "sup_queue" }]]));
  }

  userStates.set(adminChatId, { action: "support_chat", targetUserId: userId });

  const messages = DB.getSupportMessages(session.id, 10);
  const recentMsgs = messages.map(h =>
    `${h.sender === "user" ? "👤" : "👨‍💼"} ${h.text}`
  ).join("\n");

  await editMessage(adminChatId, messageId,
    `💬 <b>Чат с ${session.user_name}</b>\n\n` +
    `📝 <b>Последние сообщения:</b>\n${recentMsgs || "—"}\n\n` +
    `<i>Пишите сообщение — оно будет отправлено клиенту.</i>`,
    makeKeyboard([[{ text: "🔚 Завершить чат", callback_data: `sup_close_${userId}` }]])
  );
}
// ============== END SUPPORT CHAT ==============

const CAR_BRANDS = [
  { id: "toyota", name: "Toyota" }, { id: "nissan", name: "Nissan" },
  { id: "hyundai", name: "Hyundai" }, { id: "kia", name: "KIA" },
  { id: "volkswagen", name: "Volkswagen" }, { id: "bmw", name: "BMW" },
  { id: "mercedes", name: "Mercedes" }, { id: "audi", name: "Audi" },
  { id: "lada", name: "LADA" }, { id: "ford", name: "Ford" },
  { id: "chevrolet", name: "Chevrolet" }, { id: "renault", name: "Renault" },
  { id: "mazda", name: "Mazda" }, { id: "honda", name: "Honda" },
  { id: "mitsubishi", name: "Mitsubishi" }, { id: "skoda", name: "Škoda" },
  { id: "geely", name: "Geely" }, { id: "chery", name: "Chery" },
  { id: "byd", name: "BYD" },
];

const CAR_MODELS = {
  toyota: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux"],
  nissan: ["X-Trail", "Qashqai", "Almera", "Teana"],
  hyundai: ["Solaris", "Creta", "Tucson", "Santa Fe"],
  kia: ["Rio", "Ceed", "Sportage", "Sorento"],
  volkswagen: ["Polo", "Golf", "Tiguan", "Passat"],
  bmw: ["3 серия", "5 серия", "X3", "X5"],
  mercedes: ["C-класс", "E-класс", "GLC", "GLE"],
  audi: ["A3", "A4", "Q5", "Q7"],
  lada: ["Vesta", "Granta", "Niva Travel", "Largus"],
  ford: ["Focus", "Kuga", "Mondeo"],
  chevrolet: ["Cruze", "Niva", "Captiva"],
  renault: ["Duster", "Logan", "Kaptur"],
  mazda: ["Mazda 3", "CX-5", "Mazda 6"],
  honda: ["Civic", "CR-V", "Accord"],
  mitsubishi: ["Outlander", "ASX", "Lancer", "Pajero Sport"],
  skoda: ["Octavia", "Rapid", "Kodiaq"],
  geely: ["Coolray", "Atlas", "Monjaro"],
  chery: ["Tiggo 7 Pro", "Tiggo 4", "Tiggo 8 Pro"],
  byd: ["Song Plus", "Han", "Seal"],
};

async function api(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId, text, extra = {}) {
  const result = await api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
  if (!result.ok) console.error("sendMessage FAIL:", chatId, JSON.stringify(result).slice(0, 300));
  return result;
}

async function answerCallback(callbackId, text = "") {
  return api("answerCallbackQuery", { callback_query_id: callbackId, text });
}

async function editMessage(chatId, messageId, text, extra = {}) {
  return api("editMessageText", { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", ...extra });
}

function makeKeyboard(buttons) {
  return { reply_markup: { inline_keyboard: buttons } };
}

function isStartCommand(text) {
  return /^\/start(?:@\w+)?(?:\s+.*)?$/i.test((text || "").trim());
}

function isMenuCommand(text) {
  const t = (text || "").trim().toLowerCase();
  return t === "/menu" || t === "/s" || t === "start" || t === "меню";
}

async function handleStart(chatId, user) {
  DB.ensureUser(chatId);
  const name = user?.first_name || "друг";
  const text =
    `🚗 <b>Добро пожаловать в CarTech, ${name}!</b>\n\n` +
    `Здесь вы найдёте запчасти для любого авто.\n\n` +
    `📋 <b>Что я умею:</b>\n` +
    `/mycar — Мой гараж (выбрать авто)\n` +
    `/profile — Мой профиль\n` +
    `/orders — Мои заказы\n` +
    `/track — Отследить посылку\n` +
    `/support — Связь с менеджером\n` +
    `/menu — Главное меню\n` +
    `/help — Помощь\n\n` +
    `Нажмите кнопку ниже, чтобы открыть каталог 👇`;

  const buttons = [
    [{ text: "🛒 Открыть магазин", url: WEBAPP_URL }],
    [{ text: "🚗 Выбрать авто", callback_data: "garage_start" }],
    [{ text: "👤 Мой профиль", callback_data: "profile_view" }],
    [{ text: "💬 Написать менеджеру", callback_data: "support_start" }],
  ];
  if (chatId === ADMIN_ID) {
    buttons.push([{ text: "🔐 Админ-панель", callback_data: "adm_back" }]);
  }
  await sendMessage(chatId, text, { reply_markup: { inline_keyboard: buttons } });
}

async function handleMycar(chatId) {
  const garage = DB.getGarage(chatId);
  let text = "🚗 <b>Мой гараж</b>\n\n";

  if (garage.length === 0) {
    text += "У вас пока нет сохранённых авто.\nДобавьте своё авто, чтобы получать подходящие запчасти!";
  } else {
    garage.forEach((car) => {
      const star = car.is_primary ? "⭐ " : "";
      text += `${star}<b>${car.brand} ${car.model}</b> (${car.year}, ${car.engine})\n`;
    });
    text += "\nДобавьте ещё или измените основной автомобиль:";
  }

  const buttons = [
    [{ text: "➕ Добавить авто", callback_data: "garage_start" }],
  ];
  if (garage.length > 0) {
    buttons.push([{ text: "🗑 Очистить гараж", callback_data: "garage_clear" }]);
    buttons.push([{ text: "🛒 Подобрать запчасти", url: WEBAPP_URL }]);
  }

  await sendMessage(chatId, text, makeKeyboard(buttons));
}

async function handleGarageStart(chatId, messageId) {
  const buttons = [];
  for (let i = 0; i < CAR_BRANDS.length; i += 3) {
    const row = CAR_BRANDS.slice(i, i + 3).map((b) => ({
      text: b.name,
      callback_data: `brand_${b.id}`,
    }));
    buttons.push(row);
  }
  buttons.push([{ text: "✏️ Ввести марку вручную", callback_data: "brand_custom" }]);

  const text = "🚗 <b>Выберите марку авто:</b>\n\nНет вашей марки? Нажмите «Ввести вручную» внизу ⬇️";
  if (messageId) {
    await editMessage(chatId, messageId, text, makeKeyboard(buttons));
  } else {
    await sendMessage(chatId, text, makeKeyboard(buttons));
  }
}

async function handleBrandCustom(chatId, messageId) {
  userStates.set(chatId, { action: "awaiting_custom_brand" });
  await editMessage(
    chatId, messageId,
    "✏️ <b>Введите название марки</b>\n\nНапишите марку вашего авто текстом, например:\n<code>Haval</code>\n<code>Exeed</code>\n<code>FAW</code>\n<code>Tank</code>",
    makeKeyboard([[{ text: "← Назад к маркам", callback_data: "garage_start" }]])
  );
}

async function handleBrandSelect(chatId, messageId, brandId) {
  const models = CAR_MODELS[brandId] || [];
  const brand = CAR_BRANDS.find((b) => b.id === brandId);
  userStates.set(chatId, { action: "selecting_car", brandId, brandName: brand?.name, isCustomBrand: false });

  const buttons = models.map((m) => [{ text: m, callback_data: `model_${brandId}_${m}` }]);
  buttons.push([{ text: "✏️ Ввести модель вручную", callback_data: `model_custom_${brandId}` }]);
  buttons.push([{ text: "← Назад к маркам", callback_data: "garage_start" }]);

  await editMessage(chatId, messageId, `🚗 <b>${brand?.name}</b>\nВыберите модель:\n\nНет нужной? Нажмите «Ввести вручную»`, makeKeyboard(buttons));
}

async function handleModelSelect(chatId, messageId, brandId, model) {
  const state = userStates.get(chatId) || {};
  state.model = model;
  userStates.set(chatId, state);

  const currentYear = new Date().getFullYear();
  const buttons = [];
  for (let y = currentYear; y >= currentYear - 15; y -= 4) {
    const row = [];
    for (let j = 0; j < 4 && y - j >= currentYear - 15; j++) {
      row.push({ text: String(y - j), callback_data: `year_${y - j}` });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "✏️ Ввести год вручную", callback_data: "year_custom" }]);
  buttons.push([{ text: "← Назад", callback_data: `brand_${brandId}` }]);

  await editMessage(chatId, messageId, `🚗 <b>${state.brandName} ${model}</b>\nВыберите год выпуска:\n\nНет нужного? Нажмите «Ввести вручную»`, makeKeyboard(buttons));
}

async function handleYearSelect(chatId, messageId, year) {
  const state = userStates.get(chatId) || {};
  state.year = year;
  userStates.set(chatId, state);

  const engines = ["1.4L", "1.6L", "1.8L", "2.0L", "2.0L Turbo", "2.5L", "3.0L", "Diesel", "EV/Hybrid"];
  const buttons = engines.map((e) => [{ text: e, callback_data: `engine_${e}` }]);
  buttons.push([{ text: "✏️ Ввести вручную", callback_data: "engine_custom" }]);

  const text = `🚗 <b>${state.brandName} ${state.model} ${year}</b>\nВыберите двигатель:`;
  if (messageId) {
    await editMessage(chatId, messageId, text, makeKeyboard(buttons));
  } else {
    await sendMessage(chatId, text, makeKeyboard(buttons));
  }
}

async function handleEngineSelect(chatId, messageId, engine) {
  const state = userStates.get(chatId) || {};
  const car = {
    brand: state.brandName,
    brandId: state.brandId,
    model: state.model,
    year: state.year,
    engine,
  };

  DB.addCar(chatId, car);
  userStates.delete(chatId);

  const text =
    `✅ <b>Авто добавлено в гараж!</b>\n\n` +
    `⭐ <b>${car.brand} ${car.model}</b>\n` +
    `📅 ${car.year}\n` +
    `⚙️ ${car.engine}\n\n` +
    `Теперь в магазине вы увидите подходящие запчасти для вашего авто.`;

  const kb = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛒 Подобрать запчасти", url: `${WEBAPP_URL}?car=${state.brandId}` }],
        [{ text: "🚗 Мой гараж", callback_data: "garage_view" }],
      ],
    },
  };

  if (messageId) {
    await editMessage(chatId, messageId, text, kb);
  } else {
    await sendMessage(chatId, text, kb);
  }
}

async function handleProfile(chatId, user) {
  const profile = DB.getProfile(chatId);
  const name = profile.name || user?.first_name || "Не указано";
  const phone = profile.phone || "Не указано";
  const region = profile.region || "Не указано";
  const city = profile.city || "Не указано";
  const address = profile.address || "Не указано";

  const text =
    `👤 <b>Мой профиль</b>\n\n` +
    `📝 Имя: <b>${name}</b>\n` +
    `📱 Телефон: <b>${phone}</b>\n` +
    `🗺 Регион: <b>${region}</b>\n` +
    `🏙 Нас. пункт: <b>${city}</b>\n` +
    `📍 Адрес: <b>${address}</b>\n` +
    `🆔 Telegram ID: <code>${chatId}</code>\n\n` +
    `Для редактирования профиля используйте команды:\n` +
    `<code>/setname Иван Иванов</code>\n` +
    `<code>/setphone +79001234567</code>\n` +
    `<code>/setregion Московская область</code>\n` +
    `<code>/setcity Серпухов</code>\n` +
    `<code>/setaddress ул. Примерная, д. 1</code>`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛒 Открыть магазин", url: WEBAPP_URL }],
      ],
    },
  });
}

async function handleOrders(chatId) {
  const text =
    `📦 <b>Мои заказы</b>\n\n` +
    `Все ваши заказы доступны в приложении.\n` +
    `Откройте магазин и перейдите в раздел «Профиль → Заказы».\n\n` +
    `Для отслеживания посылки:\n` +
    `<code>/track НОМЕР_ТРЕКА</code>`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📦 Мои заказы", url: WEBAPP_URL }],
      ],
    },
  });
}

async function handleTrack(chatId, trackNumber) {
  if (!trackNumber) {
    await sendMessage(chatId, "📦 Введите трек-номер:\n<code>/track EMS123456789RU</code>");
    return;
  }

  const text =
    `📦 <b>Отслеживание: ${trackNumber}</b>\n\n` +
    `🔗 Отследить на:\n` +
    `• <a href="https://track24.ru/?code=${trackNumber}">Track24.ru</a>\n` +
    `• <a href="https://www.pochta.ru/tracking#${trackNumber}">Почта России</a>\n` +
    `• <a href="https://www.cdek.ru/ru/tracking?order_id=${trackNumber}">СДЭК</a>\n`;

  await sendMessage(chatId, text, { disable_web_page_preview: true });
}

async function handleHelp(chatId) {
  const text =
    `ℹ️ <b>CarTech — помощь</b>\n\n` +
    `<b>Команды:</b>\n` +
    `/start — Главное меню\n` +
    `/mycar — Мой гараж\n` +
    `/profile — Мой профиль\n` +
    `/orders — Мои заказы\n` +
    `/track <i>номер</i> — Отследить посылку\n\n` +
    `<b>Редактирование профиля:</b>\n` +
    `/setname <i>Имя Фамилия</i>\n` +
    `/setphone <i>+79001234567</i>\n` +
    `/setregion <i>Московская область</i>\n` +
    `/setcity <i>Серпухов</i>\n` +
    `/setaddress <i>ул. Примерная, 1</i>\n\n` +
    `<b>Поддержка:</b>\n` +
    `/support — Написать менеджеру\n` +
    `/endchat — Завершить диалог\n\n` +
    `❓ Или напишите: @CMOLEHCK`;

  await sendMessage(chatId, text);
}

const PHONE_RE = /^(\+7|8)\s*\(?\d{3}\)?\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
const PHONE_DIGITS_RE = /^[78]\d{10}$/;
const NAME_RE = /^[A-Za-zА-Яа-яЁёÀ-ÿ'\-]+(\s+[A-Za-zА-Яа-яЁёÀ-ÿ'\-]+)+$/;
const BOT_CITIES = [
  "Москва","Санкт-Петербург","Новосибирск","Екатеринбург","Казань",
  "Нижний Новгород","Челябинск","Самара","Омск","Ростов-на-Дону",
  "Уфа","Красноярск","Воронеж","Пермь","Волгоград",
  "Краснодар","Саратов","Тюмень","Тольятти","Ижевск",
  "Барнаул","Ульяновск","Иркутск","Хабаровск","Ярославль",
  "Владивосток","Махачкала","Томск","Оренбург","Кемерово",
  "Новокузнецк","Рязань","Астрахань","Набережные Челны","Пенза",
  "Липецк","Тула","Киров","Чебоксары","Калининград",
  "Брянск","Курск","Иваново","Магнитогорск","Улан-Удэ",
  "Тверь","Ставрополь","Нижний Тагил","Белгород","Архангельск",
  "Владимир","Сочи","Курган","Смоленск","Калуга",
  "Чита","Орёл","Волжский","Череповец","Владикавказ",
  "Мурманск","Сургут","Вологда","Саранск","Тамбов",
  "Стерлитамак","Грозный","Якутск","Кострома","Петрозаводск",
  "Комсомольск-на-Амуре","Таганрог","Нижневартовск","Йошкар-Ола","Братск",
  "Новороссийск","Нальчик","Сыктывкар","Великий Новгород","Псков",
  "Минск","Алматы","Астана","Ташкент","Бишкек","Душанбе","Ереван","Тбилиси","Баку",
];
const BOT_CITIES_LOWER = BOT_CITIES.map(c => c.toLowerCase());

const BOT_REGIONS = [
  "Москва","Московская область","Санкт-Петербург","Ленинградская область",
  "Белгородская область","Брянская область","Владимирская область","Воронежская область",
  "Ивановская область","Калужская область","Костромская область","Курская область",
  "Липецкая область","Орловская область","Рязанская область","Смоленская область",
  "Тамбовская область","Тверская область","Тульская область","Ярославская область",
  "Архангельская область","Вологодская область","Калининградская область",
  "Республика Карелия","Республика Коми","Мурманская область","Ненецкий АО",
  "Новгородская область","Псковская область",
  "Республика Адыгея","Астраханская область","Волгоградская область","Республика Калмыкия",
  "Краснодарский край","Республика Крым","Ростовская область","Севастополь",
  "Республика Дагестан","Республика Ингушетия","Кабардино-Балкарская Респ.",
  "Карачаево-Черкесская Респ.","Республика Северная Осетия","Ставропольский край",
  "Чеченская Республика",
  "Республика Башкортостан","Кировская область","Республика Марий Эл",
  "Республика Мордовия","Нижегородская область","Оренбургская область",
  "Пензенская область","Пермский край","Самарская область","Саратовская область",
  "Республика Татарстан","Удмуртская Республика","Ульяновская область","Чувашская Республика",
  "Курганская область","Свердловская область","Тюменская область","Челябинская область",
  "Ханты-Мансийский АО","Ямало-Ненецкий АО",
  "Республика Алтай","Алтайский край","Иркутская область","Кемеровская область",
  "Красноярский край","Новосибирская область","Омская область","Томская область",
  "Республика Тыва","Республика Хакасия",
  "Амурская область","Республика Бурятия","Еврейская АО","Забайкальский край",
  "Камчатский край","Магаданская область","Приморский край","Республика Саха (Якутия)",
  "Сахалинская область","Хабаровский край","Чукотский АО",
];
const BOT_REGIONS_LOWER = BOT_REGIONS.map(r => r.toLowerCase());

function validateBotRegion(v) {
  if (!v.trim()) return "⚠️ Укажите регион";
  const lower = v.trim().toLowerCase();
  if (!BOT_REGIONS_LOWER.includes(lower)) {
    const suggestions = BOT_REGIONS.filter(r => r.toLowerCase().includes(lower)).slice(0, 5);
    if (suggestions.length > 0) {
      return `⚠️ Регион не найден. Может быть:\n${suggestions.map(s => `• <b>${s}</b>`).join("\n")}\n\nВведите точное название из списка.`;
    }
    return "⚠️ Регион не найден. Пример: <code>/setregion Московская область</code>";
  }
  return null;
}

function validateBotPhone(v) {
  const clean = v.replace(/[\s()\-+]/g, "");
  if (PHONE_RE.test(v.trim())) return null;
  if (PHONE_DIGITS_RE.test(clean)) return null;
  return "⚠️ Некорректный номер. Формат: <code>+7 9XX XXX-XX-XX</code>";
}

function validateBotName(v) {
  if (!v.trim()) return "⚠️ Укажите имя и фамилию";
  if (/\d/.test(v)) return "⚠️ Имя не должно содержать цифры";
  if (!NAME_RE.test(v.trim())) return "⚠️ Введите имя и фамилию (2 слова минимум)";
  return null;
}

function validateBotCity(v) {
  if (!v.trim()) return "⚠️ Укажите населённый пункт";
  if (/^\d+$/.test(v.trim())) return "⚠️ Введите название, а не число";
  if (v.trim().length < 2) return "⚠️ Слишком короткое название";
  return null;
}

function getBotCityHint(v) {
  const lower = v.trim().toLowerCase();
  if (BOT_CITIES_LOWER.includes(lower)) return null;
  const suggestions = BOT_CITIES.filter(c => c.toLowerCase().startsWith(lower)).slice(0, 3);
  if (suggestions.length > 0) {
    return `\n💡 Возможно, вы имели в виду: ${suggestions.map(s => `<b>${s}</b>`).join(", ")}?`;
  }
  return null;
}

async function handleSetField(chatId, field, value) {
  if (!value) {
    await sendMessage(chatId, `Укажите значение: <code>/set${field} значение</code>`);
    return;
  }

  if (field === "name") {
    const err = validateBotName(value);
    if (err) return sendMessage(chatId, err);
  }
  if (field === "phone") {
    const err = validateBotPhone(value);
    if (err) return sendMessage(chatId, err);
  }
  if (field === "region") {
    const err = validateBotRegion(value);
    if (err) return sendMessage(chatId, err);
    const match = BOT_REGIONS.find(r => r.toLowerCase() === value.trim().toLowerCase());
    if (match) value = match;
  }
  if (field === "city") {
    const err = validateBotCity(value);
    if (err) return sendMessage(chatId, err);
    const match = BOT_CITIES.find(c => c.toLowerCase() === value.trim().toLowerCase());
    if (match) value = match;
    const hint = getBotCityHint(value);
    if (hint) {
      DB.setProfileField(chatId, field, value.trim());
      return sendMessage(chatId, `✅ Населённый пункт сохранён: <b>${value.trim()}</b>${hint}\n\nЕсли всё верно — ничего делать не нужно. Доставляем в любой населённый пункт.`);
    }
  }

  DB.setProfileField(chatId, field, value.trim());
  const labels = { name: "Имя", phone: "Телефон", region: "Регион", city: "Населённый пункт", address: "Адрес" };
  await sendMessage(chatId, `✅ ${labels[field]} обновлено: <b>${value.trim()}</b>`);
}

async function handleCustomBrandText(chatId, text) {
  const brandName = text.trim();
  const brandId = `custom_${brandName.toLowerCase().replace(/\s+/g, "")}`;
  userStates.set(chatId, { action: "awaiting_custom_model", brandId, brandName, isCustomBrand: true });

  await sendMessage(
    chatId,
    `✅ Марка: <b>${brandName}</b>\n\n✏️ <b>Теперь введите модель</b>\nНапишите модель вашего авто, например:\n<code>Jolion</code>\n<code>VX</code>\n<code>F7</code>`,
    makeKeyboard([[{ text: "← Назад к маркам", callback_data: "garage_start" }]])
  );
}

async function handleCustomModelRequest(chatId, messageId, brandId) {
  const state = userStates.get(chatId) || {};
  state.action = "awaiting_custom_model";
  state.brandId = brandId;
  const brand = CAR_BRANDS.find((b) => b.id === brandId);
  if (brand) state.brandName = brand.name;
  userStates.set(chatId, state);

  await editMessage(
    chatId, messageId,
    `🚗 <b>${state.brandName || brandId}</b>\n\n✏️ <b>Введите название модели</b>\nНапишите модель текстом, например:\n<code>Camry</code>\n<code>Solaris</code>`,
    makeKeyboard([[{ text: "← Назад к маркам", callback_data: "garage_start" }]])
  );
}

async function handleCustomModelText(chatId, text) {
  const state = userStates.get(chatId) || {};
  state.model = text.trim();
  state.action = "selecting_year";
  userStates.set(chatId, state);

  const currentYear = new Date().getFullYear();
  const buttons = [];
  for (let y = currentYear; y >= currentYear - 15; y -= 4) {
    const row = [];
    for (let j = 0; j < 4 && y - j >= currentYear - 15; j++) {
      row.push({ text: String(y - j), callback_data: `year_${y - j}` });
    }
    buttons.push(row);
  }
  buttons.push([{ text: "✏️ Ввести год вручную", callback_data: "year_custom" }]);
  buttons.push([{ text: "← Назад к маркам", callback_data: "garage_start" }]);

  await sendMessage(
    chatId,
    `🚗 <b>${state.brandName} ${state.model}</b>\nВыберите год выпуска:\n\nНет нужного? Нажмите «Ввести вручную»`,
    makeKeyboard(buttons)
  );
}

async function handleCustomYearRequest(chatId, messageId) {
  const state = userStates.get(chatId) || {};
  state.action = "awaiting_custom_year";
  userStates.set(chatId, state);

  const text = `🚗 <b>${state.brandName} ${state.model}</b>\n\n✏️ <b>Введите год выпуска</b>\nНапишите год числом, например:\n<code>2003</code>\n<code>1998</code>\n<code>2019</code>`;
  const kb = makeKeyboard([[{ text: "← Назад к маркам", callback_data: "garage_start" }]]);
  if (messageId) {
    await editMessage(chatId, messageId, text, kb);
  } else {
    await sendMessage(chatId, text, kb);
  }
}

async function handleCustomYearText(chatId, text) {
  const year = parseInt(text.trim(), 10);
  if (!year || year < 1950 || year > new Date().getFullYear() + 1) {
    await sendMessage(chatId, "⚠️ Укажите корректный год (1950–" + (new Date().getFullYear() + 1) + ")");
    return;
  }
  return handleYearSelect(chatId, null, year);
}

async function handleCustomEngineRequest(chatId, messageId) {
  const state = userStates.get(chatId) || {};
  state.action = "awaiting_custom_engine";
  userStates.set(chatId, state);

  await editMessage(
    chatId, messageId,
    `🚗 <b>${state.brandName} ${state.model} ${state.year}</b>\n\n✏️ <b>Введите объём / тип двигателя</b>\nНапример:\n<code>1.5T</code>\n<code>2.0 TFSI</code>\n<code>Diesel 2.2</code>`,
    makeKeyboard([[{ text: "← Назад к маркам", callback_data: "garage_start" }]])
  );
}

async function processUpdate(update) {
  try {
    console.log(`>> update: ${JSON.stringify(update).slice(0, 300)}`);
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const rawText = (msg.text || "").trim();
      const text = rawText;
      const user = msg.from;
      console.log(`>> msg from ${chatId}: raw="${rawText}" parsed="${text}"`);

      // Handle free-text input based on current state
      const state = userStates.get(chatId);
      if (state && !text.startsWith("/")) {
        if (state.action === "awaiting_support_question") {
          return handleSupportQuestion(chatId, text, user);
        }
        if (state.action === "support_chat") {
          return forwardToUser(chatId, state.targetUserId, text);
        }
        if (state.action === "awaiting_custom_brand") {
          return handleCustomBrandText(chatId, text);
        }
        if (state.action === "awaiting_custom_model") {
          return handleCustomModelText(chatId, text);
        }
        if (state.action === "awaiting_custom_year") {
          return handleCustomYearText(chatId, text);
        }
        if (state.action === "awaiting_custom_engine") {
          const engine = text.trim();
          return handleEngineSelect(chatId, null, engine);
        }
        if (state.action === "admin_add_track") {
          return handleAdminTrackText(chatId, text);
        }
      }

      // Forward user messages to admin if support session is active
      if (!text.startsWith("/")) {
        const supportSession = DB.getActiveSupportSession(chatId);
        if (supportSession && (supportSession.status === "active" || supportSession.status === "waiting")) {
          return forwardToAdmin(chatId, text, user);
        }
      }

      // Auto-register orders from notification messages forwarded to admin
      if (chatId === ADMIN_ID && text.includes("Новый заказ #")) {
        const parsed = tryParseOrderFromMessage(text);
        if (parsed) {
          registerOrder(parsed);
          await sendMessage(chatId, `✅ Заказ <b>#${parsed.id}</b> зарегистрирован в админ-панели.\n\n/admin — открыть панель`, makeKeyboard([
            [{ text: "📦 Открыть заказ", callback_data: `adm_order_${parsed.id}` }],
          ]));
        }
      }

      if (isStartCommand(rawText) || isMenuCommand(rawText)) return handleStart(chatId, user);
      if (text === "/mycar" || text === "/garage") return handleMycar(chatId);
      if (text === "/profile") return handleProfile(chatId, user);
      if (text === "/orders") return handleOrders(chatId);
      if (text === "/support") return handleSupport(chatId, user);
      if (text === "/endchat") return handleEndChat(chatId);
      if (text === "/help") return handleHelp(chatId);
      if (text === "/admin") return handleAdmin(chatId);
      if (text === "/aorders") return handleAdminOrders(chatId, null);
      if (text === "/ausers") return handleAdminUsers(chatId);
      if (text.startsWith("/astatus")) return handleAdminStatusCmd(chatId, text.replace("/astatus", "").trim());
      if (text.startsWith("/atrack")) return handleAdminTrackCmd(chatId, text.replace("/atrack", "").trim());
      if (text.startsWith("/amarkup")) return handleAdminMarkup(chatId, text.replace("/amarkup", "").trim());
      if (text.startsWith("/abroadcast")) return handleAdminBroadcast(chatId, text.replace("/abroadcast", "").trim());
      if (text.startsWith("/track")) return handleTrack(chatId, text.replace("/track", "").trim());
      if (text.startsWith("/setname")) return handleSetField(chatId, "name", text.replace("/setname", "").trim());
      if (text.startsWith("/setphone")) return handleSetField(chatId, "phone", text.replace("/setphone", "").trim());
      if (text.startsWith("/setregion")) return handleSetField(chatId, "region", text.replace("/setregion", "").trim());
      if (text.startsWith("/setcity")) return handleSetField(chatId, "city", text.replace("/setcity", "").trim());
      if (text.startsWith("/setaddress")) return handleSetField(chatId, "address", text.replace("/setaddress", "").trim());
    }

    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const messageId = cb.message.message_id;
      const data = cb.data;

      await answerCallback(cb.id);

      if (data === "garage_start") return handleGarageStart(chatId, messageId);
      if (data === "garage_view") return handleMycar(chatId);
      if (data === "garage_clear") {
        DB.clearGarage(chatId);
        return handleMycar(chatId);
      }
      if (data === "profile_view") return handleProfile(chatId, cb.from);
      if (data === "brand_custom") return handleBrandCustom(chatId, messageId);
      if (data.startsWith("brand_")) return handleBrandSelect(chatId, messageId, data.replace("brand_", ""));
      if (data.startsWith("model_custom_")) return handleCustomModelRequest(chatId, messageId, data.replace("model_custom_", ""));
      if (data.startsWith("model_")) {
        const parts = data.replace("model_", "").split("_");
        const brandId = parts[0];
        const model = parts.slice(1).join("_");
        return handleModelSelect(chatId, messageId, brandId, model);
      }
      if (data.startsWith("year_")) return handleYearSelect(chatId, messageId, parseInt(data.replace("year_", "")));
      if (data === "year_custom") return handleCustomYearRequest(chatId, messageId);
      if (data === "engine_custom") return handleCustomEngineRequest(chatId, messageId);
      if (data.startsWith("engine_")) return handleEngineSelect(chatId, messageId, data.replace("engine_", ""));

      // Support chat callbacks
      if (data === "support_start") return handleSupport(chatId, cb.from);
      if (data === "support_cancel") {
        userStates.delete(chatId);
        return editMessage(chatId, messageId, "❌ Запрос отменён.", makeKeyboard([[{ text: "← Меню", callback_data: "back_start" }]]));
      }
      if (data === "back_start") return handleStart(chatId, cb.from);
      if (data.startsWith("sup_accept_")) return handleSupportAccept(chatId, messageId, parseInt(data.replace("sup_accept_", "")));
      if (data.startsWith("sup_reject_")) return handleSupportReject(chatId, messageId, parseInt(data.replace("sup_reject_", "")));
      if (data.startsWith("sup_close_")) return handleSupportClose(chatId, messageId, parseInt(data.replace("sup_close_", "")));
      if (data.startsWith("sup_chat_")) return handleSupportChatSwitch(chatId, messageId, parseInt(data.replace("sup_chat_", "")));
      if (data === "sup_queue") return handleSupportQueue(chatId, messageId);

      // Admin callbacks
      if (data === "adm_back") return handleAdmin(chatId);
      if (data === "adm_orders") return handleAdminOrders(chatId, messageId);
      if (data === "adm_users") return handleAdminUsers(chatId);
      if (data === "adm_markup") return handleAdminMarkup(chatId, "");
      if (data.startsWith("adm_setstatus_")) {
        const rest = data.replace("adm_setstatus_", "");
        const idx = rest.lastIndexOf("_");
        const oid = rest.slice(0, idx);
        const status = rest.slice(idx + 1);
        return handleAdminSetStatus(chatId, messageId, oid, status);
      }
      if (data.startsWith("adm_addtrack_")) return handleAdminAddTrack(chatId, messageId, data.replace("adm_addtrack_", ""));
      if (data.startsWith("adm_delorder_")) return handleAdminDeleteOrder(chatId, messageId, data.replace("adm_delorder_", ""));
      if (data.startsWith("adm_order_")) return handleAdminOrderDetail(chatId, messageId, data.replace("adm_order_", ""));
    }
  } catch (err) {
    console.error("Error processing update:", err?.message, err?.stack);
  }
}

// ============== ADMIN PANEL ==============

function isAdmin(chatId) {
  return chatId === ADMIN_ID;
}

async function handleAdmin(chatId) {
  if (!isAdmin(chatId)) return sendMessage(chatId, "⛔ Доступ запрещён.");

  const ordersCount = DB.getOrderCount();
  const usersCount = DB.getUserCount();
  const garagesCount = DB.getGarageCount();
  const pendingOrders = DB.getPendingOrderCount();
  const adminMarkup = DB.getMarkup();

  const text =
    `🔐 <b>Админ-панель CarTech</b>\n\n` +
    `📊 <b>Статистика:</b>\n` +
    `• Заказов: <b>${ordersCount}</b> (ожидают: ${pendingOrders})\n` +
    `• Пользователей: <b>${usersCount}</b>\n` +
    `• Гаражей: <b>${garagesCount}</b>\n` +
    `• Наценка: <b>${adminMarkup}%</b>\n\n` +
    `⚙️ <b>Команды:</b>\n` +
    `/admin — Эта панель\n` +
    `/aorders — Список заказов\n` +
    `/astatus <i>ID статус</i> — Сменить статус\n` +
    `/atrack <i>ID трек служба</i> — Добавить трек\n` +
    `/amarkup <i>число</i> — Установить наценку %\n` +
    `/abroadcast <i>текст</i> — Рассылка всем\n` +
    `/ausers — Список пользователей`;

  const waitingCount = DB.getWaitingSupportSessions().length;
  const activeChats = DB.getActiveSupportSessions().length;

  await sendMessage(chatId, text, makeKeyboard([
    [{ text: "📦 Заказы", callback_data: "adm_orders" }],
    [{ text: `💬 Поддержка${waitingCount ? ` (${waitingCount} ⏳)` : activeChats ? ` (${activeChats} 🟢)` : ""}`, callback_data: "sup_queue" }],
    [{ text: "👥 Пользователи", callback_data: "adm_users" }, { text: "💰 Наценка", callback_data: "adm_markup" }],
  ]));
}

async function handleAdminOrders(chatId, messageId) {
  if (!isAdmin(chatId)) return;

  const orders = DB.getAllOrders();

  if (orders.length === 0) {
    const text = "📦 <b>Заказы</b>\n\nЗаказов пока нет.";
    if (messageId) return editMessage(chatId, messageId, text, makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]]));
    return sendMessage(chatId, text, makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]]));
  }

  const STATUS_EMOJI = { pending: "🟡", confirmed: "🔵", packing: "🟣", shipped: "🟠", delivered: "🟢", cancelled: "🔴" };
  const STATUS_LABEL = { pending: "Ожидает", confirmed: "Подтверждён", packing: "Собирается", shipped: "Отправлен", delivered: "Доставлен", cancelled: "Отменён" };

  const lines = orders.slice(0, 15).map(o => {
    const emoji = STATUS_EMOJI[o.status] || "⚪";
    const date = new Date(o.created_at).toLocaleDateString("ru");
    return `${emoji} <b>#${o.id}</b> — ${STATUS_LABEL[o.status] || o.status}\n` +
      `   ${o.customer_name || "?"} · ${o.total?.toLocaleString() || 0} ₽\n` +
      `   ${o.customer_region ? o.customer_region + ", " : ""}${o.customer_city || ""}\n` +
      `   📅 ${date}${o.tracking_number ? ` · 🔗 ${o.tracking_number}` : ""}`;
  });

  const text = `📦 <b>Заказы (${orders.length})</b>\n\n${lines.join("\n\n")}` +
    (orders.length > 15 ? `\n\n<i>...ещё ${orders.length - 15}</i>` : "");

  const buttons = orders.slice(0, 8).map(o => [
    { text: `#${o.id} — ${STATUS_LABEL[o.status] || o.status}`, callback_data: `adm_order_${o.id}` }
  ]);
  buttons.push([{ text: "← Админ", callback_data: "adm_back" }]);

  if (messageId) return editMessage(chatId, messageId, text, makeKeyboard(buttons));
  return sendMessage(chatId, text, makeKeyboard(buttons));
}

async function handleAdminOrderDetail(chatId, messageId, orderId) {
  if (!isAdmin(chatId)) return;

  const order = DB.getOrder(orderId);
  if (!order) {
    return editMessage(chatId, messageId, `❌ Заказ <b>#${orderId}</b> не найден.`, makeKeyboard([[{ text: "← Заказы", callback_data: "adm_orders" }]]));
  }

  const STATUS_LABEL = { pending: "Ожидает", confirmed: "Подтверждён", packing: "Собирается", shipped: "Отправлен", delivered: "Доставлен", cancelled: "Отменён" };

  const items = (order.items || []).map(i =>
    `  • ${i.name} (${i.brand}) ×${i.quantity} = ${(i.price * i.quantity).toLocaleString()} ₽`
  ).join("\n");

  const text =
    `📦 <b>Заказ #${order.id}</b>\n\n` +
    `📊 Статус: <b>${STATUS_LABEL[order.status] || order.status}</b>\n` +
    `👤 ${order.customer_name || "?"}\n` +
    `📱 ${order.customer_phone || "?"}\n` +
    `🗺 ${order.customer_region || "—"}\n` +
    `🏙 ${order.customer_city || "—"}\n` +
    `📍 ${order.customer_address || "—"}\n` +
    `${order.comment ? `💬 "${order.comment}"\n` : ""}` +
    `🆔 TG: ${order.telegram_id ?? "N/A"}\n\n` +
    `📦 <b>Товары:</b>\n${items || "  —"}\n\n` +
    `💰 <b>Итого: ${order.total?.toLocaleString() || 0} ₽</b>\n` +
    `${order.tracking_number ? `🔗 Трек: <code>${order.tracking_number}</code> (${order.tracking_carrier || "?"})` : "🔗 Трек: не указан"}\n` +
    `📅 ${new Date(order.created_at).toLocaleString("ru")}`;

  const statuses = ["pending", "confirmed", "packing", "shipped", "delivered", "cancelled"];
  const statusButtons = [];
  for (let i = 0; i < statuses.length; i += 3) {
    statusButtons.push(
      statuses.slice(i, i + 3).map(s => ({
        text: `${s === order.status ? "✓ " : ""}${STATUS_LABEL[s]}`,
        callback_data: `adm_setstatus_${orderId}_${s}`,
      }))
    );
  }
  statusButtons.push([{ text: "📝 Добавить трек", callback_data: `adm_addtrack_${orderId}` }]);
  statusButtons.push([{ text: "🗑 Удалить заказ", callback_data: `adm_delorder_${orderId}` }]);
  statusButtons.push([{ text: "← Заказы", callback_data: "adm_orders" }]);

  return editMessage(chatId, messageId, text, makeKeyboard(statusButtons));
}

async function handleAdminSetStatus(chatId, messageId, orderId, status) {
  if (!isAdmin(chatId)) return;
  const order = DB.getOrder(orderId);
  if (!order) return;

  DB.updateOrderStatus(orderId, status);

  if (order.telegram_id) {
    const STATUS_LABEL = { pending: "Ожидает", confirmed: "Подтверждён", packing: "Собирается", shipped: "Отправлен", delivered: "Доставлен", cancelled: "Отменён" };
    const statusText = STATUS_LABEL[status] || status;
    let userMsg = `📦 <b>Заказ #${order.id}</b>\n\nСтатус обновлён: <b>${statusText}</b>`;
    if (order.tracking_number && (status === "shipped" || status === "delivered")) {
      userMsg += `\n🔗 Трек: <code>${order.tracking_number}</code>`;
    }
    if (status === "delivered") {
      userMsg += `\n\n✅ Ваш заказ доставлен! Спасибо за покупку.`;
    }
    if (status === "cancelled") {
      userMsg += `\n\n❌ Заказ был отменён.`;
    }
    await sendMessage(order.telegram_id, userMsg);
  }

  return handleAdminOrderDetail(chatId, messageId, orderId);
}

async function handleAdminAddTrack(chatId, messageId, orderId) {
  if (!isAdmin(chatId)) return;
  userStates.set(chatId, { action: "admin_add_track", orderId });

  await editMessage(chatId, messageId,
    `📝 <b>Добавить трек к заказу #${orderId}</b>\n\n` +
    `Отправьте трек-номер и службу доставки через пробел:\n` +
    `<code>EMS123456789RU СДЭК</code>\n\n` +
    `Доступные службы: СДЭК, Почта России, DPD, Boxberry, EMS`,
    makeKeyboard([[{ text: "← Отмена", callback_data: `adm_order_${orderId}` }]])
  );
}

async function handleAdminTrackText(chatId, text) {
  const state = userStates.get(chatId);
  if (!state || !state.orderId) return;
  const order = DB.getOrder(state.orderId);
  if (!order) return;

  const parts = text.trim().split(/\s+/);
  const trackNumber = parts[0];
  const carrier = parts.slice(1).join(" ") || "Не указана";

  DB.updateOrderTracking(state.orderId, trackNumber, carrier);
  if (order.status === "pending" || order.status === "confirmed" || order.status === "packing") {
    DB.updateOrderStatus(state.orderId, "shipped");
  }
  userStates.delete(chatId);

  if (order.telegram_id) {
    await sendMessage(order.telegram_id,
      `📦 <b>Заказ #${order.id}</b>\n\n` +
      `🚚 Ваш заказ отправлен!\n` +
      `🔗 Трек: <code>${trackNumber}</code>\n` +
      `📮 Служба: ${carrier}\n\n` +
      `Отследить: <a href="https://track24.ru/?code=${encodeURIComponent(trackNumber)}">track24.ru</a>`,
      { disable_web_page_preview: true }
    );
  }

  await sendMessage(chatId,
    `✅ Трек добавлен к заказу <b>#${state.orderId}</b>\n\n` +
    `🔗 ${trackNumber}\n📮 ${carrier}\n📊 Статус: Отправлен\n\n` +
    `Клиент уведомлён.`,
    makeKeyboard([[{ text: "📦 К заказу", callback_data: `adm_order_${state.orderId}` }, { text: "← Админ", callback_data: "adm_back" }]])
  );
}

async function handleAdminDeleteOrder(chatId, messageId, orderId) {
  if (!isAdmin(chatId)) return;
  DB.deleteOrder(orderId);
  await editMessage(chatId, messageId, `🗑 Заказ <b>#${orderId}</b> удалён.`, makeKeyboard([[{ text: "← Заказы", callback_data: "adm_orders" }]]));
}

async function handleAdminStatusCmd(chatId, args) {
  if (!isAdmin(chatId)) return;
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    return sendMessage(chatId, "Формат: <code>/astatus ID статус</code>\n\nСтатусы: pending, confirmed, packing, shipped, delivered, cancelled");
  }
  const [orderId, status] = parts;
  const validStatuses = ["pending", "confirmed", "packing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return sendMessage(chatId, `⚠️ Некорректный статус.\nДопустимые: ${validStatuses.join(", ")}`);
  }
  const order = DB.getOrder(orderId);
  if (!order) return sendMessage(chatId, `❌ Заказ #${orderId} не найден.`);

  return handleAdminSetStatus(chatId, null, orderId, status);
}

async function handleAdminTrackCmd(chatId, args) {
  if (!isAdmin(chatId)) return;
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    return sendMessage(chatId, "Формат: <code>/atrack ID трек-номер [служба]</code>\n\nПример: <code>/atrack CT2602-ABC12 EMS123456RU СДЭК</code>");
  }
  const orderId = parts[0];
  const trackNumber = parts[1];
  const carrier = parts.slice(2).join(" ") || "Не указана";

  const order = DB.getOrder(orderId);
  if (!order) return sendMessage(chatId, `❌ Заказ #${orderId} не найден.`);

  DB.updateOrderTracking(orderId, trackNumber, carrier);
  DB.updateOrderStatus(orderId, "shipped");

  if (order.telegram_id) {
    await sendMessage(order.telegram_id,
      `📦 <b>Заказ #${order.id}</b>\n\n🚚 Отправлен!\n🔗 Трек: <code>${trackNumber}</code>\n📮 ${carrier}`,
      { disable_web_page_preview: true }
    );
  }

  return sendMessage(chatId, `✅ Трек добавлен к <b>#${orderId}</b>: ${trackNumber} (${carrier})\nКлиент уведомлён.`);
}

async function handleAdminMarkup(chatId, args) {
  if (!isAdmin(chatId)) return;
  const val = parseFloat(args.trim());
  if (isNaN(val) || val < 0 || val > 500) {
    const current = DB.getMarkup();
    return sendMessage(chatId, `💰 Текущая наценка: <b>${current}%</b>\n\nУстановить: <code>/amarkup 15</code> (0–500)`);
  }
  DB.setMarkup(val);
  return sendMessage(chatId, `✅ Наценка установлена: <b>${val}%</b>`);
}

async function handleAdminBroadcast(chatId, text) {
  if (!isAdmin(chatId)) return;
  if (!text.trim()) {
    return sendMessage(chatId, "Формат: <code>/abroadcast Текст сообщения</code>");
  }

  const allUserIds = DB.getAllUserIds();

  let sent = 0;
  let failed = 0;
  for (const userId of allUserIds) {
    if (userId === ADMIN_ID) continue;
    try {
      await sendMessage(userId, `📢 <b>CarTech</b>\n\n${text}`);
      sent++;
    } catch {
      failed++;
    }
  }

  return sendMessage(chatId, `✅ Рассылка завершена\n\n📨 Отправлено: <b>${sent}</b>\n❌ Ошибок: <b>${failed}</b>`);
}

async function handleAdminUsers(chatId) {
  if (!isAdmin(chatId)) return;

  const users = DB.getAllUsers();

  if (users.length === 0) {
    return sendMessage(chatId, "👥 <b>Пользователи</b>\n\nПока нет зарегистрированных пользователей.");
  }

  const lines = users.slice(0, 20).map(u => {
    const garage = DB.getGarage(u.telegram_id);
    const cars = garage.map(c => `${c.brand} ${c.model}`).join(", ") || "нет";
    return (
      `👤 <b>${u.name || "Без имени"}</b> (ID: <code>${u.telegram_id}</code>)\n` +
      `   📱 ${u.phone || "—"}${u.region ? ` · 🗺 ${u.region}` : ""}${u.city ? ` · 🏙 ${u.city}` : ""}\n` +
      `   🚗 ${cars}`
    );
  });

  const text = `👥 <b>Пользователи (${users.length})</b>\n\n${lines.join("\n\n")}` +
    (users.length > 20 ? `\n\n<i>...ещё ${users.length - 20}</i>` : "");

  return sendMessage(chatId, text, makeKeyboard([[{ text: "← Админ", callback_data: "adm_back" }]]));
}

function registerOrder(order) {
  if (order && order.id) {
    DB.upsertOrder(order);
  }
}

// Parse order data from forwarded/incoming messages
function tryParseOrderFromMessage(text) {
  const idMatch = text.match(/Новый заказ #(CT[\w-]+)/);
  if (!idMatch) return null;
  const id = idMatch[1];
  if (DB.getOrder(id)) return null;

  const nameMatch = text.match(/👤\s*(.+)/);
  const phoneMatch = text.match(/📱\s*(.+)/);
  const regionMatch = text.match(/🗺\s*(.+)/);
  const cityMatch = text.match(/🏙\s*(.+)/);
  const addrMatch = text.match(/📍\s*(.+)/);
  const totalMatch = text.match(/Итого:\s*([\d\s,.]+)\s*₽/);
  const tgMatch = text.match(/Telegram:\s*(\d+|N\/A)/);
  const commentMatch = text.match(/💬\s*(.+)/);

  const order = {
    id,
    items: [],
    total: totalMatch ? parseInt(totalMatch[1].replace(/[\s,.]/g, "")) : 0,
    status: "pending",
    trackingNumber: "",
    trackingCarrier: "",
    customerName: nameMatch ? nameMatch[1].trim() : "",
    customerPhone: phoneMatch ? phoneMatch[1].trim() : "",
    customerRegion: regionMatch ? regionMatch[1].trim() : "",
    customerCity: cityMatch ? cityMatch[1].trim() : "",
    customerAddress: addrMatch ? addrMatch[1].trim() : "",
    comment: commentMatch ? commentMatch[1].trim() : "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramId: tgMatch && tgMatch[1] !== "N/A" ? parseInt(tgMatch[1]) : null,
  };

  // Parse items
  const itemLines = text.match(/•\s*(.+?)\s*×\s*(\d+)\s*=\s*([\d\s,.]+)\s*₽/g);
  if (itemLines) {
    for (const line of itemLines) {
      const m = line.match(/•\s*(.+?)\s*\((.+?)\)\s*×\s*(\d+)\s*=\s*([\d\s,.]+)\s*₽/);
      if (m) {
        order.items.push({
          productId: "",
          name: m[1].trim(),
          brand: m[2].trim(),
          partNumber: "",
          price: Math.round(parseInt(m[4].replace(/[\s,.]/g, "")) / parseInt(m[3])),
          quantity: parseInt(m[3]),
        });
      }
    }
  }

  return order;
}

// ============== END ADMIN ==============

// Long polling
async function poll() {
  let offset = 0;
  console.log("🤖 CarTech Bot запущен!");
  console.log("   Команды: /start, /mycar, /profile, /orders, /track, /help");

  while (true) {
    try {
      const res = await api("getUpdates", { offset, timeout: 30 });
      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          await processUpdate(update);
        }
      }
    } catch (err) {
      console.error("Poll error:", err?.message, err?.stack);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Устанавливаем команды бота
async function setupBotProfile() {
  await api("setMyDescription", {
    description:
      "🚗 CarTech — магазин автозапчастей.\n\n" +
      "Оригинальные и аналоговые запчасти для любого авто: " +
      "Toyota, BMW, Hyundai, Geely, Chery, LADA и других.\n\n" +
      "✅ Подбор по марке и модели\n" +
      "✅ Отслеживание заказов\n" +
      "✅ Доставка по всей России\n\n" +
      "Поддержка: @CMOLEHCK",
  });
  await api("setMyShortDescription", {
    short_description: "🚗 CarTech — запчасти для любого авто. Подбор, заказ, доставка по РФ.",
  });
  console.log("✅ Описание бота установлено");
}

async function setupCommands() {
  // Force commands menu button so first-time users don't get stuck on "Open"
  await api("setChatMenuButton", { menu_button: { type: "commands" } });
  await api("setChatMenuButton", { chat_id: ADMIN_ID, menu_button: { type: "commands" } });

  await api("setMyCommands", {
    commands: [
      { command: "start", description: "Главное меню" },
      { command: "mycar", description: "Мой гараж — выбор авто" },
      { command: "profile", description: "Мой профиль" },
      { command: "orders", description: "Мои заказы" },
      { command: "track", description: "Отследить посылку" },
      { command: "support", description: "💬 Связь с менеджером" },
      { command: "endchat", description: "Завершить диалог" },
      { command: "menu", description: "Главное меню" },
      { command: "help", description: "Помощь" },
    ],
  });
  await api("setMyCommands", {
    commands: [
      { command: "start", description: "Главное меню" },
      { command: "mycar", description: "Мой гараж — выбор авто" },
      { command: "profile", description: "Мой профиль" },
      { command: "orders", description: "Мои заказы" },
      { command: "track", description: "Отследить посылку" },
      { command: "support", description: "💬 Связь с менеджером" },
      { command: "endchat", description: "Завершить диалог" },
      { command: "admin", description: "🔐 Админ-панель" },
      { command: "aorders", description: "📦 Заказы (админ)" },
      { command: "ausers", description: "👥 Пользователи (админ)" },
      { command: "menu", description: "Главное меню" },
      { command: "help", description: "Помощь" },
    ],
    scope: { type: "chat", chat_id: ADMIN_ID },
  });
  console.log("✅ Команды бота установлены");
}

setupBotProfile().then(setupCommands).then(poll);
