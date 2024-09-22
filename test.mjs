// @ts-check

import { readFileSync } from 'node:fs';

import TshetUinh, { 音韻地位 } from 'tshet-uinh';
import { 推導方案 } from 'tshet-uinh-deriver-tools';

import 音韻地位fromTUPA from './index.mjs';

/**
 * @template T, U
 * @param {Iterable<T>} iter
 * @param {(x: T) => U} f
 * @returns {Iterable<U>}
 */
function* mapIter(iter, f) {
  for (const x of iter) {
    yield f(x);
  }
}

/**
 * @param {string} title
 * @param {Iterable<string | null>} testCases
 * @param {number} printLimit
 * @returns {[number, number]}
 */
function runTests(title, testCases, printLimit = 30) {
  console.log(`Testo: ${title}`);

  let runCount = 0;
  let failedCount = 0;
  for (const failMessage of testCases) {
    runCount += 1;
    if (failMessage) {
      failedCount += 1;
      if (!printLimit || failedCount <= printLimit) {
        console.log('  ' + failMessage);
      } else if (failedCount === printLimit + 1) {
        console.log('  (... kaj tiel plu)');
      }
    }
  }

  if (failedCount) {
    const j = failedCount === 1 ? '' : 'j';
    console.log(`${failedCount}/${runCount} testo${j} malsukcesis.`);
  } else {
    console.log(`Ĉiuj ${runCount} testoj sukcesis.`);
  }
  return [runCount, failedCount];
}

/**
 * @param {string} tupa
 * @param {音韻地位} expected
 * @param {TshetUinh.邊緣地位種類指定=} marginalTypes
 * @returns {string | null}
 */
function expectResult(tupa, expected, marginalTypes) {
  let failMessage = '';
  try {
    const res = 音韻地位fromTUPA(tupa, marginalTypes);
    if (!expected.等於(res)) {
      failMessage = `${res} liverita`;
    }
  } catch (e) {
    failMessage = `eraro okazinta: ${e}`;
  }
  return failMessage ? `${tupa}: ${expected} atendata, ${failMessage}` : null;
}

/**
 * @param {string} tupa
 * @param {string | RegExp} expected
 * @returns {string | null}
 */
function expectError(tupa, expected) {
  try {
    const res = 音韻地位fromTUPA(tupa);
    return `${tupa}: erarenda, sed ${res.描述} liverita`;
  } catch (e) {
    if (e.message.search(expected) === -1) {
      return `${tupa}: erarmesaĝo ne enhavanta '${expected}': ${e}`;
    }
    return null;
  }
}

function testOnData() {
  const deriveTUPA = new 推導方案(
    /** @type {import('tshet-uinh-deriver-tools').原始推導函數<string>} */ (new Function(
      'TshetUinh',
      '選項',
      '音韻地位',
      '字頭',
      readFileSync('data/tupa.js', { encoding: 'utf-8' }),
    ).bind(null, TshetUinh)),
  )();
  return runTests(
    'Datumoj de TshetUinh.js',
    mapIter(TshetUinh.資料.iter音韻地位(), (地位) => expectResult(deriveTUPA(地位), 地位)),
  )[1] === 0;
}

function testSupplement() {
  /** @type {[string, string, string[]][]} */
  const data = [
    ['taeq', '端開二麻上', []],
    ['tu', '端四尤平', []],
    ['pyng', '幫三C蒸平', []],
  ];
  return runTests(
    'Aldonaj datumoj',
    mapIter(
      data,
      ([tupa, 描述, 邊緣地位種類]) => expectResult(tupa, 音韻地位.from描述(描述, false, 邊緣地位種類), 邊緣地位種類),
    ),
    0,
  )[1] === 0;
}

function testInvalid() {
  /** @type {[string, string | RegExp][]} */
  const data = [
    ['ngiox', /無法識別聲調.*【提示：上聲用 -q】/],
    ['ngioq', /音韻地位「疑開三A魚上」不合法.*【提示：用C類】/],
    ['ngyan', /韻地位「疑開三C寒平」不合法.*【提示：元韻用 y\/uon】/],
    ['qow', /無法識別韻基.*【提示：豪韻用 aw，侯韻用 ou】/],
    ['qyw', /無法識別韻基.*【提示：尤韻用 u，幽韻用 \(y\)iw】/],
    ['qai', /無法識別元音.*【提示：切韻拼音用 -j -w 尾】/],
    ['tshryet', /無法識別聲母.*【提示：初母為 tsrh】/],
    ['cyang', /【提示：精母為 ts，章母為 tj】/],
    ['kyung', /音韻地位「見開三B東平」不合法.*【提示：用C類】/],
    ['pwan', /脣音不拼.*【提示：用開口形式】/],
    ['tryin', /莊組以外銳音聲母不拼B類拼寫形式/],
    ['wuo', /無法識別元音.*【提示：云母不寫】/],
    ['puotq', /無法識別韻尾\/聲調 -tq/],
    ['kwyn', /元音 wy 僅可用於無尾或 -ng\(k\) 尾/],
    ['kweon', /元音 weo 僅可用於 -ng\(k\) 尾/],
    ['deih', /端組聲母不拼 \(w\)ei 形式.*【提示：脂韻用原形式 \(w\)i，齊韻用 \(w\)ej】/],
    ['kei', /音韻地位「見開四脂平」不合法.*【提示：齊韻用 \(w\)ej】/],
    ['hing', /音韻地位「曉開三A蒸平」不合法/],
    ['trio', /銳音聲母不拼 io 形式.*【提示：用C類形式】/],
  ];

  return runTests(
    'nevalidaj latinigoj',
    mapIter(data, ([tupa, expected]) => expectError(tupa, expected)),
    0,
  )[1] === 0;
}

(function main() {
  let success = true;
  const suites = [testOnData, testSupplement, testInvalid];
  let first = true;
  for (const suite of suites) {
    if (first) {
      first = false;
    } else {
      console.log();
    }
    success = suite() && success;
  }

  process.exit(success ? 0 : 1);
})();
