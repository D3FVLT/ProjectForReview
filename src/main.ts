import 'dotenv/config';

import { bot } from './bot';
import { initializeDb } from './db';

async function main() {
  await initializeDb();
  await bot.start({
    onStart: info => console.log(`Bot @${info.username} started`),
  });
}

main().catch(console.error);
