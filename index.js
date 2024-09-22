// @ts-check

const TshetUinh = require('tshet-uinh');
const { 音韻地位 } = TshetUinh;

/** @typedef {TshetUinh.音韻地位} 音韻地位 */

module.exports = 音韻地位fromTUPA;

/**
 * @param {string} 音節
 * @param {TshetUinh.邊緣地位種類指定=} 邊緣地位種類
 * @returns {音韻地位}
 */
function 音韻地位fromTUPA(音節, 邊緣地位種類) {
  音節 = 音節.toLowerCase();

  let [母, 元音, 韻尾, 聲] = split音節(音節);

  if (母 === '云' && /^wy.|^wu/.test(元音)) {
    throw new Error(`無法識別元音 ${元音} (${音節})【提示：云母不寫】`);
  }
  let [韻基元音, 呼, 等類] = parse元音(元音, 韻尾, 音節);

  // 拼寫搭配檢查
  // 脣音
  if ([...'幫滂並明'].includes(母)) {
    if (韻基元音 === 'o') {
      if (元音 === 'weo') {
        throw new Error(`脣音不拼 weo 形式 (${音節})【提示：用開口形式】`);
      } else if (呼 === '開' && 韻尾 !== 'ng') {
        throw new Error(`脣音除 -ng(k) 尾外不拼 ${元音} 形式 (${音節})【提示：用合口形式】`);
      }
    } else if (韻基元音 === 'a' && 等類 === 'C') {
      if (呼 === '開') {
        throw new Error(`脣音不拼 ${元音} 形式 (${音節})【提示：用合口形式】`);
      }
    } else if (韻基元音 !== 'u') {
      if (呼 === '合') {
        throw new Error(`脣音不拼 ${元音} 形式 (${音節})【提示：用開口形式】`);
      }
    }
  }
  // 銳音
  if (![...'幫滂並明見溪羣疑影曉匣云'].includes(母)) {
    if (等類 === '四' && 韻基元音 === 'i' && [...'端透定泥'].includes(母)) {
      const 提示 = 韻尾 === '' ? '脂韻用原形式 (w)i，齊韻用 (w)ej' : '用原形式 (w)i';
      throw new Error(`端組聲母不拼 (w)ei 形式 (${音節})【提示：${提示}】`);
    }
    if ((等類 === 'A' || 等類 === 'B') && !['i', 'e', 'ee', 'ae'].includes(韻基元音)) {
      throw new Error(`銳音聲母不拼 ${元音} 形式 (${音節})【提示：用C類形式】`);
    }
    const is莊組 = [...'莊初崇生俟'].includes(母);
    if (等類 === 'A' && is莊組) {
      throw new Error(`莊組聲母應拼B類拼寫形式 (${音節})`);
    } else if (等類 === 'B' && !is莊組) {
      throw new Error(`莊組以外銳音聲母不拼B類拼寫形式 (${音節})`);
    }
  }

  // 呼由拼寫形式調整為實際音韻地位（暫不考慮脣音）
  if ((元音 === 'o' && (韻尾 === 'w' || 韻尾 === 'm'))) {
    呼 = '開';
  } else if ((元音 === 'uo' && 韻尾 === 'ng') || (['u', 'ou', 'o'].includes(元音) && (韻尾 === '' || 韻尾 === 'ng'))) {
    呼 = null;
  }

  // 依韻基、等類、呼確定韻
  let 韻 = {
    i: '脂蒸　真幽侵',
    y: '之蒸微殷　　',
    u: '尤東微文　　',
    e: '支青祭仙宵鹽',
    o: '魚鍾廢元　嚴',
    ee: '佳耕皆山　咸',
    oeu: '　江　　　　',
    ae: '麻庚夬刪肴銜',
    a: '歌陽泰寒豪談',
  }[韻基元音][['', 'ng', 'j', 'n', 'w', 'm'].indexOf(韻尾)];
  if (韻 === '　') {
    let 提示 = '';
    if (韻尾 === 'w') {
      if (韻基元音 === 'o') {
        提示 = '豪韻用 aw，侯韻用 ou';
      } else if (韻基元音 === 'y') {
        提示 = '尤韻用 u，幽韻用 (y)iw';
      } else if (韻基元音 === 'u') {
        提示 = '尤韻用 u';
      }
    } else if (韻尾 === 'j') {
      if (韻基元音 === 'i') {
        提示 = '脂韻用 i';
      }
    }
    if (提示) {
      提示 = `【提示：${提示}】`;
    }
    throw new Error(`無法識別韻基 ${韻基元音}${韻尾} (${音節})${提示}`);
  }

  if (呼 !== null && 韻 === '鍾') {
    韻 = '登';
  }
  if (等類 === '一' || 等類 == '四') {
    韻 = {
      尤: '侯',
      祭: '齊',
      仙: '先',
      宵: '蕭',
      鹽: '添',
      魚: '模',
      鍾: '冬',
      廢: '咍',
      元: '痕',
      嚴: '覃',
      陽: '唐',
    }[韻] ?? 韻;
  }
  if (呼 === '合') {
    韻 = { 魚: '虞', 咍: '灰', 痕: '魂', 嚴: '凡' }[韻] ?? 韻;
  }
  if (韻 === '庚' && 等類 === 'A') {
    韻 = '清';
  } else if (韻 === '真' && 呼 === '開' && [...'莊初崇生俟'].includes(母)) {
    韻 = '臻';
  }

  // 呼、等、類由拼寫形式調整為實際音韻地位
  /** @type {string} */
  let 等;
  /** @type {string | null} */
  let 類;
  if ([...'ABC'].includes(等類)) {
    等 = '三';
    類 = 等類;
  } else {
    等 = 等類;
    類 = null;
  }
  if ([...'幫滂並明'].includes(母)) {
    呼 = null;
  } else if (![...'幫滂並明見溪羣疑影曉匣云'].includes(母)) {
    類 = null;
    if ([...'端透定泥'].includes(母) && 等 === '三') {
      等 = '四';
    }
  }

  try {
    return new 音韻地位(母, 呼, 等, 類, 韻, 聲, 邊緣地位種類);
  } catch (e) {
    const 描述 = `${母}${呼 ?? ''}${等}${類 ?? ''}${韻}${聲}`;
    const 提示 = [];
    if ((類 === 'A' || 類 === 'B') && !['i', 'e', 'ee', 'ae'].includes(韻基元音)) {
      提示.push('用C類');
    }
    if (等 !== '一' && [...'泰寒談'].includes(韻)) {
      const [提示韻, 提示拼寫] = 韻 === '談' && [...'幫滂並明'].includes(母)
        ? ['凡', 'uom']
        : { 泰: ['廢', 'y/uoj'], 寒: ['元', 'y/uon'], 談: ['嚴', 'yom'] }[韻];
      提示.push(`${提示韻}韻用 ${提示拼寫}`);
    }
    if (等 === '四' && 韻 === '脂' && ![...'端透定泥'].includes(母)) {
      提示.push(`齊韻用 (w)ej`);
    }
    const 所有提示 = 提示.length ? `【提示：${提示.join('；')}】` : '';
    throw new Error(`音韻地位「${描述}」不合法 (${音節}): ${e.message}${所有提示}`);
  }
}

