import { db } from "@/server/db";
import { UserTier } from "@/types/types";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signiture = (await headers()).get("stripe-signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signiture,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid Signiture" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const tier = (session.metadata?.["tier"] as UserTier) ?? UserTier.basic;
    const userId = session.client_reference_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await db.stripeTransaction.create({
      data: {
        tier,
        userId,
      },
    });

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        tier,
      },
    });
    return NextResponse.json(
      { message: "Role changed successfully" },
      { status: 200 },
    );
  }

  return NextResponse.json({});
}
