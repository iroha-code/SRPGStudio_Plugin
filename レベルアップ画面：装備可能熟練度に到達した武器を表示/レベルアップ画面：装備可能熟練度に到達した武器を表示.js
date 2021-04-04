/*--------------------------------------------------------------------------
  
  レベルアップ画面：装備可能熟練度に到達した武器を表示

  ■概要
  レベルアップ画面で，ユニットの熟練度が所持している武器の装備可能熟練度に到達した場合，その武器を表示します。
  名前未定（仮）氏の「杖に使用可能熟練度」プラグインを使用している場合，杖の使用可能熟練度についても同様に処理を行います。  
  ウインドウの表示内容（文言や位置など）は，「//獲得スキルウインドウの描画処理」以降をいじれば調整可能です。

  ■バージョン履歴
  2021/04/04  新規作成

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
		var itemwlv = -1;

		if (item !== null) {
			if (item.isWeapon() == true && ItemControl.isWeaponAvailable2(targetUnit, item)) {
				//武器の装備可能熟練度を取得
				itemwlv = item.getWeaponLevel();
			}
			if (item.isWand() == true && ItemControl.isItemUsable2(targetUnit, item)) {
				if ("getWandLevel" in ItemControl) {
					//杖の使用可能熟練度を取得
					itemwlv = ItemControl.getWandLevel(item);
				}
			}
			if (ParamBonus.getWlv(targetUnit) < itemwlv && ParamBonus.getWlv(targetUnit) + growthArray[9] >= itemwlv) {
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
	for (var i = 0; i < this._itemcount; i++) {
		var item = this._itemlist[i];

		GraphicsRenderer.drawImage(x + 200, y + 8 + i * 30, item.getIconResourceHandle(), GraphicsType.ICON);
		TextRenderer.drawText(x + 230, y + 13 + i * 30, item.getName(), -1, textui.getColor(), font);
	}

};

//「熟練度」の項目のみ考慮対象から外す
ItemControl.isWeaponAvailable2 = function(unit, item) {
	if (item === null) {
		return false;
	}
	
	// itemが武器でない場合は装備できない
	if (!item.isWeapon()) {
		return false;
	}
	
	// 「戦士系」などが一致するか調べる
	if (!this._compareTemplateAndCategory(unit, item)) {
		return false;
	}
	
	// クラスの「装備可能武器」のリストに入っているか調べる
	if (!this.isWeaponTypeAllowed(unit.getClass().getEquipmentWeaponTypeReferenceList(), item)) {
		return false;
	}
	
	// 「専用データ」を調べる
	if (!this.isOnlyData(unit, item)) {
		return false;
	}
	
	if (item.getWeaponCategoryType() === WeaponCategoryType.MAGIC) {
		// 「魔法攻撃」が禁止されているか調べる
		if (StateControl.isBadStateFlag(unit, BadStateFlag.MAGIC)) {
			return false;
		}
	}
	else {
		// 「物理攻撃」が禁止されているか調べる
		if (StateControl.isBadStateFlag(unit, BadStateFlag.PHYSICS)) {
			return false;
		}
	}
	
	return true;
}

//「熟練度」の項目のみ考慮対象から外す
ItemControl.isItemUsable2 = function(unit, item) {
	// 武器は使用できない
	if (item.isWeapon()) {
		return false;
	}
	
	// アイテムの使用が禁止されているか調べる
	if (StateControl.isBadStateFlag(unit, BadStateFlag.ITEM)) {
		return false;
	}
		
	if (item.isWand()) {
		// アイテムが杖の場合は、クラスが杖を使用できなければならない
		if (!(unit.getClass().getClassOption() & ClassOptionFlag.WAND)) {
			return false;
		}
		
		// 杖の使用が禁止されているか調べる
		if (StateControl.isBadStateFlag(unit, BadStateFlag.WAND)) {
			return false;
		}
	}
	
	if (item.getItemType() === ItemType.KEY) {
		if (item.getKeyInfo().isAdvancedKey()) {
			// 「専用鍵」の場合は、クラスが鍵を使用できなければならない
			if (!(unit.getClass().getClassOption() & ClassOptionFlag.KEY)) {
				return false;
			}
		}
	}
	
	// 「専用データ」を調べる
	if (!this.isOnlyData(unit, item)) {
		return false;
	}
	
	return true;
}

})();