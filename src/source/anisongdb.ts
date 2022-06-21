import { addCachedItem, getCachedItem } from "../storage/cache";
import { requestJson } from "../utils";

const ANILIST_API = "https://graphql.anilist.co";
const MAL_API = "https://api.jikan.moe/v4";
const ANISONGDB_API = "https://anisongdb.com/api";

const annIdTtl = 60 * 60 * 24;
const anilistStaffIdTtl = 60 * 60 * 24 * 7;

async function fetchMalId(anilistId: number): Promise<number | null> {
  const query = `
    query ($id: Int) {
      Media (id: $id) {
        idMal
      }
    }`;

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

async function fetchAnnidFromMal(malId: number): Promise<number | null> {
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
  const cachedAnnId = getCachedItem<number>("annId", anilistId);
  if (cachedAnnId !== null) {
    return cachedAnnId;
  }

  const malId = await fetchMalId(anilistId);
  if (malId === null) {
    return null;
  }

  const annId = await fetchAnnidFromMal(malId);
  if (annId === null) {
    return null;
  }

  addCachedItem<number>("annId", anilistId, annId, annIdTtl);
  return annId;
}

async function fetchAnilistStaffId(
  id: number,
  names: string[]
): Promise<number | null> {
  const cachedAnilistStaffId = getCachedItem<number>("anilistStaffId", id);
  if (cachedAnilistStaffId !== null) {
    return cachedAnilistStaffId;
  }

  const query = `
    query ($search: String) {
      Staff (search: $search) {
        id
      }
    }`;

  for (const name in names) {
    const variables = { search: name };
    const response = await requestJson(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: JSON.stringify({ query, variables }),
    });

    if (response.data.Staff !== undefined) {
      const anilistStaffId = response.data.Staff.id;
      addCachedItem<number>(
        "anilistStaffId",
        id,
        anilistStaffId,
        anilistStaffIdTtl
      );
      return response.data.Staff.id;
    }
  }

  return null;
}

type AnisongStaff = {
  id: number;
  names: string[];
  members: AnisongStaff[] | null;
};

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

  async function mapStaffs(
    anisongStaffs: Array<AnisongStaff>
  ): Promise<AnimeSongStaff[]> {
    const staffs = [];
    for (const anisongStaff of anisongStaffs) {
      staffs.push({
        id: anisongStaff.id,
        names: anisongStaff.names,
        members: await mapStaffs(anisongStaff.members || []),
        anilistId: await fetchAnilistStaffId(
          anisongStaff.id,
          anisongStaff.names
        ),
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
      artists: await mapStaffs(anisongSong.artists),
      composers: await mapStaffs(anisongSong.composers),
      arrangers: await mapStaffs(anisongSong.arrangers),
      amqDifficulty: anisongSong.songDifficulty,
    });
  }

  return songs;
}

export async function fetchOpeningsSongs(
  anilistId: number
): Promise<AnimeSong[]> {
  const annId = await getAnnId(anilistId);
  return await fetchSongsFromAnisongDb("Opening", annId);
}

export async function fetchInsertSongs(
  anilistId: number
): Promise<AnimeSong[]> {
  const annId = await getAnnId(anilistId);
  return await fetchSongsFromAnisongDb("Insert", annId);
}

export async function fetchEndingSongs(
  anilistId: number
): Promise<AnimeSong[]> {
  const annId = await getAnnId(anilistId);
  return await fetchSongsFromAnisongDb("Ending", annId);
}
