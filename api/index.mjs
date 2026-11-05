// Vercel serverless entrypoint.
//
// Vercel invokes this file instead of `dist/main.js`. The Nest application is
// created once per lambda instance and the underlying Express instance (a plain
// `(req, res)` handler) is reused for every request, so cold starts are paid
// only once.
//
// It imports the compiled output, which means `pnpm build` must run before the
// function is packaged (see `buildCommand` in `vercel.json`). Staying in plain
// JS keeps Vercel from having to resolve the `.js`-suffixed TypeScript imports
// that the `nodenext` config requires.

import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from '../dist/app.module.js';

let appPromise;

async function createApp() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.init();

  return app.getHttpAdapter().getInstance();
}

function getApp() {
  // If initialization fails, forget the rejected promise so the next request
  // gets a fresh attempt instead of a permanently broken instance.
  appPromise ??= createApp().catch((error) => {
    appPromise = undefined;
    throw error;
  });

  return appPromise;
}

export default async function handler(request, response) {
  const app = await getApp();

  return app(request, response);
}
