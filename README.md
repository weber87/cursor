# NutriAI — Smart Calorie Tracker

A modern, mobile-friendly calorie tracking app inspired by MyFitnessPal, powered by AI.

## Features

- **Daily Diary** — Track calories and macronutrients with a beautiful circular progress ring
- **Manual Meal Logging** — Add meals with calories, protein, carbs, and fat
- **AI Photo Analysis** — Snap a photo of your food and get automatic calorie/macro estimates
- **Calorie Goals** — Set custom targets or use the built-in TDEE calculator
- **Weight Tracking** — Log weight daily and view trends over time
- **Weekly Progress Reports** — Charts for calories and weight with 7-day summaries
- **AI Recommendations** — Personalized nutrition tips based on your eating patterns

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## AI Food Analysis

Set your OpenAI API key for real food photo analysis:

```bash
# .env
OPENAI_API_KEY=sk-your-key-here
```

Without an API key, the app uses intelligent demo analysis so you can explore all features.

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Prisma + SQLite** — Database and ORM
- **Tailwind CSS 4** — Styling
- **Recharts** — Progress charts
- **OpenAI GPT-4o-mini** — Food image analysis
- **Lucide React** — Icons

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Dashboard / daily diary
│   ├── log/page.tsx      # Meal logging (photo + manual)
│   ├── progress/page.tsx # Weekly reports & weight
│   ├── profile/page.tsx  # Goals & settings
│   └── api/              # REST API routes
├── components/           # Reusable UI components
└── lib/                  # Database, AI utilities
```

## License

MIT
