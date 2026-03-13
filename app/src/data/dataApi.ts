import { Preferences as Storage } from '@capacitor/preferences';
import { Schedule, Session } from '../models/Schedule';
import { Speaker } from '../models/Speaker';
import { Location } from '../models/Location';
import { Language } from './user/user.state';

const dataUrl = '/assets/data/data.json';
const locationsUrl = '/assets/data/locations.json';

const HAS_LOGGED_IN = 'hasLoggedIn';
const HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
const USERNAME = 'username';
const LANGUAGE = 'language';
const CONF_DATA = 'confData';
const LOCATIONS_DATA = 'locationsData';

const parseStoredJson = <T>(value?: string | null): T | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const readJson = async <T>(key: string): Promise<T | undefined> => {
  const stored = await Storage.get({ key });
  return parseStoredJson<T>(stored.value);
};

const storeJson = async (key: string, value: unknown) => {
  await Storage.set({ key, value: JSON.stringify(value) });
};

const fetchJsonWithCache = async <T>(url: string, key: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    const data = (await response.json()) as T;
    await storeJson(key, data);
    return data;
  } catch (error) {
    const cached = await readJson<T>(key);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getConfData = async () => {
  const responseData = await fetchJsonWithCache<any>(dataUrl, CONF_DATA);
  let locations: Location[] = [];
  try {
    locations = await fetchJsonWithCache<Location[]>(
      locationsUrl,
      LOCATIONS_DATA
    );
  } catch {
    locations = (await readJson<Location[]>(LOCATIONS_DATA)) || [];
  }
  const schedule = responseData.schedule[0] as Schedule;
  const sessions = parseSessions(schedule);
  const speakers = responseData.speakers as Speaker[];
  const allTracks = sessions
    .reduce((all, session) => all.concat(session.tracks), [] as string[])
    .filter((trackName, index, array) => array.indexOf(trackName) === index)
    .sort();

  const data = {
    schedule,
    sessions,
    locations,
    speakers,
    allTracks,
    filteredTracks: [...allTracks],
  };
  return data;
};

export const getLocationsData = async () =>
  fetchJsonWithCache<Location[]>(locationsUrl, LOCATIONS_DATA);

export const getUserData = async () => {
  const response = await Promise.all([
    Storage.get({ key: HAS_LOGGED_IN }),
    Storage.get({ key: HAS_SEEN_TUTORIAL }),
    Storage.get({ key: USERNAME }),
    Storage.get({ key: LANGUAGE }),
  ]);
  const isLoggedin = (await response[0].value) === 'true';
  const hasSeenTutorial = (await response[1].value) === 'true';
  const username = (await response[2].value) || undefined;
  const storedLanguage = await response[3].value;
  const language: Language =
    storedLanguage === 'en' || storedLanguage === 'fr'
      ? storedLanguage
      : 'fr';
  const data = {
    isLoggedin,
    hasSeenTutorial,
    username,
    language,
  };
  return data;
};

export const setIsLoggedInData = async (isLoggedIn: boolean) => {
  await Storage.set({ key: HAS_LOGGED_IN, value: JSON.stringify(isLoggedIn) });
};

export const setHasSeenTutorialData = async (hasSeenTutorial: boolean) => {
  await Storage.set({
    key: HAS_SEEN_TUTORIAL,
    value: JSON.stringify(hasSeenTutorial),
  });
};

export const setUsernameData = async (username?: string) => {
  if (!username) {
    await Storage.remove({ key: USERNAME });
  } else {
    await Storage.set({ key: USERNAME, value: username });
  }
};

export const setLanguageData = async (language: Language) => {
  await Storage.set({ key: LANGUAGE, value: language });
};

function parseSessions(schedule: Schedule) {
  const sessions: Session[] = [];
  schedule.groups.forEach((g) => {
    g.sessions.forEach((s) => sessions.push(s));
  });
  return sessions;
}
