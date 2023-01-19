import { Router } from '@grammyjs/router';
import axios from 'axios';
import { InputFile } from 'grammy';

import { buildXls, findTrack } from '../vk';
import { parsePlaylistList } from './functions';
import { TContext } from './types';

export const router = new Router<TContext>(ctx => ctx.session.state);

export const tasks = new Set<number>();

router.route('file-input', async ctx => {
  if (ctx.message?.document) {
    console.log(ctx.message?.document);
    if (ctx.message?.document?.file_id) {
      const dir = await ctx.getFile();

      console.log(dir);
      const response = await axios.get(
        `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${dir.file_path}`,
        {
          responseType: 'text',
        },
      );
      const links = parsePlaylistList(response.data);
      console.log(`Parsed playlist URLs`);
      console.log(links);
      ctx.session.state = 'track-input';
      ctx.session.playlists = links;
      await ctx.reply(`Введите название трека:`);
    } else {
      ctx.reply('catch file');
    }
  } else {
    return ctx.reply(`Отправьте файл!`);
  }
});

router.route('track-input', async ctx => {
  if (!ctx.from?.id) {
    return;
  }
  tasks.add(ctx.from.id);
  if (!ctx.message?.text) {
    return ctx.reply(`Введите название трека!`);
  }
  await ctx.reply(`Ищем трек ${ctx.message.text}`);
  const msg = await ctx.reply(`Запускаем обработку!`);
  const tracks = await findTrack(
    ctx.session.playlists,
    ctx.message.text,
    async (i, total) => {
      await ctx.api.editMessageText(
        ctx.from!.id,
        msg.message_id,
        `${i + 1}/${total} плейлистов обработано!`,
      );
    },
  );
  const xlsx = buildXls(tracks);
  await ctx.replyWithDocument(new InputFile(xlsx, 'results.xlsx'));
  await ctx.reply(`Обработка закончена! Для повторного запуска нажмите /start`);
  tasks.delete(ctx.from.id);
});
