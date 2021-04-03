/*--------------------------------------------------------------------------
  
  レベルアップ画面：装備可能熟練度に到達した武器を表示

  ■概要
  レベルアップ画面で，ユニットの熟練度が所持している武器の装備可能熟練度に到達した場合，その武器を表示します。
  ウインドウの表示内容（文言や位置など）は，71行目以降をいじれば調整可能です。

  
  2021/04/03  新規作成

　■対応バージョン
　SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() {

var alias1 = ExperienceParameterWindow.setExperienceParameterData
ExperienceParameterWindow.setExperienceParameterData= function(targetUnit, growthArray) {
	alias1.call(this, targetUnit, growthArray);

	this._itemlist = [];

	var i = 0;
	while (targetUnit.getItem(i)) {
		var item = targetUnit.getItem(i);
		var weaponwlv = -1;

		if (item !== null) {
		var isWeapon = item.isWeapon();
			if (isWeapon == true) {
				//武器の装備可能熟練度を取得
				weaponwlv = item.getWeaponLevel();
			}
			if (ParamBonus.getWlv(targetUnit) < weaponwlv && ParamBonus.getWlv(targetUnit) + growthArray[9] >= weaponwlv) {
				//レベルアップ前の熟練度は装備可能熟練度未満，レベルアップ後の熟練度は装備可能熟練度以上の場合
				this._itemlist.push(item);
			}
		}
		i++;
	}

};


var alias2 = ExperienceParameterWindow.drawWindowContent;
ExperienceParameterWindow.drawWindowContent = function(x, y) {
	// 従来の描画処理を呼び出す
	alias2.call(this, x, y);

	this._itemcount = this._itemlist.length;

	//獲得スキルウインドウの描画処理
	if (this._itemcount > 0) {
		var textui = root.queryTextUI('default_window');
		var font = textui.getFont();
		var pic  = textui.getUIImage();

		x = x - 16;
		y = y + 120;
		var width = this.getWindowWidth();
		var height = 10 + this._itemcount * 30;
		WindowRenderer.drawStretchWindow(x, y, width, height, pic);
		TextRenderer.drawText(x + 25, y + 13, 'Weapon Available !', -1, ColorValue.KEYWORD, font);
	}

	//itemlistに格納されているものをすべて呼び出し
	for (i = 0; i < this._itemcount; i++) {
		var item = this._itemlist[i];

		GraphicsRenderer.drawImage(x + 200, y + 8 + i * 30, item.getIconResourceHandle(), GraphicsType.ICON);
		TextRenderer.drawText(x + 230, y + 13 + i * 30, item.getName(), -1, textui.getColor(), font);
	}

};

})();