<div style="text-align: center">
  <img src="../public/images/Logo/Symbol_medium_red.png" alt="Logo" width="100px">
  <br />
  <br />
  <a aria-label="Node Version" href="https://chequer.slack.com/archives/C046888P2Q0">
      <img alt="" src="https://img.shields.io/badge/node->=20.16.0-339933?logo=nodedotjs">
  </a>
  <a aria-label="Npm Version" href="https://chequer.slack.com/archives/C046888P2Q0">
      <img alt="" src="https://img.shields.io/badge/yarn->=1.22.22-237397?logo=yarn">
  </a>
  <br />
  <img alt="badge_react" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
  <img alt="badge_typescript" src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="badge_nextjs" src="https://img.shields.io/badge/NEXT.JS-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <br />
  <a aria-label="Front Slack Channel" href="https://pfplay.slack.com/archives/C051ZQSV205">
      <img alt="" src="https://img.shields.io/badge/slack-4A154B?logo=slack">
  </a>
  <a aria-label="Front Notion Notion" href="https://www.notion.so/pfplay/FE-5e7cd836945f47b98c49e2c66e4bf949?pvs=4">
      <img alt="" src="https://img.shields.io/badge/wiki-black?logo=notion">
  </a>
  <a aria-label="Figma" href="https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?type=design&node-id=1%3A17&mode=design&t=v01tSWKTB86CkcfO-1">
      <img alt="" src="https://img.shields.io/badge/Figma-black?logo=figma&logoColor=F24E1E">
  </a>
  <h1>PFPlay</h1>
  <p>
      우리는 PFP NFT와 디제잉을 결합한 소셜 플랫폼을 만들어 새로운 디깅 문화를 만들어갑니다.
      <br />
      This repository is <strong>frontend for PFPlay</strong>.
  </p>
</div>

## Deployed

[![DEV](https://img.shields.io/badge/DEV-https%3A%2F%2Fpfplay--web.vercel.app-blue)](https://pfplay-web.vercel.app)
<br/>
[![PROD](https://img.shields.io/badge/PROD-https%3A%2F%2Fpfplay.xyz-blue)](https://pfplay.xyz)

## Getting started for Development

See [Frontend environment variables in the Notion](https://www.notion.so/pfplay/FE-bf4846ff10e74216871d972effa252c2?pvs=4) to add an `.env*.local` files

```bash
touch .env.local .env.development.local .env.production.local
```

Install dependencies with yarn:

```bash
yarn
```

Run development server:

```bash
yarn dev            # next dev --experimental-https --turbo → https://localhost:3000
```

> **If `yarn dev` fails locally (self-signed cert / turbo issues, common on Windows), run
> `npx next dev` instead** — plain HTTP + webpack on `http://localhost:3000`. Use that URL for
> local e2e (`E2E_BASE_URL=http://localhost:3000`).
>
> If the dev server behaves oddly after a branch switch, delete `.next` and make sure no stale
> process is holding port 3000.

Most screens need the backend. Bring up the full local stack from the `pfplay-platform` repo:

```bash
docker compose -f docker-compose.local.yml -p pfplay-local --env-file .env.local up -d --build
```

## Deployment targets

| Branch | Environment |
| ------ | ----------- |
| `development` | dev (Vercel preview/dev) |
| `main` | production — `https://pfplay.xyz` |

Merging into `development` does **not** ship to production; a `development → main` PR does.

## PWA

The app is installable and supports Web Push (`app/manifest.ts`, `public/sw.js`,
`src/features/push-notification`). The service worker caches **nothing at all** — its only jobs are
satisfying installability and receiving push. That is a deliberate choice for a realtime app; see
[ADR-013](./adr/013-pwa-service-worker-no-caching.md).

## Mobile

Mobile is a responsive build with dedicated widgets under `src/widgets-mobile` and
`src/features-mobile`, selected via the `x-pf-device` header injected by `src/middleware.ts`.
There is no longer a mobile block/redirect. See [ADR-014](./adr/014-mobile-widget-split.md).

## Testing

Please refer to the [Testing Guide](./TESTING.md) (unit/integration) and the
[E2E Guide](../e2e/README.md) (Playwright).

## Contributing

Please refer to [Contributing](./CONTRIBUTING.md). Documentation index: [DOCS_ENTRY](./DOCS_ENTRY.md).
