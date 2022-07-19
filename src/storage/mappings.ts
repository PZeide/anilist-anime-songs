import { requestJson } from "../utils";

const MAPPINGS_STORAGE = "remote-mappings";
const MAPPINGS_URL = "https://anilist-anime-songs-mappings-default-rtdb.europe-west1.firebasedatabase.app/.json";
const MAPPINGS_TTL = 30 * 60 * 1000;

type RemoteMappings = {
  updatedAt: number;
  annIds: Record<number, number | null>;
  staffs: Record<number, number | null>;
};

async function fetchMappings(): Promise<RemoteMappings> {
  console.log("Fetching remote mappings !")
  try {
    return {
      updatedAt: Date.now(),
      ...(await requestJson(MAPPINGS_URL)),
    };
  } catch (e) {
    return {
      updatedAt: -1,
      annIds: {},
      staffs: {},
    };
  }
}

export async function getMappings(): Promise<RemoteMappings> {
  const storageMappings = GM_getValue(MAPPINGS_STORAGE) as RemoteMappings;
  if (
    storageMappings === undefined ||
    storageMappings.updatedAt < Date.now() - MAPPINGS_TTL
  ) {
    const mappings = await fetchMappings();
    GM_setValue(MAPPINGS_STORAGE, mappings);
    return mappings;
  }

  return storageMappings;
}