/** @type {Record<string, string>} */
// dprint-ignore
const 聲母表 = {
  p:   '幫', ph:   '滂', b:   '並', m:  '明',
  t:   '端', th:   '透', d:   '定', n:  '泥', l: '來',
  tr:  '知', trh:  '徹', dr:  '澄', nr: '孃',
  k:   '見', kh:   '溪', g:   '羣', ng: '疑',
  q:   '影', h:    '曉', gh:  '匣',
  ts:  '精', tsh:  '清', dz:  '從', s:  '心', z: '邪',
  tsr: '莊', tsrh: '初', dzr: '崇', sr: '生', zr: '俟',
  tj:  '章', tjh:  '昌', dj:  '常', sj: '書', zj: '船', nj: '日', j: '以',
};

/** @type {Record<string, string | string[]>} */
const 聲母糾正表 = {
  // h 應置後
  thr: 'trh',
  tshr: 'tsrh',
  thj: 'tjh',
  // 章組
  tsj: 'tj',
  tsjh: 'tjh',
  tshj: 'tjh',
  dzj: 'dj',
  // 其他
  x: ['h', 'gh'],
  c: ['ts', 'tj'],
  ch: ['tsh', 'tjh'],
  sh: 'sj',
  zh: 'zj',
};

/**
 * @param {string} 音節
 * @returns {[string, string, string, string]}
 * - 母（名稱）
 * - 元音（拼寫、未驗證）
 * - 韻尾（拼寫、入聲歸舒聲）
 * - 聲（名稱）
 */
