declare interface AnimeSong {
  type: "Opening" | "Insert" | "Ending";
  // index is null only for insert songs
  index: number | null;
  name: string;
  files: AnimeSongFiles;
  artists: AnimeSongStaff[];
  composers: AnimeSongStaff[];
  arrangers: AnimeSongStaff[];
  amqDifficulty: number;
}

declare interface AnimeSongFiles {
  audio: string | null;
  mediumQuality: string | null;
  highQuality: string | null;
}

declare interface AnimeSongStaff {
  id: number;
  names: string[];
  members: AnimeSongStaff[];
  anilistId: number | null;
}
