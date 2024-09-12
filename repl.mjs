// 啟動 REPL 並自動 import

import { start as startRepl } from 'node:repl';

import TshetUinh from 'tshet-uinh';

import 音韻地位fromTUPA from './index.mjs';

const repl = startRepl();
repl.context.音韻地位fromTUPA = 音韻地位fromTUPA;
repl.context.fromTUPA = 音韻地位fromTUPA;
repl.context.TshetUinh = TshetUinh;
