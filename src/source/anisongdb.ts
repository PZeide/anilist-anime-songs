import {
  addCachedItem,
  ANN_ANIME_ID_CACHE,
  getCachedItem,
} from "../storage/cache";
import { getMappings } from "../storage/mappings";
import { rawRequest, requestJson } from "../network";
import { findAnilistStaff } from "./anilist-staff";

const ANILIST_API = "https://graphql.anilist.co";
const MAL_API = "https://api.jikan.moe/v4";
const MAL_ANIME = "https://myanimelist.net/anime";
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
  const response = await rawRequest(`${MAL_ANIME}/${malId}`);
  if (response.status !== 200) return null;

  const html = response.responseText;
  const annId = html.match(/encyclopedia\/anime\.php\?id=(\d+)/);

  if (annId === null || annId[1] === undefined) return null;

  return parseInt(annId[1]);
}

async function fetchAnnIdFromMalKillMe(malId: number): Promise<number | null> {
  // Thanks Jikan for breaking this
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

export async function fetchAnnId(anilistId: number): Promise<number | null> {
  const mappings = await getMappings();
  if (mappings.annIds[anilistId] !== undefined)
    return mappings.annIds[anilistId];

  const cachedAnnId = getCachedItem<number>(ANN_ANIME_ID_CACHE, anilistId);
  if (cachedAnnId !== undefined) return cachedAnnId;

  const malId = await fetchMalId(anilistId);
  if (malId === null) return null;

  // Now scraping MAL site because Jikan is broken
  const annId = await fetchAnnIdFromMal(malId);
  if (annId === null) return null;

  addCachedItem<number>(ANN_ANIME_ID_CACHE, anilistId, annId, ANN_ANIME_ID_TTL);
  return annId;
}

export async function fetchSongs(
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
      try {
        staffs.push({
          id: anisongStaff.id,
          names: anisongStaff.names,
          members: await formatStaffs(anisongStaff.members || []),
          anilistId: await findAnilistStaff(
            anisongStaff.id,
            anisongStaff.names
          ),
        });
      } catch (e) {
        if (
          e.message === "Too many requests" ||
          e.message === "Staff search request limit reached"
        ) {
          console.warn(
            `Skipped staff ${anisongStaff.names[0]} due to rate limit.`
          );
          staffs.push({
            id: anisongStaff.id,
            names: anisongStaff.names,
            members: await formatStaffs(anisongStaff.members || []),
            anilistId: null,
            rateLimited: true,
          });

          continue;
        }

        throw e;
      }
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
