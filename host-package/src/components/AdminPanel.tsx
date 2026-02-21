import React, { useState, useCallback } from "react";
import {
  AdminIcon,
  PercentIcon,
  KeyIcon,
  DashboardIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  CopyIcon,
  PackageIcon,
  UserIcon,
  CheckIcon,
} from "./Icons";
import {
  AdminSettings,
  ApiKeyEntry,
  saveSettings,
  generateId,
  applyMarkup,
} from "../utils/adminStore";
import { products } from "../data/cars";
import { getUserDisplayName, getTelegramUserId } from "../utils/auth";
import {
  loadOrders,
  saveOrders,
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../utils/orders";
import { notifyUserTrackingUpdate, notifyUserOrderDelivered } from "../utils/botApi";

type AdminTab = "dashboard" | "pricing" | "apikeys" | "orders" | "settings";

interface AdminPanelProps {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [saved, setSaved] = useState(false);

  const save = useCallback(
    (next: AdminSettings) => {
      onSettingsChange(next);
      saveSettings(next);
      setSaved(true);
      const t = window.setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    },
    [onSettingsChange]
  );

  const tabs: { id: AdminTab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: "dashboard", label: "Обзор", Icon: DashboardIcon },
    { id: "pricing", label: "Наценка", Icon: PercentIcon },
    { id: "orders", label: "Заказы", Icon: PackageIcon },
    { id: "apikeys", label: "API", Icon: KeyIcon },
    { id: "settings", label: "Ещё", Icon: AdminIcon },
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
          <AdminIcon size={20} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-white font-black text-xl">Админ-панель</h2>
          <p className="text-gray-500 text-xs">
            {getUserDisplayName()} · ID {getTelegramUserId() ?? "dev"}
          </p>
        </div>
      </div>

      {/* Admin tabs */}
      <div className="flex gap-1.5 mb-4 bg-[#111] rounded-xl p-1 border border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold transition-all ${
              tab === t.id
                ? "bg-red-600 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <t.Icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="mb-3 bg-green-600/20 border border-green-600/40 rounded-xl px-4 py-2.5 flex items-center gap-2 text-green-400 text-sm font-semibold animate-pulse">
          <CheckIcon size={16} />
          Сохранено
        </div>
      )}

      {tab === "dashboard" && <DashboardTab settings={settings} />}
      {tab === "pricing" && <PricingTab settings={settings} onSave={save} />}
      {tab === "orders" && <AdminOrdersTab />}
      {tab === "apikeys" && <ApiKeysTab settings={settings} onSave={save} />}
      {tab === "settings" && <SettingsTab settings={settings} onSave={save} />}
    </div>
  );
};

