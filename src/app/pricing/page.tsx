import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChartHorizontal, Check, Info, Zap, X } from "lucide-react";
import Link from "next/link";

const PricingPage = () => {
  const features = {
    basics: {
      title: "Basic Features",
      items: [
        {
          name: "Repository Monitoring",
          hobby: "3 repos",
          pro: "10 repos",
          enterprise: "Unlimited",
        },
        {
          name: "Team Members",
          hobby: "1 member",
          pro: "Up to 5 members",
          enterprise: "Unlimited",
        },
        {
          name: "Data Retention",
          hobby: "7 days",
          pro: "30 days",
          enterprise: "90 days",
        },
      ],
    },
    analytics: {
      title: "Analytics",
      items: [
        {
          name: "Basic Dashboard",
          hobby: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Custom Dashboards",
          hobby: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Advanced Analytics",
          hobby: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Historical Data Export",
          hobby: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    support: {
      title: "Support & Security",
      items: [
        {
          name: "Community Support",
          hobby: true,
          pro: false,
          enterprise: false,
        },
        {
          name: "Priority Support",
          hobby: false,
          pro: true,
          enterprise: false,
        },
        {
          name: "24/7 Dedicated Support",
          hobby: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "SSO Integration",
          hobby: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "SLA Guarantee",
          hobby: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={"/"}>
            <div className="flex items-center space-x-2">
              <BarChartHorizontal className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">DevDash</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-muted-foreground">
                Pricing
              </Button>
            </Link>
            <Button variant="ghost" className="text-muted-foreground">
              Documentation
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              Blog
            </Button>
            <Link href="/sign-in">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-44">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Simple, transparent pricing for everyone
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Whether you're an individual developer or a large team, DevDash has
            a plan that's right for you. Start for free, upgrade when you need
            to.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Hobby */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>
                <div className="flex items-baseline justify-between">
                  <span>Hobby</span>
                  <div>
                    <span className="text-2xl font-bold">Free</span>
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Perfect for personal projects and learning
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Up to 3 repositories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Basic analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle>
                <div className="flex items-baseline justify-between">
                  <span>Pro</span>
                  <div>
                    <span className="text-2xl font-bold">€29</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For professional developers and small teams
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Up to 10 repositories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Custom dashboards</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/sign-up" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>
                <div className="flex items-baseline justify-between">
                  <span>Enterprise</span>
                  <div>
                    <span className="text-2xl font-bold">€99</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For large teams and organizations
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Unlimited repositories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">24/7 dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">SSO integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Custom contracts</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Compare Plans</h2>
        {Object.entries(features).map(([section, { title, items }]) => (
          <div key={section} className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">{title}</h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-4">
                <div>Feature</div>
                <div className="text-center">Hobby</div>
                <div className="text-center">Pro</div>
                <div className="text-center">Enterprise</div>
              </div>
              {items.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-4 gap-4 border-b p-4 last:border-0"
                >
                  <div>{item.name}</div>
                  <div className="text-center">
                    {typeof item.hobby === "boolean" ? (
                      item.hobby ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      item.hobby
                    )}
                  </div>
                  <div className="text-center">
                    {typeof item.pro === "boolean" ? (
                      item.pro ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      item.pro
                    )}
                  </div>
                  <div className="text-center">
                    {typeof item.enterprise === "boolean" ? (
                      item.enterprise ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      item.enterprise
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">
              Can I change plans at any time?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your plan at any time.
              Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards and process payments through
              Stripe.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Is there a setup fee?</h3>
            <p className="text-muted-foreground">
              No, there are no setup fees or hidden costs. You only pay the
              advertised price.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Do you offer custom plans?</h3>
            <p className="text-muted-foreground">
              Yes, contact our sales team for custom enterprise plans tailored
              to your needs.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to get started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join thousands of developers who are already using DevDash to
            monitor and improve their projects.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Start for Free</Button>
            </Link>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
