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
      onload: (response) => {
        if (response.status === 429) {
          reject(new Error("Too many requests !"));
          return;
        }

        resolve(response.responseText);
      },
      ...options,
    });
  });
}

export async function requestJson(
  url: string,
  options: Partial<Tampermonkey.Request> = {}
): Promise<any> {
  const response = await request(url, options);
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${response}`);
  }
}

export function populateSentece(items: any[]): (any & string)[] {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    result.push(items[i]);
    if (i < items.length - 2) {
      result.push(", ");
    } else if (i === items.length - 2) {
      result.push(" and ");
    }
  }
  return result;
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
