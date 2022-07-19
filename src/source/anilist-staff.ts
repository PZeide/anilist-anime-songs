import {
  addCachedItem,
  ANILIST_STAFF_ID_CACHE,
  getCachedItem,
} from "../storage/cache";
import { requestJson } from "../utils";

const ANILIST_API = "https://graphql.anilist.co";

const STAFF_MAPPINGS_STORAGE = "remote-staff-mappings";
const STAFF_MAPPINGS_URL = "https://api.npoint.io/2fc4a7889361b8edb8be/staffs";

const ANILIST_STAFF_ID_TTL = 60 * 60 * 24 * 7;
const ANILIST_STAFF_NULL_ID_TTL = 60 * 60 * 24 * 2;

type StorageMappings = {
  updatedAt: number;
  mappings: Record<number, number | null> | null;
};

async function fetchArtistsMappings(): Promise<{ [key: number]: number }> {
  return await requestJson(STAFF_MAPPINGS_URL);
}

async function getStaffFromMappings(id: number): Promise<number | null> {
  const storageMappings = GM_getValue(STAFF_MAPPINGS_STORAGE) as
    | StorageMappings
    | undefined;
  if (storageMappings === undefined) {
    const mappings = await fetchArtistsMappings();
    GM_setValue(STAFF_MAPPINGS_STORAGE, {
      updatedAt: Date.now(),
      mappings: mappings,
    });
    return mappings[id] || null;
  }

  if (storageMappings.updatedAt < Date.now() - 30 * 60 * 1000) {
    const mappings = await fetchArtistsMappings();
    GM_setValue(STAFF_MAPPINGS_STORAGE, {
      updatedAt: Date.now(),
      mappings: mappings,
    });
    return mappings[id] || null;
  }

  return storageMappings.mappings[id] || null;
}

async function searchWithNames(
  searchName: string,
  names: string[],
  page = 1
): Promise<number | null> {
  const query = `
    query($page: Int, $search: String){
      Page(page: $page, perPage: 50){
        pageInfo {
          hasNextPage
        }
        
        staff(search: $search){
          id 
          name { 
            full 
            alternative
          }
        }
      }
    }
  `;

  const variables = {
    page: page,
    search: searchName,
  };

  const response = await requestJson(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify({ query, variables }),
  });

  if (response.data.Page === undefined) return null;

  const caseInsensitiveNames = names.map((name) => name.toLowerCase());
  for (const staff of response.data.Page.staff) {
    // Check if any of the names match the full name
    if (caseInsensitiveNames.includes(staff.name.full.toLowerCase())) {
      return staff.id;
    }

    // Check if any of the names match an alternative name
    for (const alternative of staff.name.alternative) {
      if (caseInsensitiveNames.includes(alternative.toLowerCase())) {
        return staff.id;
      }
    }
  }

  if (response.data.Page.pageInfo.hasNextPage) {
    return searchWithNames(searchName, names, page + 1);
  } else {
    return null;
  }
}

export async function findAnilistStaff(
  id: number,
  names: string[]
): Promise<number | null> {
  const mappingsArtist = await getStaffFromMappings(id);
  if (mappingsArtist !== null) return mappingsArtist;

  const cachedAnilistStaffId = getCachedItem<number | null>(
    ANILIST_STAFF_ID_CACHE,
    id
  );
  if (cachedAnilistStaffId !== undefined) return cachedAnilistStaffId;

  for (const name of names) {
    console.log("Searching for staff with name", name);
    const anilistStaffId = await searchWithNames(name, names);
    if (anilistStaffId !== null) {
      addCachedItem<number | null>(
        ANILIST_STAFF_ID_CACHE,
        id,
        anilistStaffId,
        ANILIST_STAFF_ID_TTL
      );

      return anilistStaffId;
    }
  }

  addCachedItem<number | null>(
    ANILIST_STAFF_ID_CACHE,
    id,
    null,
    ANILIST_STAFF_NULL_ID_TTL
  );
  return null;
}