function DashboardTab({ settings }: { settings: AdminSettings }) {
  const avgPrice = products.length
    ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
    : 0;
  const avgWithMarkup = applyMarkup(avgPrice, settings.markupPercent);
  const inStock = products.filter((p) => p.inStock).length;
  const activeKeys = settings.apiKeys.filter((k) => k.active).length;

  const stats = [
    {
      label: "Товаров",
      value: products.length,
      sub: `${inStock} в наличии`,
      color: "text-blue-400",
      Icon: PackageIcon,
    },
    {
      label: "Наценка",
      value: `${settings.markupPercent}%`,
      sub: `Ср. цена: ${avgWithMarkup.toLocaleString()} ₽`,
      color: "text-amber-400",
      Icon: PercentIcon,
    },
    {
      label: "API ключей",
      value: settings.apiKeys.length,
      sub: `${activeKeys} активных`,
      color: "text-emerald-400",
      Icon: KeyIcon,
    },
    {
      label: "Пользователь",
      value: getTelegramUserId() ?? "—",
      sub: getUserDisplayName(),
      color: "text-purple-400",
      Icon: UserIcon,
    },
  ];

  return (
    <div className="space-y-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center flex-shrink-0 ${s.color}`}
          >
            <s.Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs">{s.label}</p>
            <p className="text-white font-black text-lg leading-tight">
              {s.value}
            </p>
          </div>
          <p className="text-gray-600 text-xs text-right">{s.sub}</p>
        </div>
      ))}

      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-2">Пример пересчёта (первые 5 товаров)</p>
        <div className="space-y-1.5">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="text-gray-300 truncate flex-1 mr-2">
                {p.name}
              </span>
              <span className="text-gray-600 line-through mr-2">
                {p.price.toLocaleString()} ₽
              </span>
              <span className="text-white font-bold">
                {applyMarkup(p.price, settings.markupPercent).toLocaleString()} ₽
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingTab({
  settings,
  onSave,
}: {
  settings: AdminSettings;
  onSave: (s: AdminSettings) => void;
}) {
  const [markup, setMarkup] = useState(settings.markupPercent);

  const presets = [0, 5, 10, 15, 20, 25, 30, 50];

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <p className="text-white font-bold text-sm mb-3">
          Процент наценки на все товары
        </p>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={markup}
            onChange={(e) => setMarkup(Number(e.target.value))}
            className="flex-1 accent-red-600 h-2"
          />
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 w-24">
            <input
              type="number"
              min={0}
              max={999}
              value={markup}
              onChange={(e) =>
                setMarkup(Math.max(0, Math.min(999, Number(e.target.value))))
              }
              className="w-full bg-transparent text-white font-black text-lg text-center outline-none"
            />
            <span className="text-gray-500 font-bold">%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setMarkup(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                markup === p
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        <button
          onClick={() => onSave({ ...settings, markupPercent: markup })}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <SaveIcon size={16} />
          Применить наценку
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-2">Предпросмотр цен</p>
        <div className="space-y-2">
          {products.slice(0, 6).map((p) => {
            const newPrice = applyMarkup(p.price, markup);
            const diff = newPrice - p.price;
            return (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm truncate flex-1 mr-2">
                  {p.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-600 text-xs">
                    {p.price.toLocaleString()} ₽
                  </span>
                  <span className="text-white font-bold text-sm">
                    {newPrice.toLocaleString()} ₽
                  </span>
                  {diff > 0 && (
                    <span className="text-green-500 text-[10px] font-bold">
                      +{diff.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApiKeysTab({
  settings,
  onSave,
}: {
  settings: AdminSettings;
  onSave: (s: AdminSettings) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<Partial<ApiKeyEntry>>({
    name: "",
    provider: "",
    key: "",
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const addKey = () => {
    if (!newKey.name || !newKey.key) return;
    const entry: ApiKeyEntry = {
      id: generateId(),
      name: newKey.name!,
      provider: newKey.provider || "custom",
      key: newKey.key!,
      active: true,
      createdAt: new Date().toISOString(),
    };
    onSave({
      ...settings,
      apiKeys: [...settings.apiKeys, entry],
    });
    setNewKey({ name: "", provider: "", key: "" });
    setShowForm(false);
  };

  const removeKey = (id: string) => {
    onSave({
      ...settings,
      apiKeys: settings.apiKeys.filter((k) => k.id !== id),
    });
  };

  const toggleActive = (id: string) => {
    onSave({
      ...settings,
      apiKeys: settings.apiKeys.map((k) =>
        k.id === id ? { ...k, active: !k.active } : k
      ),
    });
  };

  const toggleVisible = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).catch(() => {});
  };

  const providers = [
    { id: "emex", name: "Emex API" },
    { id: "autodoc", name: "Autodoc API" },
    { id: "exist", name: "Exist API" },
    { id: "partskm", name: "Parts.km API" },
    { id: "custom", name: "Другой" },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm">API ключи</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
          >
            <PlusIcon size={14} />
            Добавить
          </button>
        </div>

        <p className="text-gray-500 text-xs mb-3">
          API ключи позволяют автоматически получать актуальные цены и фото
          запчастей от поставщиков. Цены пересчитываются автоматически с учётом
          наценки.
        </p>

        {showForm && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 mb-3 space-y-2.5">
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Провайдер
              </label>
              <div className="flex flex-wrap gap-1.5">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setNewKey({ ...newKey, provider: p.id, name: newKey.name || p.name })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      newKey.provider === p.id
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Название
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) =>
                  setNewKey({ ...newKey, name: e.target.value })
                }
                placeholder="Мой Emex ключ"
                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                API Key
              </label>
              <input
                type="text"
                value={newKey.key}
                onChange={(e) =>
                  setNewKey({ ...newKey, key: e.target.value })
                }
                placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-gray-600 outline-none focus:border-red-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addKey}
                disabled={!newKey.name || !newKey.key}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 active:scale-95 text-white font-bold py-2 rounded-lg text-xs transition-all"
              >
                Сохранить ключ
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {settings.apiKeys.length === 0 ? (
          <div className="text-center py-6">
            <KeyIcon size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Нет API ключей</p>
            <p className="text-gray-600 text-xs mt-1">
              Добавьте ключ для автоматического получения цен
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {settings.apiKeys.map((k) => (
              <div
                key={k.id}
                className={`border rounded-xl p-3 transition-all ${
                  k.active
                    ? "bg-gray-900 border-gray-700"
                    : "bg-gray-900/50 border-gray-800 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {k.name}
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                      {k.provider} ·{" "}
                      {new Date(k.createdAt).toLocaleDateString("ru")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(k.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        k.active
                          ? "bg-green-600/20 text-green-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {k.active ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="flex-1 text-xs text-gray-400 font-mono bg-[#111] px-2 py-1 rounded truncate">
                    {visibleKeys.has(k.id)
                      ? k.key
                      : "•".repeat(Math.min(k.key.length, 24))}
                  </code>
                  <button
                    onClick={() => toggleVisible(k.id)}
                    className="p-1 text-gray-500 hover:text-gray-300"
                    title={visibleKeys.has(k.id) ? "Скрыть" : "Показать"}
                  >
                    {visibleKeys.has(k.id) ? (
                      <EyeOffIcon size={14} />
                    ) : (
                      <EyeIcon size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => copyKey(k.key)}
                    className="p-1 text-gray-500 hover:text-gray-300"
                    title="Копировать"
                  >
                    <CopyIcon size={14} />
                  </button>
                  <button
                    onClick={() => removeKey(k.id)}
                    className="p-1 text-red-500/60 hover:text-red-400"
                    title="Удалить"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">
          Как это работает
        </p>
        <p className="text-yellow-400/70 text-[11px] leading-relaxed">
          После добавления API ключа цены на товары будут загружаться
          автоматически из каталога поставщика. Фотографии запчастей также берутся
          оттуда. Итоговая цена = цена поставщика + ваша наценка (
          {settings.markupPercent}%).
        </p>
      </div>
    </div>
  );
}

function SettingsTab({
  settings,
  onSave,
}: {
  settings: AdminSettings;
  onSave: (s: AdminSettings) => void;
}) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [supportLink, setSupportLink] = useState(settings.supportLink);
  const [deliveryText, setDeliveryText] = useState(settings.deliveryText);
  const [minOrder, setMinOrder] = useState(settings.minOrderAmount);

  const handleSave = () => {
    onSave({
      ...settings,
      storeName,
      supportLink,
      deliveryText,
      minOrderAmount: minOrder,
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-white font-bold text-sm">Настройки магазина</p>

        <div>
          <label className="text-gray-400 text-xs block mb-1">
            Название магазина
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">
            Ссылка на бот поддержки
          </label>
          <input
            type="text"
            value={supportLink}
            onChange={(e) => setSupportLink(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">
            Текст доставки
          </label>
          <input
            type="text"
            value={deliveryText}
            onChange={(e) => setDeliveryText(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs block mb-1">
            Мин. сумма заказа (₽)
          </label>
          <input
            type="number"
            min={0}
            value={minOrder}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-600"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <SaveIcon size={16} />
          Сохранить настройки
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-2">Информация о системе</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Telegram ID</span>
            <span className="text-white font-mono">
              {getTelegramUserId() ?? "N/A (dev mode)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Пользователь</span>
            <span className="text-white">{getUserDisplayName()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Товаров в базе</span>
            <span className="text-white">{products.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Наценка</span>
            <span className="text-white">{settings.markupPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">API ключей</span>
            <span className="text-white">{settings.apiKeys.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminOrdersTab() {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editTracking, setEditTracking] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [notifSent, setNotifSent] = useState<string | null>(null);

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    setEditStatus(order.status);
    setEditTracking(order.trackingNumber);
    setEditCarrier(order.trackingCarrier);
  };

  const saveOrder = async () => {
    if (!editingId) return;
    const updated = orders.map((o) => {
      if (o.id !== editingId) return o;
      return {
        ...o,
        status: editStatus,
        trackingNumber: editTracking,
        trackingCarrier: editCarrier,
        updatedAt: new Date().toISOString(),
      };
    });
    setOrders(updated);
    saveOrders(updated);

    const order = updated.find((o) => o.id === editingId);
    if (order && order.telegramId) {
      if (editStatus === "delivered") {
        await notifyUserOrderDelivered(order);
      } else {
        await notifyUserTrackingUpdate(order);
      }
      setNotifSent(editingId);
      setTimeout(() => setNotifSent(null), 2000);
    }
    setEditingId(null);
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    saveOrders(updated);
  };

  const allStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "packing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-3">
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <p className="text-white font-bold text-sm mb-1">
          Управление заказами ({orders.length})
        </p>
        <p className="text-gray-500 text-xs">
          Обновляйте статус, добавляйте трек-номера — уведомления отправятся клиенту автоматически
        </p>
      </div>

      {notifSent && (
        <div className="bg-green-600/20 border border-green-600/40 rounded-xl px-4 py-2.5 flex items-center gap-2 text-green-400 text-sm font-semibold">
          <CheckIcon size={16} />
          Уведомление отправлено клиенту
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <PackageIcon size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">Нет заказов</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-[#111] border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold text-sm">#{order.id}</p>
                <p className="text-gray-500 text-[10px]">
                  {new Date(order.createdAt).toLocaleString("ru")}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="p-1 text-red-500/50 hover:text-red-400"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>

            <div className="text-xs space-y-0.5 mb-2">
              <p className="text-gray-300">
                {order.customerName} · {order.customerPhone}
              </p>
              <p className="text-gray-500">
                {(order as any).customerRegion ? `${(order as any).customerRegion}, ` : ""}{order.customerCity ? `${order.customerCity}, ` : ""}{order.customerAddress}
              </p>
              {order.comment && (
                <p className="text-gray-600 italic">"{order.comment}"</p>
              )}
              <p className="text-gray-500">
                TG: {order.telegramId ?? "N/A"}
              </p>
            </div>

            <div className="text-xs mb-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-0.5">
                  <span className="text-gray-400 truncate flex-1 mr-2">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="text-white font-bold">
                    {(item.price * item.quantity).toLocaleString()} ₽
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-gray-800 mt-1">
                <span className="text-gray-400 font-bold">Итого</span>
                <span className="text-white font-black">
                  {order.total.toLocaleString()} ₽
                </span>
              </div>
            </div>

            {editingId === order.id ? (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-2">
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">
                    Статус
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {allStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          editStatus === s
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">
                    Трек-номер
                  </label>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="EMS123456789RU"
                    className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs font-mono outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">
                    Служба доставки
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {["СДЭК", "Почта России", "DPD", "Boxberry", "EMS", "Другая"].map(
                      (c) => (
                        <button
                          key={c}
                          onClick={() => setEditCarrier(c)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            editCarrier === c
                              ? "bg-red-600 text-white"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {c}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveOrder}
                    className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <SaveIcon size={12} />
                    Сохранить и уведомить
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startEdit(order)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2 rounded-lg text-xs transition-all"
              >
                Редактировать заказ
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
