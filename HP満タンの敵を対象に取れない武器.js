/*--------------------------------------------------------------------------
  
  HP満タンの敵を対象に取れない武器  

  ■概要
  武器のカスタムパラメータに {MaxHPblock : true} が設定してある場合，HP満タンの敵を攻撃対象から除外します。
  また，反撃時に使用できない（先制時のみ使用可能な）武器となります。

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

// 味方が使用する場合
// マップで敵を選択するとき，対象から除外する効果
AttackChecker.getAttackIndexArray = function(unit, weapon, isSingleCheck) {
	var i, index, x, y, targetUnit;
	var indexArrayNew = [];
	var indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
	var count = indexArray.length;
	
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		targetUnit = PosChecker.getUnitFromPos(x, y);

		if (targetUnit !== null && unit !== targetUnit) {
			if (FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {

				//以下改変箇所 ------------------
				var maxHp = ParamBonus.getMhp(targetUnit);
				var Hp = targetUnit.getHp();

				if (weapon !== null) {
					if (weapon.custom.MaxHPblock == undefined) {
						indexArrayNew.push(index);
						if (isSingleCheck) {
							return indexArrayNew;
						}
					} else if (weapon.custom.MaxHPblock == true) {
						//現在HPが最大HPが異なるときのみ処理
						if (maxHp !== Hp) {
							indexArrayNew.push(index);
							if (isSingleCheck) {
								return indexArrayNew;
							}
						}
					}
				}
				//以上改変箇所 ------------------
			}
		}
	}
	
	return indexArrayNew;
}

// 敵が使用する場合
// AIscore判定をマイナスの値に
var alias1 = AIScorer.Weapon._getDamageScore
AIScorer.Weapon._getDamageScore = function(unit, combination) {
	var hp = combination.targetUnit.getHp();
	var maxHp = ParamBonus.getMhp(combination.targetUnit);

	if ('MaxHPblock' in combination.item.custom) {
		if (combination.item.custom.MaxHPblock == true) {
			//現在HPと最大HPが等しいとき
			if (maxHp == hp) {
				return -10000;
			}
		}
	}

	return alias1.call(this, unit, combination);
}

AttackChecker.isCounterattack = function(unit, targetUnit) {
	var weapon, indexArray;
		
	if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
		return false;
	}
	
	weapon = ItemControl.getEquippedWeapon(unit);
	if (weapon !== null && weapon.isOneSide()) {
		// 攻撃する側が「一方向」の武器を装備している場合は、反撃は発生しない
		return false;
	}
	
	// 攻撃を受ける側の装備武器を取得
	weapon = ItemControl.getEquippedWeapon(targetUnit);
	
	// 武器を装備していない場合は、反撃できない
	if (weapon === null) {
		return false;
	}
	
	// 「一方向」の武器を装備している場合は反撃でない
	if (weapon.isOneSide()) {
		return false;
	}

	// (new) MaxHPblockの武器を装備している場合は反撃でない
	if (weapon.custom.MaxHPblock == true) {
		return false;
	}

	indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), weapon);
	
	return IndexArray.findUnit(indexArray, unit);
}

})();
