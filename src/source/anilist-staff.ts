import { addCachedItem, getCachedItem } from "../storage/cache";
import { requestJson } from "../utils";

const ANILIST_API = "https://graphql.anilist.co";

const anilistStaffIdTtl = 60 * 60 * 24 * 7;

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

  const query = `
      query ($search: String) {
        Staff (search: $search) {
          id
        }
      }`;

  for (const name of names) {
    const variables = { search: name };
    const response = await requestJson(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: JSON.stringify({ query, variables }),
    });

    if (response.data.Staff !== null) {
      const anilistStaffId = response.data.Staff.id;
      addCachedItem<number | null>(
        "anilistStaffId",
        id,
        anilistStaffId,
        anilistStaffIdTtl
      );
      return response.data.Staff.id;
    }
  }

  addCachedItem<number | null>("anilistStaffId", id, null, anilistStaffIdTtl);
}
