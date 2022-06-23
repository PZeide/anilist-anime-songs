import { addCachedItem, getCachedItem } from "../storage/cache";
import { requestJson } from "../utils";

const ANILIST_API = "https://graphql.anilist.co";

const anilistStaffIdTtl = 60 * 60 * 24 * 7;

async function searchWithNames(names: string[], page: number = 1): Promise<number | null> {
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
    search: names[0],
  };

  const response = await requestJson(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify({ query, variables }),
  });

  if (response.data.Page === undefined)
    return null;

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
    return searchWithNames(names, page + 1);
  } else {
    return null;
  }
}

export async function findAnilistStaff(
  id: number,
  names: string[]
): Promise<number | null> {
  const cachedAnilistStaffId = getCachedItem<number | null>(
    "anilistStaffId",
    id
  );
  if (cachedAnilistStaffId !== undefined) {
    return cachedAnilistStaffId;
  }

  const anilistStaffId = await searchWithNames(names);
  addCachedItem<number | null>("anilistStaffId", id, anilistStaffId, anilistStaffIdTtl);
  return anilistStaffId;
}
