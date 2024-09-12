// @ts-check

import { readFileSync } from 'node:fs';

import TshetUinh, { 資料, 音韻地位 } from 'tshet-uinh';
import { 推導方案 } from 'tshet-uinh-deriver-tools';

// TODO dummy
/**
 * @param {string} _音節
 * @returns {音韻地位}
 */
// eslint-disable-next-line no-unused-vars -- dummy
function 音韻地位fromTUPA(_音節) {
  return 音韻地位.from描述('幫三C凡入');
}

function testOnData(printLimit = 30) {
  const deriveTUPA = new 推導方案(
    /** @type {import('tshet-uinh-deriver-tools').原始推導函數<string>} */ (new Function(
      'TshetUinh',
      '選項',
      '音韻地位',
      '字頭',
      readFileSync('data/tupa.js', { encoding: 'utf-8' }),
    ).bind(null, TshetUinh)),
  )();
  let runCount = 0;
  let failedCount = 0;
  console.log('Testoj per datumoj de TshetUinh.js');
  for (const 地位 of 資料.iter音韻地位()) {
    runCount += 1;
    const tupa = deriveTUPA(地位);
    let failMessage = '';
    try {
      const res = 音韻地位fromTUPA(tupa);
      if (!res.等於(地位)) {
        failMessage = `${res.描述} liverita`;
        failedCount += 1;
      }
    } catch (e) {
      failMessage = `eraro okazinta: ${e}`;
      failedCount += 1;
    }
    if (failMessage) {
      if (!printLimit || failedCount <= printLimit) {
        console.log(`  ${tupa}: ${地位.描述} atendata, ${failMessage}`);
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
  return failedCount === 0;
}

function testInvalid() {
  console.log('Testoj pri navalidaj latinigoj');

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

  let failedCount = 0;
  for (const [tupa, expected] of data) {
    try {
      const res = 音韻地位fromTUPA(tupa);
      failedCount += 1;
      console.log(`  ${tupa}: erarenda, sed ${res.描述} liverita`);
    } catch (e) {
      if (e.message.search(expected) === -1) {
        console.log(`${tupa}: erarmesaĝo ne enhavanta '${expected}':`, e);
        failedCount += 1;
      }
    }
  }
  if (failedCount) {
    const j = failedCount === 1 ? '' : 'j';
    console.log(`${failedCount}/${data.length} testo${j} malsukcesis.`);
  } else {
    console.log(`Ĉiuj ${data.length} testoj sukcesis.`);
  }
  return failedCount === 0;
}

(function main() {
  let success = true;
  success = testOnData() && success;
  console.log();
  success = testInvalid() && success;

  process.exit(success ? 0 : 1);
})();
