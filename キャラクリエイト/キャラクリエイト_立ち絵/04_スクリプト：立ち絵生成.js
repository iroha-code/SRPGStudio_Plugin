/*--------------------------------------------------------------------------

スクリプト：立ち絵生成

■概要
　イベントコマンドで「スクリプトの実行 > コード実行」を指定し、以下のように記述してください。
　さらに，「オリジナルデータ」タブで，立ち絵を書き換えるユニットを設定してください。
------------
例) 立ち絵を構成するデータが以下のようになっている場合
var CHARACTER_CREATE_MATERIAL_ARRAY = [
	'目',
	'口',
	'本体',
	'後髪'
];

// 「コード実行」に記載する内容
var picName1 = 'ウインク.png';
var picName2 = 'にっこり.png';
var picName3 = '肌色.png'
var picName4 = '後ろ髪';
var picNameArr = [picName1, picName2, picName3, picName4];
setCharaIllustMaterialPicArr(picNameArr);
------------

■バージョン履歴
　2023/01/23  新規作成

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

var setCharaIllustMaterialPicArr = function(picNameArr) {
	var unit = root.getEventCommandObject().getOriginalContent().getUnit();
	var charaIndexArr = [];
	for (var j = 0; j < picNameArr.length; j++) {
		var picName = picNameArr[j];
		var categoryName = CHARACTER_CREATE_MATERIAL_ARRAY[j];
		var count = root.getMaterialManager().getMaterialCount(categoryName);
		for (var i = 0; i < count; i++) {
			var name = root.getMaterialManager().getMaterialName(i, categoryName);
			if (name === picName) {
				charaIndexArr.push(i);
			}
		}
	}

	// 正常にすべての画像が見つかった場合のみ、登録
	if (charaIndexArr.length === CHARACTER_CREATE_MATERIAL_ARRAY.length) {
		unit.custom.charaIndexArr = charaIndexArr;
	}
}
