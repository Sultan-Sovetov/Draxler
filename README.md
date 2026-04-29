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

## Configurator Dev Mode Toggles

Dev tools for wheel fitment and calibration are controlled in [src/components/CarConfigurator.tsx](src/components/CarConfigurator.tsx):

- `DEV_RUNTIME_ENABLED`
	- `true`: enable runtime dev behavior (calibration/injector flows).
	- `false`: disable runtime dev behavior.
- `DEV_UI_ENABLED`
	- `true`: show Leva panel + dev calibration inputs.
	- `false`: hide dev UI while keeping normal configurator UX.

Recommended quick presets:

- Tuning session: `DEV_RUNTIME_ENABLED = true`, `DEV_UI_ENABLED = true`
- Production-safe hidden UI: `DEV_RUNTIME_ENABLED = true`, `DEV_UI_ENABLED = false`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
