/*--------------------------------------------------------------------------

スクリプト：立ち絵書き換え

■概要
　イベントコマンドで「スクリプトの実行 > コード実行」を指定し、以下のように記述してください。
　さらに，「オリジナルデータ」タブで，立ち絵を書き換えるユニットを設定してください。
------------
var categoryName = '目'; 
var picName = 'ウインク.png';
setCharaIllustMaterialPic(categoryName, picName);
------------

■バージョン履歴
　2023/01/19  新規作成

■対応バージョン
　SRPG Studio Version:1.267

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

var setCharaIllustMaterialPic = function(categoryName, picName) {
	var unit = root.getEventCommandObject().getOriginalContent().getUnit();

	if (unit.custom.charaIndexArr) {
		var categoryIndex = CHARACTER_CREATE_MATERIAL_ARRAY.indexOf(categoryName);
		var count = root.getMaterialManager().getMaterialCount(categoryName);
		for (var i = 0; i < count; i++) {
			var name = root.getMaterialManager().getMaterialName(i, categoryName);

			if (name === picName) {
				unit.custom.charaIndexArr[categoryIndex] = i;
			}
		}
	}
}
