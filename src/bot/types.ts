import { Context, SessionFlavor } from 'grammy';
import { Playlist } from 'src/vk';

import { User } from '../db/entities/user';

export type SessionState = 'idle' | 'welcome' | 'file-input' | 'track-input';

export type SessionData = {
  state: SessionState;
  user: User;
  playlists: Playlist[];
};

export type TContext = Context & SessionFlavor<SessionData>;
