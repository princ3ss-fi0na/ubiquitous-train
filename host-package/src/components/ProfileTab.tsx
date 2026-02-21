import React, { useState, useEffect, useCallback } from "react";
import {
  UserIcon,
  SaveIcon,
  CheckIcon,
  PackageIcon,
  SearchIcon,
  ClockIcon,
} from "./Icons";
import { UserProfile, saveProfile, isProfileComplete } from "../utils/userProfile";
import {
  Order,
  STATUS_LABELS,
  STATUS_COLORS,
  loadOrders,
  canCancelOrder,
  getCancelSecondsLeft,
  cancelOrder,
} from "../utils/orders";
import { getTelegramUserId, getUserDisplayName } from "../utils/auth";
import {
  validateName,
  validatePhone,
  validateCity,
  validateAddress,
  validateEmail,
  validateRegion,
  formatPhoneInput,
} from "../utils/validation";
import { ValidatedInput } from "./ValidatedInput";
import { RegionSelect } from "./RegionSelect";

interface ProfileTabProps {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onProfileChange }) => {
  const [section, setSection] = useState<"profile" | "orders">("profile");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [trackInput, setTrackInput] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    name: validateName(form.name),
    phone: validatePhone(form.phone),
    region: validateRegion(form.region),
    city: validateCity(form.city),
    address: validateAddress(form.address),
    email: validateEmail(form.email),
  };

  const hasErrors = Object.values(errors).some((e) => e !== null && e !== undefined);
  const hasRequiredFilled = form.name && form.phone && form.region && form.city;

  const handleOrderCancelled = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" as const, updatedAt: new Date().toISOString() } : o))
    );
  }, []);

  const handleSave = () => {
    setTouched({ name: true, phone: true, region: true, city: true, address: true, email: true });
    if (hasErrors) return;
    const updated = { ...form, telegramId: getTelegramUserId(), savedAt: new Date().toISOString() };
    saveProfile(updated);
    onProfileChange(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const tgId = getTelegramUserId();
  const myOrders = orders.filter((o) => o.telegramId === tgId || !o.telegramId);

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-lg">
          {profile.name ? profile.name[0].toUpperCase() : "?"}
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">
            {profile.name || getUserDisplayName()}
          </h2>
          <p className="text-gray-500 text-xs">
            {tgId ? `Telegram ID: ${tgId}` : "Локальный режим"}
            {isProfileComplete(profile) && " · Профиль заполнен"}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 mb-4 bg-[#111] rounded-xl p-1 border border-gray-800">
        <button
          onClick={() => setSection("profile")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            section === "profile" ? "bg-red-600 text-white" : "text-gray-500"
          }`}
        >
          <UserIcon size={14} />
          Профиль
        </button>
        <button
          onClick={() => setSection("orders")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            section === "orders" ? "bg-red-600 text-white" : "text-gray-500"
          }`}
        >
          <PackageIcon size={14} />
          Заказы{myOrders.length > 0 && ` (${myOrders.length})`}
        </button>
      </div>

      {saved && (
        <div className="mb-3 bg-green-600/20 border border-green-600/40 rounded-xl px-4 py-2.5 flex items-center gap-2 text-green-400 text-sm font-semibold">
          <CheckIcon size={16} />
          Профиль сохранён
        </div>
      )}

      {/* PROFILE */}
      {section === "profile" && (
        <div className="space-y-3">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-white font-bold text-sm">Личные данные</p>
            <p className="text-gray-500 text-xs -mt-1">
              Заполните один раз — данные подставятся при оформлении заказа
            </p>

            <ValidatedInput
              label="Имя и фамилия"
              value={form.name}
              onChange={(v) => { setForm({ ...form, name: v }); setTouched({ ...touched, name: true }); }}
              error={errors.name}
              placeholder="Иван Иванов"
              required
              touched={touched.name}
            />
            <ValidatedInput
              label="Телефон"
              value={form.phone}
              onChange={(v) => { setForm({ ...form, phone: formatPhoneInput(v) }); setTouched({ ...touched, phone: true }); }}
              error={errors.phone}
              placeholder="+7 (900) 123-45-67"
              type="tel"
              required
              touched={touched.phone}
            />
            <RegionSelect
              value={form.region}
              onChange={(v) => { setForm({ ...form, region: v }); setTouched({ ...touched, region: true }); }}
              error={errors.region}
              touched={touched.region}
            />
            <ValidatedInput
              label="Населённый пункт"
              value={form.city}
              onChange={(v) => { setForm({ ...form, city: v }); setTouched({ ...touched, city: true }); }}
              error={errors.city}
              placeholder="Город, село, посёлок..."
              required
              touched={touched.city}
              cityAutocomplete
            />
            <ValidatedInput
              label="Адрес доставки"
              value={form.address}
              onChange={(v) => { setForm({ ...form, address: v }); setTouched({ ...touched, address: true }); }}
              error={errors.address}
              placeholder="ул. Примерная, д. 1, кв. 10"
              required
              touched={touched.address}
            />
            <ValidatedInput
              label="Email (необязательно)"
              value={form.email}
              onChange={(v) => { setForm({ ...form, email: v }); setTouched({ ...touched, email: true }); }}
              error={errors.email}
              placeholder="ivan@mail.ru"
              type="email"
              touched={touched.email}
            />

            <button
              onClick={handleSave}
              disabled={hasErrors && hasRequiredFilled !== ""}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:text-gray-500"
            >
              <SaveIcon size={16} />
              Сохранить профиль
            </button>
          </div>

          {profile.savedAt && (
            <p className="text-gray-600 text-xs text-center">
              Обновлено: {new Date(profile.savedAt).toLocaleString("ru")}
            </p>
          )}
        </div>
      )}

      {/* ORDERS */}
      {section === "orders" && (
        <div className="space-y-3">
          {/* Track search */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <SearchIcon size={16} />
              </div>
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="Трек-номер или номер заказа..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600"
              />
            </div>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon size={48} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">Нет заказов</p>
              <p className="text-gray-600 text-sm mt-1">
                Оформите первый заказ в каталоге
              </p>
            </div>
          ) : (
            myOrders
              .filter(
                (o) =>
                  !trackInput ||
                  o.id.toLowerCase().includes(trackInput.toLowerCase()) ||
                  o.trackingNumber.toLowerCase().includes(trackInput.toLowerCase())
              )
              .map((order) => <OrderCard key={order.id} order={order} onCancel={handleOrderCancelled} />)
          )}
        </div>
      )}
    </div>
  );
};

