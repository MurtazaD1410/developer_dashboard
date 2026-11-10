# Developer Dashboard

A comprehensive developer dashboard built with the T3 Stack, providing a centralized hub for managing projects, tracking development metrics, and monitoring code repositories. Designed for developers who want to streamline their workflow and get insights into their productivity.

## ✨ Features

- **Project Management**: Track and manage multiple development projects
- **Repository Integration**: Connect and monitor GitHub repositories
- **Code Analytics**: View commit history, language statistics, and contribution metrics
- **Task Tracking**: Manage development tasks and sprint planning
- **Performance Metrics**: Monitor development productivity and code quality
- **Team Collaboration**: Share projects and collaborate with team members
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

## 🚀 Tech Stack

This project is built using the **T3 Stack**, which includes:

- **[Next.js](https://nextjs.org)** - React framework for production
- **[TypeScript](https://typescriptlang.org)** - Static type checker for end-to-end typesafety
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs made easy
- **[Prisma](https://prisma.io)** - Build data-driven JavaScript & TypeScript apps

### Additional Technologies

- **Authentication**: Clerk
- **Database**: PostgreSQL / MySQL (via Prisma)
- **AI Integration**: Google Gemini AI
- **Payments**: Stripe
- **GitHub Integration**: GitHub API
- **UI Components**: shadcn/ui
- **Charts**: shadcn/ui Charts (Recharts)
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Database (PostgreSQL/MySQL recommended)
- Clerk account for authentication
- GitHub Personal Access Token
- Google AI Studio account (for Gemini API)
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MurtazaD1410/developer_dashboard.git
   cd developer_dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   # Base URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Prisma Database
   DATABASE_URL="postgresql://username:password@localhost:5432/developer_dashboard"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/sync-user"
   
   # GitHub API Integration
   GITHUB_TOKEN="your_github_personal_access_token"
   
   # Google Gemini AI
   GEMINI_API_KEY="your_gemini_api_key"
   
   # Stripe Payments
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
   STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
   ```

4. **Service Configuration**
   
   Set up the required services:
   
   **Clerk Setup:**
   - Create a Clerk application
   - Configure sign-in/sign-up flows
   - Set up user sync webhook (optional)
   
   **GitHub Integration:**
   - Generate a Personal Access Token with repo permissions
   - Configure repository access as needed
   
   **Google Gemini AI:**
   - Create a project in Google AI Studio
   - Generate an API key for Gemini
   
   **Stripe Setup:**
   - Create a Stripe account
   - Set up webhooks for payment processing
   - Configure products and pricing

5. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to access your developer dashboard.

⭐ If you found this project helpful, please give it a star on GitHub!
