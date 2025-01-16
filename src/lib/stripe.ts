"use server";

import { UserTier } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Hardcoded prices in cents
const PRICES = {
  pro: 2900, // €29/month
  premium: 9900, // €99/month
} as const;

type TierType = keyof typeof PRICES;

export async function createCheckoutSession(tier: UserTier) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized - No user ID found");
    }

    // Validate tier
    if (tier === UserTier.basic) {
      throw new Error("Free tier cannot be processed through Stripe");
    }

    if (!(tier in PRICES)) {
      throw new Error(`Invalid tier selected: ${tier}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `DevDash ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description:
                tier === "pro"
                  ? "Professional plan with advanced analytics and team features"
                  : "Enterprise plan with unlimited access and dedicated support",
            },
            unit_amount: PRICES[tier as TierType],
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      client_reference_id: userId.toString(),
      metadata: {
        tier,
        userId: userId.toString(),
      },
    });

    if (!session?.url) {
      throw new Error("No URL returned from Stripe");
    }

    return redirect(session.url);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create checkout session");
  }
}
