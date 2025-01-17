import React from "react";
import { SignIn } from "@clerk/nextjs";
import { BarChartHorizontal, LineChart, GitCommit, Users } from "lucide-react";

const SignInPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth Form */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 lg:w-1/2 lg:px-12">
        <div className="absolute left-8 top-8">
          <div className="flex items-center space-x-2">
            <BarChartHorizontal className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevDash</span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors !border-0",
                card: "shadow-none",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "border border-input hover:bg-accent transition-colors",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldInput:
                  "h-10 bg-background border border-input focus:ring-2 focus:ring-primary focus:border-primary",
                footerActionLink: "text-primary hover:text-primary/90",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formFieldLabel: "text-foreground font-medium",
              },
              layout: {
                socialButtonsPlacement: "bottom",
              },
            }}
          />
        </div>
      </div>

      <div className="hidden w-1/2 flex-col justify-center bg-secondary/50 px-12 lg:flex">
        <div className="max-w-lg">
          <h1 className="mb-4 text-3xl font-bold">
            GitHub Analytics Made Simple
          </h1>
          <p className="mb-8 text-muted-foreground">
            DevDash is a powerful GitHub repository analytics tool, built for
            developers who want clear insights into their codebase. Join
            thousands of developers using DevDash to make better decisions.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Visual Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive dashboards and beautiful visualizations that make
                  your data come alive
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <GitCommit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Real-time Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Track repository activity and team performance in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Designed for teams of all sizes with intuitive interfaces for
                  everyone
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">
                Repos Analyzed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
