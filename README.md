# ARK Finance Consultancy

**Solution to every financial problem**

ARK Finance Consultancy is a financial advisory firm based in Vastral, Ahmedabad, Gujarat. Founded in 2026 by Karan Joshi (CAFC Qualified), the firm serves 1,500+ clients across Gujarat with four core practice areas: lending, taxation, investment advisory, and insurance.

## Features

- **Home** — Hero, stats, services overview, process steps and testimonials
- **About** — Company story, founder bio, and team showcase
- **Services** — Detailed pages for Loan Financing, Insurance, Tax Consultancy, and Financial Management
- **Team** — Team member cards with photos and bios
- **Testimonials** — Client reviews and ratings
- **Blog / Insights** — Financial articles and guides
- **Contact** — Lead form, newsletter signup and office details
- **WhatsApp Integration** — One-click chat button on every page

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui
- **Backend / DB:** Supabase (PostgreSQL, Auth, Storage)
- **Build Tool:** Vite 8
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun

### Installation

```sh
git clone https://github.com/DeepakNagar1757/Ark-Finance-Final.git
cd Ark-Finance-Final
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```sh
cp .env.example .env
```

```
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Run Development Server

```sh
npm run dev
```

The site will be available at `http://localhost:8080`.

### Production Build

```sh
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    site/          # Site-specific components (Header, Footer, Cards, Forms)
    ui/            # Reusable UI primitives (shadcn/ui)
  routes/          # TanStack Router file-based routes
  lib/             # Utilities, queries, site config
  integrations/    # Supabase client and types
supabase/
  migrations/      # Database schema and seed data
public/            # Static assets (images, favicon, robots.txt)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## License

Private — ARK Finance Consultancy. All rights reserved.