function OrderCard({ order: initialOrder, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [secondsLeft, setSecondsLeft] = useState(() => getCancelSecondsLeft(initialOrder));
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (order.status !== "pending" || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      const left = getCancelSecondsLeft(order);
      setSecondsLeft(left);
      if (left <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const handleCancel = useCallback(() => {
    if (!canCancelOrder(order)) return;
    setCancelling(true);
    const updated = cancelOrder(order.id);
    if (updated) {
      setOrder(updated);
      setSecondsLeft(0);
      onCancel(order.id);
    }
    setCancelling(false);
  }, [order, onCancel]);

  const statusLabel = STATUS_LABELS[order.status];
  const statusColor = STATUS_COLORS[order.status];
  const showCancelTimer = order.status === "pending" && secondsLeft > 0;

  const steps: { key: string; label: string; done: boolean }[] = [
    { key: "pending", label: "Оформлен", done: true },
    {
      key: "confirmed",
      label: "Подтверждён",
      done: ["confirmed", "packing", "shipped", "delivered"].includes(order.status),
    },
    {
      key: "packing",
      label: "Собирается",
      done: ["packing", "shipped", "delivered"].includes(order.status),
    },
    {
      key: "shipped",
      label: "Отправлен",
      done: ["shipped", "delivered"].includes(order.status),
    },
    {
      key: "delivered",
      label: "Доставлен",
      done: order.status === "delivered",
    },
  ];

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center flex-shrink-0">
          <PackageIcon size={20} className={statusColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-bold">#{order.id}</p>
            <span className={`text-[10px] font-bold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            {order.items.length} {order.items.length === 1 ? "товар" : "товаров"} ·{" "}
            {order.total.toLocaleString()} ₽ ·{" "}
            {new Date(order.createdAt).toLocaleDateString("ru")}
          </p>
        </div>
        <span className="text-gray-600 text-lg">{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          {/* Progress steps */}
          {order.status !== "cancelled" && (
            <div className="flex items-center gap-0 px-1">
              {steps.map((step, i) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center" style={{ minWidth: 16 }}>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        step.done ? "bg-red-600" : "bg-gray-700"
                      }`}
                    >
                      {step.done && <CheckIcon size={10} className="text-white" />}
                    </div>
                    <span
                      className={`text-[8px] mt-1 text-center leading-tight ${
                        step.done ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-0.5 rounded ${
                        step.done && steps[i + 1].done ? "bg-red-600" : "bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Трек-номер</p>
              <div className="flex items-center gap-2">
                <code className="text-white font-mono text-sm font-bold flex-1">
                  {order.trackingNumber}
                </code>
                {order.trackingCarrier && (
                  <span className="text-gray-500 text-xs">{order.trackingCarrier}</span>
                )}
              </div>
              <a
                href={`https://track24.ru/?code=${encodeURIComponent(order.trackingNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 text-xs mt-1.5 inline-block hover:underline"
              >
                Отследить на track24.ru →
              </a>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-gray-400 text-xs mb-1.5">Товары</p>
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-1 border-b border-gray-800/50 last:border-0"
              >
                <span className="text-gray-300 flex-1 truncate mr-2">
                  {item.name}
                </span>
                <span className="text-gray-500 text-xs mr-2">×{item.quantity}</span>
                <span className="text-white font-bold">
                  {(item.price * item.quantity).toLocaleString()} ₽
                </span>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="text-xs space-y-0.5">
            <div className="flex gap-2">
              <span className="text-gray-500 w-16 flex-shrink-0">Адрес:</span>
              <span className="text-gray-300">
                {order.customerRegion ? `${order.customerRegion}, ` : ""}{order.customerCity ? `${order.customerCity}, ` : ""}{order.customerAddress}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-16 flex-shrink-0">Телефон:</span>
              <span className="text-gray-300">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon size={12} className="text-gray-600" />
              <span className="text-gray-600">
                {new Date(order.createdAt).toLocaleString("ru")}
              </span>
            </div>
          </div>

          {/* Cancel button with countdown */}
          {showCancelTimer && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ClockIcon size={14} className="text-red-400" />
                  <span className="text-red-400 text-xs font-semibold">
                    Отмена доступна: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="w-full bg-red-950 rounded-full h-1 mb-3">
                <div
                  className="bg-red-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(secondsLeft / 90) * 100}%` }}
                />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                disabled={cancelling}
                className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/40 border border-red-600/40 rounded-lg text-red-400 text-sm font-semibold transition-all active:scale-95"
              >
                {cancelling ? "Отмена..." : "Отменить заказ"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
