import { RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';

import { Playlist } from '../vk';
import { TContext } from './types';

export const sendOrEdit = async (
  ctx: TContext,
  text: string,
  other?: Other<RawApi, 'editMessageText', 'text'> &
    Other<RawApi, 'sendMessage', 'text'>,
) => {
  try {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(text, other);
  } catch {
    await ctx.reply(text, other);
  }
};

export const parsePlaylistUrl = (url: string): Playlist | undefined => {
  const m = url.match(/playlist\/?(-?[0-9]+)_([0-9]+)(_[a-z0-9]+)?/);
  if (m) {
    const result: Playlist = {
      ownerId: Number(m[1]),
      playlistId: Number(m[2]),
      url,
    };
    if (m[3]) {
      result.accessKey = m[3].slice(1);
    } else {
      const access = url.match(/access_key=([a-z0-9]+)/);
      if (access) {
        result.accessKey = access[1];
      }
    }
    return result;
  }
};

export const parsePlaylistList = (text: string) => {
  const lines = text.split('\n');
  return lines
    .filter(x => x.length > 0)
    .map(parsePlaylistUrl)
    .filter((x: Playlist | undefined): x is Playlist => !!x);
};
