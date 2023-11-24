// ==UserScript==
// @name        Anilist Anime Songs
// @namespace   https://github.com/PZeide/anilist-anime-songs
// @description A script to add songs information and files on anilist.co
// @match       https://anilist.co/*
// @grant       GM_addStyle
// @version     process.env.VERSION
// @author      process.env.AUTHOR
// @connect     graphql.anilist.co
// @connect     api.jikan.moe
// @connect     myanimelist.net
// @connect     anilist-anime-songs-mappings-default-rtdb.europe-west1.firebasedatabase.app
// @connect     anisongdb.com
// @connect     maker.ifttt.com
// @updateURL   https://github.com/PZeide/anilist-anime-songs/releases/latest/download/anilist-anime-songs.user.js
// @downloadURL https://github.com/PZeide/anilist-anime-songs/releases/latest/download/anilist-anime-songs.user.js
// @supportURL  https://github.com/PZeide/anilist-anime-songs/issues
// @require     https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom@2,npm/@violentmonkey/ui@0.7
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2/dist/solid.js
// ==/UserScript==

/**
 * Code here will be ignored on compilation. So it's a good place to leave messages to developers here.
 *
 * - The `@grant`s used in your source code will be added automatically by `rollup-plugin-userscript`.
 *   However you have to add explicitly those used in required resources.
 * - `process.env.VERSION` and `process.env.AUTHOR` will be loaded from `package.json`.
 */
