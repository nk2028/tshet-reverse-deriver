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
 * @returns {string | null}
 */
function expectResult(tupa, expected) {
  let failMessage = '';
  try {
    const res = 音韻地位fromTUPA(tupa);
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
  /** @type {[string, string][]} */
  const data = [
    ['taeq', '端開二麻上'],
    ['tu', '端四尤平'],
  ];
  return runTests(
    'Aldonaj datumoj',
    mapIter(data, ([tupa, 描述]) => expectResult(tupa, 音韻地位.from描述(描述))),
    0,
  )[1] === 0;
}

function testInvalid() {
  // TODO 更新
  /** @type {[string, string | RegExp][]} */
  const data = [
    ['ngiox', /【提示：上聲用 -q】/],
    ['ngioq', /【提示：用鈍介音 y\/u】/],
    ['ngyan', /【提示：元韻為 y\/uon】/],
    ['qow', /無法識別韻基.*【提示：侯韻為 ou】/],
    ['qyw', /無法識別韻基.*【提示：幽韻為 \(y\)iw】/],
    ['qai', /無法識別韻母.*【提示：切韻拼音用 -j -w 尾】/],
    ['tshryet', /無法識別聲母.*【提示：初母為 tsrh】/],
    ['cyang', /【提示：精母為 ts、章母為 tj】/],
    ['kyung', /不合法介音搭配.*【提示：三等 u 不需介音】/],
    ['pwan', /不合法脣音拼寫開合/],
    ['tryin', /莊組以外銳音聲母不可配B類/],
    ['wuo', /無法識別聲母.*【提示：云母不寫】/],
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
