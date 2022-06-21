export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function request(
  url: string,
  options: Partial<Tampermonkey.Request> = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: url,
      onabort: () => reject(new Error("The request has been aborted.")),
      onerror: (error) => reject(error),
      ontimeout: () => reject(new Error("The request timed out.")),
      onload: (response) => resolve(response.responseText),
      ...options,
    });
  });
}

export async function requestJson(
  url: string,
  options: Partial<Tampermonkey.Request> = {}
): Promise<any> {
  return JSON.parse(await request(url, options));
}

export function joinSentence(list: string[]): string {
  if (list.length < 3) return list.join(" and ");
  return `${list.slice(0, -1).join(", ")} and ${list.slice(-1)}`;
}

const emojis = [
  "ʕ•ᴥ•ʔ",
  "(≧∇≦)/",
  "ヘ（。□°）ヘ",
  "(ﾟ⊿ﾟ)",
  "( ◞･౪･)",
  "Ｏ(≧∇≦)Ｏ",
  "(ノ・∀・)ノ",
  "(^・ω・^ )",
  "₍•͈ᴗ•͈₎",
  "(・◇・)",
  "〜(￣▽￣〜)",
  "⊙▽⊙",
  "( ≧Д≦)",
  "｡ﾟ･（>﹏<）･ﾟ｡",
  "(つ﹏<)･ﾟ｡",
  "ヽ(ﾟДﾟ)ﾉ",
  "(ﾉ*ФωФ)ﾉ",
  "ヽ( ★ω★)ノ",
  "ヽ༼>ل͜<༽ﾉ",
  "｢(ﾟﾍﾟ)",
  "(⊙﹏⊙✿)",
  "(๑•́ ω •̀๑)",
  "(￣ω￣)",
  "(*ﾟﾛﾟ)",
  "（○□○）",
  "(。･o･｡)",
  "(ﾉﾟ0ﾟ)ﾉ~",
  "ヘ(^0^)ヘ",
];

export function randomAnilistEmoji(): string {
  return emojis[Math.floor(Math.random() * emojis.length)];
}
