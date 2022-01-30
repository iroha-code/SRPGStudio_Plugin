/*--------------------------------------------------------------------------

  マップユニットHP表示（数値＋ゲージ）

  ゲームのマップ上で環境コマンドを選択すると、「マップユニットHP表示」という項目があります。
  このプラグインでは、「数値」の項目を「数値＋ゲージ」に変更します。

  ■バージョン履歴
  2021/01/30  新規作成

  ■対応バージョン
  SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し  OK
  ・再配布、転載  OK
  ・SRPG Studio利用規約は遵守してください。

  ■引用元
  ・このプラグインは、まさの様の「HPバーを細くするプラグイン」を流用改変しています。
  https://raw.githubusercontent.com/masano-ykttz/srpgstudio_plugins/master/script/custom_hpbar_number.js
  
--------------------------------------------------------------------------*/

MapHpDecorator._setupDecorationFromType = function(type) {
	var obj = root.getHpDecoration(type);
	var pos = this._getPos();
	var hpType = EnvironmentControl.getMapUnitHpType();
	
	obj.beginDecoration();
	if (hpType === 0) {
    // 数値＋ゲージ
    obj.addGauge(pos.x, pos.y, 1);
		obj.addHp(pos.x, pos.y -6, this._getNumberColorIndex(hpType));  //数字(HP数値)の描画
	}
	else if (hpType === 1) {
    // ゲージ
		obj.addGauge(pos.x, pos.y, 1);
	}
	obj.endDecoration();

};

// HP文字の色を設定
MapHpDecorator._getNumberColorIndex = function(type) {
  return 0;
};

//表示位置の指定
MapHpDecorator._getPos = function() {
  var x = 0;   //x座標、大きいほど右に寄る
  var y = 24;  //y座標、大きいほど下に寄る（本来の高さは20）

  return {
    x: x,
    y: y
  }
};

// 環境項目の表示を変更。もともと'数値'という表示の箇所
StringTable.MapUnitHp_Number = '数値＋ゲージ';
