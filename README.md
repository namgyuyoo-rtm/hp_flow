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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Vercel 배포 안내

- **루트 디렉토리**: 이 프로젝트의 루트는 `vercel-nextjs-demo`입니다. Vercel에서 프로젝트를 생성할 때 Root Directory를 `vercel-nextjs-demo`로 지정하세요.
- **Node.js 버전**: Next.js 15.x는 Node.js 18.18.0 이상이 필요합니다. Vercel은 기본적으로 최신 LTS를 사용합니다.
- **정적 파일 접근**: `/public/flow.html`, `/public/workflow.html`은 `/flow.html`, `/workflow.html`로 접근 가능합니다.
- **환경 변수**: 환경 변수가 필요하다면 Vercel의 환경 변수 설정을 활용하세요.
