This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Pages

This app builds as **static HTML** (`next.config.ts` sets `output: "export"`; output is in `out/`).

### Connect the Git repo (recommended)

1. In the Cloudflare dashboard: **Workers & Pages** → **Create** → **Pages** → connect your Git provider.
2. Configure the build:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** 20 or newer (set via `NODE_VERSION` environment variable or `.nvmrc` if you use one).
3. Save and deploy; each push to the chosen branch will rebuild.

### Deploy from your machine (Wrangler)

1. One-time login: `npx wrangler login`
2. Build: `npm run build`
3. Deploy: `npm run pages:deploy -- --project-name=YOUR_PAGES_PROJECT_NAME`  
   (Create the project in the dashboard first, or Wrangler can create it on first deploy depending on your account.)

`wrangler.toml` sets the Pages project name to `tool-pages`; change `name` there if you use a different project slug.

## Deploy on Vercel

This repository is configured for a **static export**, which also works on any static host. For Vercel, connect the repo and use output directory **`out`** (or adjust the project to run `next build` and deploy the `out` folder as static files).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
