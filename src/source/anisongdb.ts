import {
  addCachedItem,
  ANN_ANIME_ID_CACHE,
  getCachedItem,
} from "../storage/cache";
import { getMappings } from "../storage/mappings";
import { requestJson } from "../utils";
import { findAnilistStaff } from "./anilist-staff";

const ANILIST_API = "https://graphql.anilist.co";
const MAL_API = "https://api.jikan.moe/v4";
const ANISONGDB_API = "https://anisongdb.com/api";

const ANN_ANIME_ID_TTL = 60 * 60 * 24;

async function fetchMalId(anilistId: number): Promise<number | null> {
  const query = `
    query ($id: Int) {
      Media (id: $id) {
        idMal
      }
    }
  `;

  const variables = { id: anilistId };
  const response = await requestJson(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify({ query, variables }),
  });

  if (response.data.Media === undefined) {
    console.warn("No candidate MyAnimeList id found for id: " + anilistId);
    return null;
  }

  return response.data.Media.idMal;
}

async function fetchAnnIdFromMal(malId: number): Promise<number | null> {
  const response = await requestJson(`${MAL_API}/anime/${malId}/external`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (response.data === undefined) {
    console.warn("No candidate ANN id found for id: " + malId);
    return null;
  }

  const annExternal = response.data.find(
    (external: { name: string; url: string }) =>
      external.name === "AnimeNewsNetwork"
  );
  if (annExternal === undefined) {
    console.warn("No candidate ANN id found for id: " + malId);
    return null;
  }

  const annId = annExternal.url.match(/id=(\d+)/)[1];
  if (annId === undefined) {
    console.warn("No candidate ANN id found for id: " + malId);
    return null;
  }

  return parseInt(annId);
}

async function getAnnId(anilistId: number): Promise<number | null> {
  const mappings = await getMappings();
  if (mappings.annIds[anilistId] !== undefined)
    return mappings.annIds[anilistId];

  const cachedAnnId = getCachedItem<number>(ANN_ANIME_ID_CACHE, anilistId);
  if (cachedAnnId !== undefined) return cachedAnnId;

  const malId = await fetchMalId(anilistId);
  if (malId === null) return null;

  const annId = await fetchAnnIdFromMal(malId);
  if (annId === null) return null;

  addCachedItem<number>(ANN_ANIME_ID_CACHE, anilistId, annId, ANN_ANIME_ID_TTL);
  return annId;
}

async function fetchSongsFromAnisongDb(
  fetchType: SongType,
  annId: number
): Promise<AnimeSong[]> {
  const response = await requestJson(`${ANISONGDB_API}/annId_request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify({
      annId: annId,
      ignore_duplicate: false,
      opening_filter: fetchType === "Opening",
      ending_filter: fetchType === "Ending",
      insert_filter: fetchType === "Insert",
    }),
  });

  type AnisongStaff = {
    id: number;
    names: string[];
    members: AnisongStaff[];
  };

  async function formatStaffs(
    anisongStaffs: AnisongStaff[]
  ): Promise<AnimeSongStaff[]> {
    const staffs = [];
    for (const anisongStaff of anisongStaffs) {
      staffs.push({
        id: anisongStaff.id,
        names: anisongStaff.names,
        members: await formatStaffs(anisongStaff.members || []),
        anilistId: await findAnilistStaff(anisongStaff.id, anisongStaff.names),
      });
    }

    return staffs;
  }

  const songs = [];
  for (const anisongSong of response) {
    songs.push({
      type: anisongSong.songType.split(" ")[0],
      index: parseInt(anisongSong.songType.split(" ")[1]) || null,
      name: anisongSong.songName,
      files: {
        audio: anisongSong.audio || null,
        mediumQuality: anisongSong.MQ || null,
        highQuality: anisongSong.HQ || null,
      },
      artists: await formatStaffs(anisongSong.artists),
      composers: await formatStaffs(anisongSong.composers),
      arrangers: await formatStaffs(anisongSong.arrangers),
      amqDifficulty: anisongSong.songDifficulty,
    });
  }

  return songs;
}

export async function fetchSongs(
  fetchType: SongType,
  anilistId: number
): Promise<AnimeSong[]> {
  const annId = await getAnnId(anilistId);
  if (annId === null) return [];

  return fetchSongsFromAnisongDb(fetchType, annId);
}