function split音節(音節) {
  const match = /w?[aeiouy]+/.exec(音節);
  if (!match) {
    throw new Error('無法識別音節結構');
  }

  const 元音 = match[0];

  const 母拼寫 = 音節.slice(0, match.index);
  const 母 = !母拼寫 ? '云' : 聲母表[母拼寫];
  if (!母) {
    let 提示 = '';
    /** @type {string | string[]} */
    let 糾正 = 聲母糾正表[母拼寫];
    if (糾正) {
      if (!Array.isArray(糾正)) {
        糾正 = [糾正];
      }
      提示 = 糾正
        .map((x) => `${聲母表[x]}母為 ${x}`)
        .join('，');
    }
    if (提示) {
      提示 = `【提示：${提示}】`;
    }
    throw new Error(`無法識別聲母 ${母拼寫} (${音節})${提示}`);
  }

  let 韻尾 = 音節.slice(match.index + 元音.length);
  /** @type {string} */
  let 聲;
  let match尾調;
  if (['k', 't', 'p'].includes(韻尾)) {
    聲 = '入';
    韻尾 = { k: 'ng', t: 'n', p: 'm' }[韻尾];
  } else if ((match尾調 = /^((?:ng|[jnwm])?)([qh]?)$/.exec(韻尾))) {
    聲 = { '': '平', q: '上', h: '去' }[match尾調[2]];
    韻尾 = match尾調[1];
  } else if (韻尾.endsWith('x')) {
    throw new Error(
      `無法識別聲調 -x (${音節})` + `【提示：上聲用 -q】`,
    );
  } else {
    throw new Error(`無法識別韻尾/聲調 -${韻尾} (${音節})`);
  }

  return [母, 元音, 韻尾, 聲];
}

/**
 * @param {string} 元音
 * @param {string} 韻尾
 * @param {string} 音節
 * @returns {[string, string | null, string]} 韻基元音、呼、等類（呼與等類均為拼寫形式上的，僅 oeu 在此階段為開合中立）
 */
function parse元音(元音, 韻尾, 音節) {
  if (元音 === 'oi') {
    throw new Error(`元音 oi 已棄用 (${音節})【提示：用 oy】`);
  }
  const 常用指示 = ['w', 'i', 'wi', 'y', 'u'];
  for (
    const [韻基元音, 預設呼等類, 指示搭配] of /** @type {[string, [string | null, string], string[]][]}*/ ([
      ['oeu', [null, '二'], []],
      ['ee', ['開', '二'], 常用指示], // 除 w- 外餘皆非合法地位
      ['ae', ['開', '二'], 常用指示],
      ['i', ['開', 'A'], ['w', 'y', 'u', 'e', 'we']],
      ['y', ['開', 'C'], ['w', 'o']], // wy 限 -∅/-ng；oy 見於「怎」tsoymq，可解析，但 TshetUinh.js 並不支援
      ['u', ['合', 'C'], ['o', 'i', 'y']], // iu、yu 分別解析為 A、B 類，均非合法地位
      ['e', ['開', '四'], 常用指示],
      ['o', ['合', '一'], ['e', 'we', ...常用指示.slice(1)]], // eo 限非 -w/-m；weo 限 -∅/-ng
      ['a', ['開', '一'], 常用指示],
    ])
  ) {
    if (!元音.endsWith(韻基元音)) {
      continue;
    }

    const 指示 = 元音.slice(0, -韻基元音.length);
    if (!指示) {
      return [韻基元音, ...預設呼等類];
    }
    if (!指示搭配.includes(指示)) {
      const 提示 = 韻尾 === '' && (韻基元音 === 'i' || 韻基元音 === 'u') && /[aeiouy]$/.test(指示)
        ? `【提示：切韻拼音用 -j -w 尾】`
        : '';
      throw new Error(`無法識別元音 ${元音} (${音節})${提示}`);
    }

    let [呼, 等類] = 預設呼等類;
    if (指示 === 'i' || 指示 === 'wi') {
      等類 = 'A';
      呼 = 指示 === 'i' ? '開' : '合';
    } else if (指示 === 'y' || 指示 === 'u') {
      等類 = 預設呼等類[1] === '一' ? 'C' : 'B';
      呼 = 指示 === 'y' ? '開' : '合';
    } else if (指示 === 'w') {
      if (韻基元音 === 'y' && !(韻尾 === '' || 韻尾 === 'ng')) {
        throw new Error(`元音 wy 僅可用於無尾或 -ng(k) 尾 (${音節})`);
      }
      呼 = '合';
    } else if (指示 === 'e' || 指示 === 'we') {
      if (韻基元音 === 'o') {
        if (指示 === 'e' && (韻尾 === 'w' || 韻尾 === 'm')) {
          throw new Error(`元音 eo 不用於 -w/-m(p) 尾 (${音節})【提示：用 o】`);
        } else if (指示 === 'we' && 韻尾 !== 'ng') {
          throw new Error(`元音 weo 僅可用於 -ng(k) 尾 (${音節})`);
        }
      } else if (韻基元音 === 'i') {
        等類 = '四';
      }
      呼 = 指示 === 'e' ? '開' : '合';
    } else if (指示 === 'o') {
      等類 = '一';
    } else {
      throw new Error(`interna eraro: literumo ne traktita: ${指示}-${韻基元音}`);
    }

    return [韻基元音, 呼, 等類];
  }
  throw new Error(`無法識別元音 ${元音} (${音節})`);
}
