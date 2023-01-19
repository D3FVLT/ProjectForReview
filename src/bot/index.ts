import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { RedisAdapter } from '@satont/grammy-redis-storage';
import { Bot, session } from 'grammy';
import { die } from 'sleep-and-die';

import { db } from '../db';
import { User } from '../db/entities/user';
import { redis } from '../misc/redis';
import { router, tasks } from './router';
import { SessionData, TContext } from './types';

const bot = new Bot<TContext>(
  process.env.BOT_TOKEN ?? die(`BOT_TOKEN is not defined`),
);

bot.use(<any>hydrateReply);
bot.api.config.use(parseMode('HTML'));

bot.errorHandler = err => {
  console.error(`ERROR: ${err}`);
};

bot.use(
  session<SessionData, TContext>({
    initial: () => <any>{},
    storage: new RedisAdapter({ instance: redis }),
  }),
);

bot.use(async (ctx, next) => {
  const repo = db.getRepository(User);
  if (!ctx.from) {
    return next();
  }
  let user = await repo.findOne({ where: { id: ctx.from.id.toString() } });
  if (!user) {
    user = await repo.save({
      firstName: ctx.from.first_name,
      username: ctx.from.username,
      id: ctx.from.id.toString(),
    });
  }
  ctx.session.user = user;
  return next();
});

bot.use(async (ctx, next) => {
  if (!ctx.from?.id) {
    return next();
  }
  if (tasks.has(ctx.from.id)) {
    return ctx.reply(`Задача уже запущена!`);
  }
  return next();
});

bot.command('start', async ctx => {
  ctx.session.state = 'file-input';
  await ctx.reply(`Отправьте .txt файл со списком ссылок на плейлисты:`);
});

bot.use(router);

export { bot };
