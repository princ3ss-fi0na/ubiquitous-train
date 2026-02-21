import React, { useState, useEffect } from "react";
import { Product } from "../data/cars";
import { StarIcon, CheckIcon, ClockIcon } from "./Icons";
import { categoryIconMap } from "../utils/categoryIcons";
import { UserProfile, saveProfile } from "../utils/userProfile";
import { createOrder, Order, cancelOrder, getCancelSecondsLeft } from "../utils/orders";
import { notifyAdminNewOrder } from "../utils/botApi";
import { getTelegramUserId } from "../utils/auth";
import {
  validateName,
  validatePhone,
  validateAddress,
  validateRegion,
  formatPhoneInput,
} from "../utils/validation";
import { ValidatedInput } from "./ValidatedInput";
import { RegionSelect } from "./RegionSelect";

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  getPrice: (base: number) => number;
  getOldPrice: (base?: number) => number | undefined;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  onClose,
  profile,
  onProfileChange,
  getPrice,
  getOldPrice,
}) => {
  const [step, setStep] = useState<"details" | "form" | "success">("details");
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    region: profile.region,
    city: profile.city,
    address: profile.address,
    comment: "",
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [sending, setSending] = useState(false);
  const [cancelSeconds, setCancelSeconds] = useState(0);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [orderTouched, setOrderTouched] = useState<Record<string, boolean>>({});

  const orderErrors = {
    name: validateName(form.name),
    phone: validatePhone(form.phone),
    region: validateRegion(form.region),
    address: validateAddress(form.address),
  };
  const orderHasErrors = Object.values(orderErrors).some((e) => e !== null);

  useEffect(() => {
    if (!createdOrder || orderCancelled) return;
    setCancelSeconds(getCancelSecondsLeft(createdOrder));
    const timer = setInterval(() => {
      const left = getCancelSecondsLeft(createdOrder);
      setCancelSeconds(left);
      if (left <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [createdOrder, orderCancelled]);

  const handleCancelOrder = () => {
    if (!createdOrder) return;
    const updated = cancelOrder(createdOrder.id);
    if (updated) {
      setCreatedOrder(updated);
      setOrderCancelled(true);
    }
  };

  if (!product) return null;

  const price = getPrice(product.price);
  const oldPrice = getOldPrice(product.oldPrice);
  const total = price * quantity;

  const handleOrder = async () => {
    setSending(true);

    if (saveToProfile && form.name && form.phone) {
      const updatedProfile: UserProfile = {
        ...profile,
        name: form.name,
        phone: form.phone,
        address: form.address,
        telegramId: getTelegramUserId(),
        savedAt: new Date().toISOString(),
      };
      saveProfile(updatedProfile);
      onProfileChange(updatedProfile);
    }

    const order = createOrder({
      items: [
        {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          partNumber: product.partNumber,
          price,
          quantity,
        },
      ],
      total,
      customerName: form.name,
      customerPhone: form.phone,
      customerRegion: form.region,
      customerAddress: form.address,
      customerCity: form.city,
      comment: form.comment,
      telegramId: getTelegramUserId(),
    });

    setCreatedOrder(order);

    await notifyAdminNewOrder(order);

    if (window.Telegram?.WebApp) {
      try { window.Telegram.WebApp.sendData(JSON.stringify({ action: "new_order", orderId: order.id })); } catch {}
    }

    setSending(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("details");
    setQuantity(1);
    setForm({
      name: profile.name,
      phone: profile.phone,
      region: profile.region,
      city: profile.city,
      address: profile.address,
      comment: "",
    });
    setCreatedOrder(null);
    setOrderCancelled(false);
    setCancelSeconds(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg bg-[#111] rounded-t-3xl border-t border-gray-800 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {step === "details" && (
          <div className="p-5">
            <div className="flex gap-4 mb-5">
              <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 flex-shrink-0">
                {categoryIconMap[product.category] ? (
                  React.createElement(categoryIconMap[product.category], { size: 40 })
                ) : (
                  <span className="text-4xl">{product.image}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-red-500 font-semibold mb-1 uppercase tracking-wider">{product.brand}</p>
                <h3 className="text-white font-bold text-base leading-tight mb-1">{product.name}</h3>
                <p className="text-gray-500 text-xs">Арт: {product.partNumber}</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon size={14} className="text-yellow-400" />
                  <span className="text-gray-400 text-xs">{product.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-5 leading-relaxed">{product.description}</p>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 ${product.inStock ? "bg-green-950 text-green-400 border border-green-800" : "bg-red-950 text-red-400 border border-red-800"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-green-400" : "bg-red-400"}`} />
              {product.inStock ? "В наличии" : "Под заказ (3–7 дней)"}
            </div>

            <div className="flex items-center justify-between mb-5">
              <span className="text-gray-300 text-sm font-medium">Количество</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-lg font-bold active:scale-95 transition-transform"
                >−</button>
                <span className="text-white font-bold text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-bold active:scale-95 transition-transform"
                >+</button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-4 mb-5 border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Итого</span>
                <div className="text-right">
                  {oldPrice && (
                    <p className="text-gray-600 text-sm line-through">{(oldPrice * quantity).toLocaleString()} ₽</p>
                  )}
                  <p className="text-white font-black text-2xl">{total.toLocaleString()} ₽</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("form")}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-4 rounded-2xl text-base transition-all"
            >
              Оформить заказ →
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="p-5">
            <button onClick={() => setStep("details")} className="text-gray-400 text-sm mb-4 flex items-center gap-1">
              ← Назад
            </button>
            <h3 className="text-white font-bold text-lg mb-1">Данные для доставки</h3>
            {profile.name && (
              <p className="text-gray-500 text-xs mb-4">Данные подставлены из профиля</p>
            )}

            <div className="space-y-3 mb-4">
              <ValidatedInput
                label="Ваше имя"
                value={form.name}
                onChange={(v) => { setForm({ ...form, name: v }); setOrderTouched({ ...orderTouched, name: true }); }}
                error={orderErrors.name}
                placeholder="Иван Иванов"
                required
                touched={orderTouched.name}
              />
              <ValidatedInput
                label="Телефон"
                value={form.phone}
                onChange={(v) => { setForm({ ...form, phone: formatPhoneInput(v) }); setOrderTouched({ ...orderTouched, phone: true }); }}
                error={orderErrors.phone}
                placeholder="+7 (900) 123-45-67"
                type="tel"
                required
                touched={orderTouched.phone}
              />
              <RegionSelect
                value={form.region}
                onChange={(v) => { setForm({ ...form, region: v }); setOrderTouched({ ...orderTouched, region: true }); }}
                error={orderErrors.region}
                touched={orderTouched.region}
              />
              <ValidatedInput
                label="Населённый пункт"
                value={form.city}
                onChange={(v) => { setForm({ ...form, city: v }); }}
                error={null}
                placeholder="Город, село, посёлок..."
                required
              />
              <ValidatedInput
                label="Адрес доставки (улица, дом, кв.)"
                value={form.address}
                onChange={(v) => { setForm({ ...form, address: v }); setOrderTouched({ ...orderTouched, address: true }); }}
                error={orderErrors.address}
                placeholder="ул. Примерная, д. 1, кв. 5"
                required
                touched={orderTouched.address}
              />
              <ValidatedInput
                label="Комментарий"
                value={form.comment}
                onChange={(v) => setForm({ ...form, comment: v })}
                error={null}
                placeholder="VIN-код, уточнения..."
                rows={2}
              />
            </div>

            {/* Save to profile checkbox */}
            <label className="flex items-center gap-2 mb-5 cursor-pointer">
              <div
                onClick={() => setSaveToProfile(!saveToProfile)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  saveToProfile ? "bg-red-600" : "bg-gray-800 border border-gray-600"
                }`}
              >
                {saveToProfile && <CheckIcon size={12} className="text-white" />}
              </div>
              <span className="text-gray-400 text-xs">
                Сохранить данные в профиль
              </span>
            </label>

            <div className="bg-gray-900 rounded-2xl p-4 mb-5 border border-gray-800">
              <p className="text-gray-400 text-xs mb-2">Товар</p>
              <p className="text-white text-sm font-semibold mb-1">{product.name} × {quantity}</p>
              <p className="text-red-500 font-black text-xl">{total.toLocaleString()} ₽</p>
            </div>

            <button
              onClick={() => {
                setOrderTouched({ name: true, phone: true, region: true, address: true });
                if (!orderHasErrors) handleOrder();
              }}
              disabled={sending}
              className="w-full bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 hover:bg-red-700 active:scale-95 text-white font-bold py-4 rounded-2xl text-base transition-all"
            >
              {sending ? "Отправка..." : "Подтвердить заказ ✓"}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              Уведомление о заказе будет отправлено в Telegram
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-5 text-center py-10">
            {!orderCancelled ? (
              <>
                <div className="w-20 h-20 bg-green-950 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckIcon size={40} className="text-green-400" />
                </div>
                <h3 className="text-white font-black text-2xl mb-2">Заказ принят!</h3>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-950 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="text-red-400 text-4xl font-bold">✕</span>
                </div>
                <h3 className="text-white font-black text-2xl mb-2">Заказ отменён</h3>
              </>
            )}
            {createdOrder && (
              <p className="text-gray-300 text-sm mb-2 font-mono bg-gray-900 inline-block px-3 py-1 rounded-lg border border-gray-700">
                #{createdOrder.id}
              </p>
            )}
            {!orderCancelled && (
              <>
                <p className="text-gray-400 text-sm mb-2 mt-3">
                  Заказ на <span className="text-white font-semibold">{product.name}</span> оформлен.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Уведомление отправлено менеджеру. Статус заказа — в разделе «Профиль».
                </p>
              </>
            )}
            {orderCancelled && (
              <p className="text-gray-400 text-sm mb-6 mt-3">
                Заказ был отменён. Средства не списаны.
              </p>
            )}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-4 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Сумма заказа</span>
                <span className={`font-bold ${orderCancelled ? "text-gray-600 line-through" : "text-white"}`}>{total.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Статус</span>
                {orderCancelled ? (
                  <span className="text-red-400 font-semibold">Отменён</span>
                ) : (
                  <span className="text-yellow-400 font-semibold">Ожидает подтверждения</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Трекинг</span>
                <span className="text-gray-600 text-xs">Появится после отправки</span>
              </div>
            </div>

            {/* Cancel countdown */}
            {!orderCancelled && cancelSeconds > 0 && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 mb-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon size={14} className="text-red-400" />
                  <span className="text-red-400 text-xs font-semibold">
                    Можно отменить: {Math.floor(cancelSeconds / 60)}:{String(cancelSeconds % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full bg-red-950 rounded-full h-1 mb-3">
                  <div
                    className="bg-red-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${(cancelSeconds / 90) * 100}%` }}
                  />
                </div>
                <button
                  onClick={handleCancelOrder}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/40 border border-red-600/40 rounded-lg text-red-400 text-sm font-semibold transition-all active:scale-95"
                >
                  Отменить заказ
                </button>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-gray-800 hover:bg-gray-700 active:scale-95 text-white font-bold py-4 rounded-2xl text-base transition-all"
            >
              Продолжить покупки
            </button>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
};
