"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Info } from "lucide-react";
import { createCheckoutSession } from "@/lib/stripe";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useProject from "@/hooks/use-project";
import { useConfirm } from "@/hooks/use-confirm";
import useRefetch from "@/hooks/use-refetch";
import { UserTier } from "@/types/types";

type PricingTier = {
  name: string;
  metaname: UserTier;
  price: string;
  reposLimit: number;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
};

const PricingPage = () => {
  const { data: user } = api.user.getUser.useQuery();
  const cancelSubscription = api.user.cancelSubscription.useMutation();
  const { projects } = useProject();
  const refetch = useRefetch();
  const tiers: PricingTier[] = [
    {
      name: "Hobby",
      metaname: UserTier.basic,
      price: "Free",
      reposLimit: 3,
      description: "Perfect for personal projects and learning",
      features: [
        "Up to 3 repositories",
        "Basic analytics dashboard",
        "Community support",
        "1 team member",
        "7 day data retention",
      ],
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      metaname: UserTier.pro,
      price: "€29",
      reposLimit: 5,
      description: "For professional developers and small teams",
      features: [
        "Up to 10 repositories",
        "Advanced analytics",
        "Priority support",
        "Up to 5 team members",
        "30 day data retention",
        "Custom dashboards",
        "API access",
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Premium",
      metaname: UserTier.premium,
      price: "€99",
      reposLimit: 10,
      description: "For large teams and organizations",
      features: [
        "Unlimited repositories",
        "Advanced analytics",
        "24/7 dedicated support",
        "Unlimited team members",
        "90 day data retention",
        "Custom dashboards",
        "API access",
        "SSO integration",
        "Custom contracts",
        "SLA guarantee",
      ],
      buttonText: "Upgrade to Premium",
    },
  ];

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Cancel Subscription",
    "This action cannot be undone.",
    "destructive",
  );

  const canCancelSubscription = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    cancelSubscription.mutate(
      { tier: UserTier.basic },
      {
        onSuccess: () => {
          toast.success("Subscription has been cancelled");
          refetch();
        },
        onError: () => {
          toast.error("Failed to cancel subscription");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      <DeleteDialog />
      <h1 className="mb-2 text-2xl font-semibold">Billing</h1>

      {/* Current Plan Info */}
      <div className="mb-8 xl:mb-16">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-x-2">
              <Info className="size-4 text-blue-700 dark:text-blue-300" />
              <p className="text-sm font-medium">
                You are currently on the {user?.tier.slice(0, 1).toUpperCase()}
                {user?.tier.slice(1)} plan
              </p>
            </div>
            {user?.tier !== "basic" && (
              <Button variant={"destructive"} onClick={canCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid gap-9 xl:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative transition-all duration-300 ${
              tier.popular
                ? "mx-4 border-primary shadow-lg hover:scale-[1.15] xl:mx-0 xl:-mt-4 xl:scale-110"
                : "mx-8 hover:scale-[1.02] xl:mx-0"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <div className="flex items-baseline justify-between">
                  <span>{tier.name}</span>
                  <div>
                    <span className="text-2xl font-bold">{tier.price}</span>
                    {tier.price !== "Free" && (
                      <span className="text-sm text-muted-foreground">/mo</span>
                    )}
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {tier.description}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                onClick={() => {
                  if (tier.price !== "Free") {
                    createCheckoutSession(
                      tier.metaname,
                      window.location.origin,
                    );
                  }
                }}
                disabled={user?.tier === tier.metaname}
              >
                {user?.tier === tier.metaname ? "Active" : tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Usage Section */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Current Usage</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repositories</CardTitle>
              <div className="text-2xl font-bold">
                {projects?.length}/
                {tiers.find((tier) => tier.metaname === user?.tier)?.reposLimit}
              </div>
              <p className="text-sm text-muted-foreground">
                Active repositories
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Projects</CardTitle>
              <div className="text-2xl font-bold">
                {user?.userToProject.length ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Including archived
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Retention</CardTitle>
              <div className="text-2xl font-bold">
                {user?.tier === "basic"
                  ? "7"
                  : user?.tier === "pro"
                    ? "30"
                    : "90"}{" "}
                days
              </div>
              <p className="text-sm text-muted-foreground">
                Of analytics history
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 border-t pt-8">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Info className="size-4" />
            <p className="text-sm">
              Need help choosing a plan? Contact our sales team for a
              consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
