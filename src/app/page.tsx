"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Github,
  BarChartHorizontal,
  Users,
  Zap,
  ArrowRight,
  LineChart,
  GitCommit,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const TypewriterText = () => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["Visualize.", "Analyze.", "Collaborate."];
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 2000;

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentWord!.slice(0, text.length + 1));

          if (text === currentWord) {
            setIsDeleting(true);
            setTimeout(() => {}, pauseTime);
          }
        } else {
          setText(currentWord!.slice(0, text.length - 1));

          if (text === "") {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex]);

  return (
    <span className="inline-block h-[40px] text-primary">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation - Now absolute positioned over hero */}
      <nav className="absolute left-0 right-0 top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <BarChartHorizontal className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevDash</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={"/pricing"}>
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
            <ModeToggle />
            <Link href={"/sign-in"}>
              <Button variant="outline">Login</Button>
            </Link>
            <Link href={"/sign-up"}>
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Full-screen Hero Section with Background Pattern */}
      <section className="relative flex min-h-screen items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, 
                hsl(var(--primary) / 0.1) 0%, 
                transparent 70%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="container relative mx-auto mt-16 px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="mb-4 text-6xl font-bold tracking-tight">
              GitHub Insights That
              <br />
              <TypewriterText />
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Transform your GitHub repositories into actionable insights. Built
              for developers, designed for everyone.
            </p>
            <div className="flex justify-center gap-4">
              <Link href={"/dashboard"}>
                <Button size="lg" className="gap-2 px-8 text-lg">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg">
                <Github className="h-5 w-5" /> View on GitHub
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-3 gap-8 pt-8">
              <div className="space-y-2 text-center">
                <div className="text-4xl font-bold text-primary">10x</div>
                <div className="text-muted-foreground">Faster Analytics</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-4xl font-bold text-primary">50k+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-4xl font-bold text-primary">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
          <div className="relative h-12 w-1 rounded-full bg-primary/20">
            <div className="animate-scroll absolute top-0 h-4 w-1 rounded-full bg-primary"></div>
          </div>
        </div>
      </section>

      {/* Rest of the content remains the same... */}
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <LineChart className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Visual Analytics</CardTitle>
              <CardDescription>
                Beautiful, interactive charts that make your repository data
                come alive
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GitCommit className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Commit Insights</CardTitle>
              <CardDescription>
                Deep dive into commit patterns and team collaboration metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Team-Friendly</CardTitle>
              <CardDescription>
                Built for both technical and non-technical team members
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChartHorizontal className="h-6 w-6 text-primary" />
              <span className="font-bold">DevDash</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 DevDash. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
