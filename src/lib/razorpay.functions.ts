import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const createOrderSchema = z.object({
  amount: z.number().int().min(100), // paise
  currency: z.string().length(3).default("INR"),
  receipt: z.string().max(40).optional(),
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return { ok: false as const, error: "Payments not configured." };
    }

    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          receipt: data.receipt ?? `rcpt_${Date.now()}`,
        }),
      });

      if (res.status === 401) {
        return { ok: false as const, error: "Razorpay auth failed." };
      }
      if (!res.ok) {
        const body = await res.text();
        console.error("[razorpay] create order failed", res.status, body);
        return { ok: false as const, error: "Could not create order." };
      }

      const order = (await res.json()) as { id: string; amount: number; currency: string };
      return {
        ok: true as const,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      };
    } catch (err) {
      console.error("[razorpay] create order error", err);
      return { ok: false as const, error: "Could not create order." };
    }
  });

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(256),
});

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return { ok: false as const, error: "Payments not configured." };

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(data.razorpay_signature, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false as const, error: "Signature mismatch." };
    }

    return { ok: true as const, paymentId: data.razorpay_payment_id };
  });
