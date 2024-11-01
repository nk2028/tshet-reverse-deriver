# 切韻拼音解析器

將切韻拼音解析為音韻地位，並可檢查拼寫合法與否。

## 用法

```javascript
import 音韻地位fromTUPA from 'tupa-parser';

let 地位 = 音韻地位fromTUPA('tshet');
地位.描述; // => 清開四先入

音韻地位fromTUPA('uinh').描述; // => 云合三B真去

音韻地位fromTUPA('ngyoq').描述; // => 疑開三C魚上
音韻地位fromTUPA('ngiox').描述; // Error: 無法識別聲調 x (ngiox)【提示：上聲用 -q】
音韻地位fromTUPA('ngioq').描述; // Error: 音韻地位「疑開三A魚上」不合法 (ngioq):
                                //   invalid 音韻地位 <疑,開,三,A,魚,上>: unexpected 魚韻A類
                                //   【提示：用C類】

音韻地位fromTUPA('ngyon').描述; // => 疑開三C元平
音韻地位fromTUPA('ngian').描述; // Error: 音韻地位「疑開三A寒平」不合法 (ngian):
                                //   invalid 音韻地位 <疑,開,三,A,寒,平>: unexpected 寒韻三等
                                //   【提示：用C類；元韻用 y/uon】
音韻地位fromTUPA('ngyan').描述; // Error: 音韻地位「疑開三C寒平」不合法 (ngyan):
                                //   invalid 音韻地位 <疑,開,三,C,寒,平>: unexpected 寒韻三等
                                //   【提示：元韻用 y/uon】
```
