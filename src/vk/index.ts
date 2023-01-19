import { Mutex } from 'async-mutex';
import axios from 'axios';
import xlsx from 'node-xlsx';
import { promisify } from 'util';

import { tokens } from './tokens';

let currentToken: string | undefined = undefined;

export type Playlist = {
  url: string;
  ownerId: number;
  playlistId: number;
  accessKey?: string;
};

export type Track = {
  ownerId: number;
  id: number;
  adds: number | string;
  title: string;
  playlistUrl: string;
  number: number;
};

export const getToken = () => {
  if (!currentToken) {
    currentToken = tokens.shift();
  }
  return currentToken;
};

export const nextToken = () => {
  currentToken = undefined;
  return getToken();
};

const mutex = new Mutex();

export const vkRequest = async (url: string) => {
  const release = await mutex.acquire();
  try {
    while (true) {
      const rurl = `${url}&access_token=${getToken()}`;
      console.log(`Requesting ${rurl}`);
      await promisify(setTimeout)(1000);
      const response = await axios.get(rurl, {
        responseType: 'json',
      });
      // console.log(response.data);
      if (response.data.error) {
        if (response.data.error.error_code === 30) {
          throw new Error(`Private profile`);
        }
        console.log(response.data);
        nextToken();
        continue;
      }
      return response.data;
    }
  } finally {
    release();
  }
};

export const getPlaylist = async (pl: Playlist) => {
  let url = `https://api.vk.com/method/audio.get?owner_id=${pl.ownerId}&playlist_id=${pl.playlistId}&v=5.84`;
  if (pl.accessKey) {
    url += `&access_key=${pl.accessKey}`;
  }
  return vkRequest(url);
};

export const getLikesAdd = async (audioId: number, ownerId: number) => {
  const url = `https://api.vk.com/method/likes.add?v=5.181&type=audio&item_id=${audioId}&owner_id=${ownerId}`;
  const resp = await vkRequest(url);
  return resp.response.likes;
};

const toWords = (search: string) =>
  <string[] | null>search.match(/[а-яА-Я\w]+/g);

const createRegexp = (search: string) => {
  let s = '';
  const words = toWords(search);
  if (!words) {
    return;
  }
  for (const word of words) {
    s += `${word}([^а-яА-Я\w]*)`;
  }
  return new RegExp(s, 'i');
};

export const findTrack = async (
  playlists: Playlist[],
  search: string,
  cb: (i: number, total: number) => Promise<void>,
) => {
  const tracks: Track[] = [];
  const exp = createRegexp(search);
  if (!exp) {
    return [];
  }
  console.log(`Searching: ${search} ${exp}`);
  for (const [i, pl] of playlists.entries()) {
    console.log(`${i + 1}/${playlists.length}: ${pl.url}`);
    try {
      const resp = await getPlaylist(pl);
      let count = 0;
      for (const [i, item] of resp.response.items.entries()) {
        const s = `${item.artist} - ${item.title}`;
        if (s.match(exp)) {
          console.log(`Match: ${s}`);
          try {
            const likes = await getLikesAdd(item.id, item.owner_id);
            tracks.push({
              ownerId: item.owner_id,
              id: item.id,
              adds: likes - 1,
              playlistUrl: pl.url,
              title: `${item.artist} ${item.title}`,
              number: i + 1,
            });
            count++;
            break;
          } catch {
            tracks.push({
              ownerId: item.owner_id,
              id: item.id,
              adds: 'PRIVATE',
              playlistUrl: pl.url,
              title: `${item.artist} ${item.title}`,
              number: 0,
            });
            count++;
            break;
          }
        }
      }
      if (count === 0) {
        tracks.push({
          ownerId: 0,
          playlistUrl: pl.url,
          title: 'NO TRACK',
          adds: 'NO TRACK',
          id: 0,
          number: 0,
        });
      }
    } catch (e) {
      console.log(e);
      tracks.push({
        ownerId: 0,
        playlistUrl: pl.url,
        title: '',
        adds: 'ERROR',
        id: 0,
        number: 0,
      });
    }
    if (i % 10 === 0) {
      await cb(i, playlists.length);
    }
  }
  return tracks;
};

export const buildXls = (tracks: Track[]) => {
  const data = tracks.map(t => [
    t.playlistUrl,
    t.title,
    t.adds,
    t.number,
  ]);
  return xlsx.build([
    {
      data: [
        [
          'Playlist URL',
          'Track',
          'Adds',
          'Number',
        ],
        ...data,
      ],
      name: 'Adds',
      options: {},
    },
  ]);
};
