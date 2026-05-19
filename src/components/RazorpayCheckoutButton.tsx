import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay.functions";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export type RazorpayCheckoutButtonProps = {
  amount: number; // in paise (>=100)
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  label?: string;
  className?: string;
  onSuccess?: (paymentId: string) => void;
};

export function RazorpayCheckoutButton({
  amount,
  currency = "INR",
  name = "VivaMind AI",
  description,
  prefill,
  label = "Pay now",
  className,
  onSuccess,
}: RazorpayCheckoutButtonProps) {
  const createOrder = useServerFn(createRazorpayOrder);
  const verify = useServerFn(verifyRazorpayPayment);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const ok = await loadScript();
      if (!ok || !window.Razorpay) {
        toast.error("Could not load payment SDK");
        return;
      }

      const order = await createOrder({ data: { amount, currency } });
      if (!order.ok) {
        toast.error(order.error);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name,
        description,
        order_id: order.orderId,
        prefill,
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.message("Payment cancelled");
          },
        },
        handler: async (response) => {
          try {
            const result = await verify({ data: response });
            if (result.ok) {
              toast.success("Payment verified");
              onSuccess?.(result.paymentId);
            } else {
              toast.error(result.error);
            }
          } catch {
            toast.error("Verification failed");
          } finally {
            setLoading(false);
          }
        },
      });

      rzp.on("payment.failed", (resp: unknown) => {
        console.error("[razorpay] payment failed", resp);
        const err = resp as { error?: { description?: string } };
        toast.error(err?.error?.description ?? "Payment failed");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("[razorpay] checkout error", err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
