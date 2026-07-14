import BugReportsService from './bug-reports';
import CrewsService from './crews';
import DjsService from './djs';
import PartyroomsService from './partyrooms';
import PlaylistsService from './playlists';
import PushService from './push';
import UsersService from './users';

export const bugReportsService = new BugReportsService();
export const crewsService = new CrewsService();
export const djsService = new DjsService();
export const partyroomsService = new PartyroomsService();
export const playlistsService = new PlaylistsService();
export const pushService = new PushService();
export const usersService = new UsersService();
