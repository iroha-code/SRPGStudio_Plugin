
/*--------------------------------------------------------------------------
  
　反撃時に武器を選択可能にするスクリプト

■概要
敵ターンで、敵に攻撃を受けた場合の反撃時に武器を選択できるようになります。

キーワード'weapon_select'を設定したカスタムスキルを当該のユニットに設定すると、
そのユニットだけが反撃時に武器選択出来るようになります。
（初期状態では、反撃武器選択スキルを所持したユニットのみ反撃時に武器選択出来るようになっています）

ただし以下の場合は武器選択ウィンドウは出ず従来のままに処理が進みます。
１．データ設定で反撃は行わないように設定してある
２．敵武器に対して射程が合う武器を持っていない（武器未所持も含む）
３．敵or自分が一方通行の武器を持っている
４．自分が行動不能／暴走／武器使用不可のバッドステートを受けている

■カスタマイズ
１．全自軍ユニットが反撃時に武器選択が可能になるようにしたい。
　　　設定の中にある『var PlayrUnit_CounterWeaponSelectable = false;』の部分を
　　　『var PlayrUnit_CounterWeaponSelectable = true;』に書き換えて下さい。
　　　※この場合、概要に記述したカスタムスキルを所持していなくても自軍ユニットは反撃時に武器を選択できるようになります。

２．反撃しない事を選択出来るようにしたい
　　本ソース内の設定にある反撃しない事を選択出来るか（var NoEquipWeaponEnable = false;）のfalseをtrueにすると、
　　敵から攻撃を受けた時に武器選択画面下部に『キャンセルキーで反撃しない事を選択出来ます』と表示されるようになります。

　　その状態であれば、武器選択画面でキャンセルキーを押す→戦闘結果予測画面で決定キーを押す、と行うと
　　反撃しないようになります。
　　（反撃しない場合、戦闘結果予測画面で攻撃や命中のところに--が表示されるので判ると思います）



16/01/16  新規作成
16/02/25  1.060対応
16/07/26  1.085対応
16/07/30  反撃しない事を選択出来るようになる設定を追加
16/10/21  敵ターンスキップを行った場合、反撃時にエラーが発生するバグを修正
17/11/29  1.164対応
17/12/05  変数の定義ミスにより、反撃時にエラーが出る事があったのを修正
17/12/28  難易度設定で反撃不可とし、本プラグインの設定を無条件で武器選択可能の設定をした場合に
          スキル：反撃を所持したユニットが武器を選択出来ないバグを修正
20/09/12  本プラグインの設定が「反撃武器選択スキル所持ならば可能」になっていたのに説明文が食い違っていた為説明文を修正
21/09/10  戦闘予測画面で武器変更ができるように修正（加筆者：彩羽）


■対応バージョン
　SRPG Studio Version:1.164　※20/09/12verまで
　SRPG Studio Version:1.164　※21/09/10

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


(function() {

//-----------------------------------
// 設定
//-----------------------------------
// 自軍は全員無条件で反撃時に武器選択可能か？（true:無条件で武器選択可能、false:反撃武器選択スキル所持ならば可能）
var PlayrUnit_CounterWeaponSelectable = true;

// 反撃武器選択用のカスタムスキル名
var WeaponSelectSkill = 'weapon_select';

// 反撃しない事を選択出来るか（true:反撃しない事を選択可能 false:不可能）
var NoEquipWeaponEnable = false;

//-----------------------------------




//-----------------------------------
// 以下、ソースコードやコード内の定義
//-----------------------------------
var WeaponAutoActionMode = {
	CURSORSHOW: 0,
	PREATTACK: 1,
	WEAPONSELECT: 3,
	DISPATTACKWINDOW: 4
};

var alias1 = WeaponAutoAction.setAutoActionInfo
WeaponAutoAction.setAutoActionInfo= function(unit, combination) {
		alias1.call(this, unit, combination);

		this._isNoEuipedWeapon = 0;

		this._weaponSelectMenu = createObject(EnemyTurnWeaponSelectMenu);
		this._posSelector = createObject(EnemyTurnPosSelector);

		// 敵が攻撃を行う時点では敵ユニットの位置座標は更新されておらず、移動前の位置に存在する事になっている
		// 実際には敵はcombination.posIndexで指定された地点にいるので、CurrentMap.getX(combination.posIndex)などでX、Y座標を取得する必要がある
		this._enemyX = CurrentMap.getX(combination.posIndex);
		this._enemyY = CurrentMap.getY(combination.posIndex);

		if( this._isWeaponSelectable() ) {
			// 敵ルーチンでの処理なので、this._targetUnitが敵に狙われたユニット、unitが敵ユニット
			// this._enemyX、this._enemyYは実際の敵座標
			// this._weaponは敵の使う武器（敵は自軍と違ってUnitItemControl.getPossessionItemCount()やItemControl.getEquippedWeapon()はできない模様）
			this._weaponSelectMenu.setMenuUnitAndTarget(this._targetUnit, unit, this._enemyX, this._enemyY, this._weapon );
		}
}


WeaponAutoAction.enterAutoAction= function() {
		var isSkipMode = this.isSkipMode();
		
		if (isSkipMode) {
			if( this._isWeaponSelectable() ) {
				this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
			}
			else {
				if (this._enterAttack() === EnterResult.NOTENTER) {
					return EnterResult.NOTENTER;
				}
				
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
			}
		}
		else {
			this._changeCursorShow();
			this.changeCycleMode(WeaponAutoActionMode.CURSORSHOW);
		}
		
		return EnterResult.OK;
}


var alias2 = WeaponAutoAction.moveAutoAction
WeaponAutoAction.moveAutoAction= function() {
		var result = MoveResult.CONTINUE;
		result = alias2.call(this);

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			result = this._moveWeaponSelect();
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			result = this._moveAttackWindow();
		}
		
		return result;
}


var alias3 = WeaponAutoAction.drawAutoAction
WeaponAutoAction.drawAutoAction= function() {
		alias3.call(this);

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			result = this._drawWeaponSelect();
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			result = this._drawAttackWindow();
		}
}


var alias4 = WeaponAutoAction.isSkipAllowed
WeaponAutoAction.isSkipAllowed= function() {
		if( alias4.call(this) === false ) {
			return false;
		}

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			return false;
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			return false;
		}
	
		return true;
}


WeaponAutoAction._moveCursorShow= function() {
		var isSkipMode = this.isSkipMode();
		
		if (isSkipMode || this._autoActionCursor.moveAutoActionCursor() !== MoveResult.CONTINUE) {
			if (isSkipMode) {
				this._autoActionCursor.endAutoActionCursor();
			}
			
			if (this._enterAttack() === EnterResult.NOTENTER) {
				return MoveResult.END;
			}
		
			if( this._isWeaponSelectable() ) {
				this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
			}
			else {
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
			}
		}
		
		return MoveResult.CONTINUE;
}


WeaponAutoAction._createAttackParam= function() {
		var attackParam = StructureBuilder.buildAttackParamFromCounterAttackSelect();
		
		attackParam.unit = this._unit;
		attackParam.targetUnit = this._targetUnit;
		attackParam.attackStartType = AttackStartType.NORMAL;

		attackParam.isNoEuipedWeapon = this._isNoEuipedWeapon;
		
		return attackParam;
}




//-------------------------------------
// BaseAttackInfoBuilderクラス
//-------------------------------------
var alias5 = BaseAttackInfoBuilder.createAttackInfo;
BaseAttackInfoBuilder.createAttackInfo= function(attackParam) {
		var attackInfo = alias5.call(this, attackParam);
		
		// 反撃しないことを設定
		if( typeof attackParam.isNoEuipedWeapon === 'number' && attackParam.isNoEuipedWeapon == 1 ) {
			attackInfo.isCounterattack = false;
		}
		return attackInfo;
}




//=====================================
// ここから追加関数群
//=====================================

//-------------------------------------
// WeaponAutoActionクラス追加関数
//-------------------------------------

// 武器選択画面での操作
WeaponAutoAction._moveWeaponSelect= function() {
		var weapon, filter, indexArray;
		var unit = this._targetUnit;
		var input = this._weaponSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
			weapon = this._weaponSelectMenu.getSelectWeapon();
			filter = FilterControl.getReverseFilter(this._targetUnit.getUnitType());
			
			// 選択したアイテムを装備
			ItemControl.setEquippedWeapon(unit, weapon);
			
			indexArray = AttackChecker.getAttackIndexArray(unit, weapon, false);
			this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
			this._posSelector._posMenu.changePosTarget(this._unit);
			
			// 武器選択したので、反撃武器ありをメンバ変数に設定
			this._isNoEuipedWeapon = 0;

			this.changeCycleMode(WeaponAutoActionMode.DISPATTACKWINDOW);
		}
		else if (NoEquipWeaponEnable == true && input === ScrollbarInput.CANCEL) {
			// 武器を選択していないので、武器にnullを設定
			weapon = null;
			filter = FilterControl.getReverseFilter(this._targetUnit.getUnitType());
			
			indexArray = AttackChecker.getAttackIndexArray(unit, weapon, false);
			this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
			this._posSelector._posMenu.changePosTarget(this._unit);
			
			// 武器を選択していないので、反撃武器なしをメンバ変数に設定
			this._isNoEuipedWeapon = 1;

			this.changeCycleMode(WeaponAutoActionMode.DISPATTACKWINDOW);
		}
		
		return MoveResult.CONTINUE;
}


// 武器決定後の戦闘予測表示での操作
WeaponAutoAction._moveAttackWindow= function() {
		var attackParam;
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
				this._posSelector.endPosSelector();
				
				attackParam = this._createAttackParam();
				
				this._preAttack = createObject(PreAttack);
				result = this._preAttack.enterPreAttackCycle(attackParam);
				if (result === EnterResult.NOTENTER) {
					return MoveResult.END;
				}
				
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
		}
		// -------------------------------------------------
		// 彩羽加筆ここから 装備武器の変更処理
		// -------------------------------------------------
		else if (result === PosSelectorResult.WEAPONCHANGE) {
			// 新設する処理。装備武器を変更する
			// 直前の武器選択画面に出てくるScrollbarで，1つ後の武器を参照する。
			// もし最後の武器だった場合は，1番目の武器に戻る。
			var index = this._weaponSelectMenu._itemListWindow.getItemIndex();
			this._weaponSelectMenu._itemListWindow.setItemIndex(index + 1);
			var weapon = this._weaponSelectMenu.getSelectWeapon();
	
			if (!weapon) {
				this._weaponSelectMenu._itemListWindow.setItemIndex(0);
				var weapon = this._weaponSelectMenu.getSelectWeapon();
			}
	
			var unit = this._targetUnit;
			filter = FilterControl.getReverseFilter(this._targetUnit.getUnitType());

			// 選択したアイテムを装備
			ItemControl.setEquippedWeapon(unit, weapon);
			
			indexArray = AttackChecker.getAttackIndexArray(unit, weapon, false);
			this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
			this._posSelector._posMenu.changePosTarget(this._unit);
		}
		// -------------------------------------------------
		// 彩羽加筆ここまで
		// -------------------------------------------------
		
		return MoveResult.CONTINUE;
}


// 武器選択画面の描画処理
WeaponAutoAction._drawWeaponSelect= function() {
		this._weaponSelectMenu.drawWindowManager();
}


// 武器決定後の戦闘予測表示の描画処理
WeaponAutoAction._drawAttackWindow= function() {
		this._posSelector.drawPosSelector();
}


// 反撃時の武器選択可否判定
WeaponAutoAction._isWeaponSelectable= function() {

		// 被攻撃ユニットが自軍でない場合、反撃時の武器選択は不可
		if (this._targetUnit.getUnitType() !== UnitType.PLAYER) {
			return false;
		}
		// 被攻撃ユニットがバッドステートにより行動不能なら反撃武器選択は不可
		if (StateControl.isBadStateOption(this._targetUnit, BadStateOption.NOACTION)) {
			return false;
		}

		// 被攻撃ユニットがバッドステートにより暴走中なら反撃武器選択は不可
		if (StateControl.isBadStateOption(this._targetUnit, BadStateOption.BERSERK)) {
			return false;
		}

		// 被攻撃側の武器で反撃可能か？（武器非所持、射程が合わない、敵or被攻撃側いずれかが一方通行武器、ならば反撃不可）
		if (this._isCounterAttackable(this._targetUnit) === false) {
			return false;
		}

		// 「自軍は全員無条件で反撃時に武器選択可能」では無い場合、反撃武器選択スキルを所持していなければ反撃不可
		if( PlayrUnit_CounterWeaponSelectable === false ) {
			if( SkillControl.getPossessionCustomSkill(this._targetUnit, WeaponSelectSkill) === null ) {
				return false;
			}
		}

		return true;
}


// 被攻撃側の武器で反撃可能かの判定
WeaponAutoAction._isCounterAttackable= function(targetUnit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(targetUnit);
		var weaponCount = 0;
		
		for (i = 0; i < count; i++) {
			item = targetUnit.getItem(i);
			// 被攻撃側の持つ指定武器が反撃可能ならば、trueを返す
			if (this._isWeaponAllowed(targetUnit, item)) {
				return true;
			}
		}
		
		return false;
}


// 被攻撃側の持つ指定武器は反撃可能かの判定
WeaponAutoAction._isWeaponAllowed= function(unit, item) {
		
		// 被攻撃側が指定武器を装備出来ない（装備出来ない武器を持っていたorステートにより武器を使えない）場合は反撃不可
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
		
		// 指定武器の射程が合うか、敵or被攻撃側いずれかが一方通行武器、などをチェック
		var result = AttackChecker.isCounterAttackableWeapon(this._weapon, this._enemyX, this._enemyY, unit, item, this._targetUnit);
		return result;
}




//-------------------------------------
// StructureBuilder（新規関数追加）
//-------------------------------------
StructureBuilder.buildAttackParamFromCounterAttackSelect= function() {
		return {
			unit: null,
			targetUnit: null,
			attackStartType: 0,
			forceBattleObject: null,
			fusionAttackData: null,
			isNoEuipedWeapon: 0
		};
}




//-------------------------------------
// AttackChecker（新規関数追加）
//-------------------------------------
// counterUnitがcounterWeaponで反撃できるかどうかを調べる
// （enemyWeapon：敵の使用武器、unitx：敵X座標、unity：敵Y座標。敵の使用武器や座標を敵unitから取得できないので上位から引き渡している）
AttackChecker.isCounterAttackableWeapon= function(enemyWeapon, unitx, unity, counterUnit, counterWeapon, enemyUnit) {
		var indexArray;
		
		if (!Calculator.isCounterattackAllowed(enemyUnit, counterUnit)) {
			return false;
		}
		
		if (enemyWeapon !== null && enemyWeapon.isOneSide()) {
			// 敵が「一方向」の武器を装備している場合は、反撃は発生しない
			return false;
		}
		
		// 反撃用の武器を所持していない場合は反撃できない
		if (counterWeapon === null) {
			return false;
		}
		
		// 「一方向」の武器は反撃できない
		if (counterWeapon.isOneSide()) {
			return false;
		}
		
		indexArray = IndexArray.createIndexArray(counterUnit.getMapX(), counterUnit.getMapY(), counterWeapon);
		
		// 反撃側の武器で、攻撃側の座標を攻撃可能かチェック
		var result = IndexArray.findPos(indexArray, unitx, unity);
		return result;
};




//-------------------------------------
// EnemyTurnWeaponSelectMenuクラス
//-------------------------------------
var EnemyTurnWeaponSelectMenu = defineObject(WeaponSelectMenu,
{
	_enemyUnit: null,	// 敵ユニット
	_enemyX: 0,			// 敵ユニットのX座標
	_enemyY: 0,			// 敵ユニットのY座標
	_weapon:null,		// 敵ユニットの武器
	_noEquipMessageWindow:null,	// メッセージ表示ウィンドウ（反撃なしを選択出来るメッセージ用）

	setMenuUnitAndTarget: function(unit, enemyUnit, enemyX, enemyY, enemyWeapon) {
		this._enemyUnit = enemyUnit;
		this._enemyX = enemyX;
		this._enemyY = enemyY;
		this._weapon = enemyWeapon;
		this.setMenuTarget(unit);

		if( NoEquipWeaponEnable == true ) {
			this._noEquipMessageWindow = createWindowObject(NoEquipMessageWindow, this); 
		}
	},
	
	drawWindowManager: function() {
		WeaponSelectMenu.drawWindowManager.call(this);

		var x = this.getPositionWindowX();
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight() + this._itemInfoWindow.getWindowHeight();
		
		if( NoEquipWeaponEnable == true ) {
			this._noEquipMessageWindow.drawWindow(x, y + height + this._getWindowInterval() * 2);
		}
	},
	
	_isWeaponAllowed: function(unit, item) {
		
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
		
		var result = AttackChecker.isCounterAttackableWeapon(this._weapon, this._enemyX, this._enemyY, unit, item, this._enemyUnit);
		return result;
	}
}
);




//-------------------------------------
// EnemyTurnPosSelectorクラス
//-------------------------------------
// 敵ターンで使用するPosSelector
var EnemyTurnPosSelector = defineObject(PosSelector,
{
	// 反撃時の武器選択なのでカーソル選択によるチップ点灯を行わない
	setUnitOnly: function(unit, item, indexArray, type, filter) {
		this._unit = unit;
		this._indexArray = indexArray;
		this._filter = filter;
//		MapLayer.getMapChipLight().setIndexArray(indexArray);
		this._setPosMenu(unit, item, type);
		this._posCursor = createObject(this._getObjectFromType(this._selectorType));
		this._posCursor.setParentSelector(this);
	},
	
	// 反撃時の武器選択なので攻撃対象は確定済。よってmovePosSelector内でthis._posCursor.checkCursor()を呼び出さないようにしている。
	movePosSelector: function() {
		var result = PosSelectorResult.NONE;
		
		if (InputControl.isSelectAction()) {
			this._playSelectSound();
			result = PosSelectorResult.SELECT;
		}
		else if (InputControl.isCancelAction()) {
			this._playCancelSound();
			result = PosSelectorResult.CANCEL;
		}
		// -------------------------------------------------
		// 彩羽加筆ここから
		// -------------------------------------------------
		else if (InputControl.isOptionAction()) {
			// Cキーを押した場合
			this._playSelectSound();
			result = PosSelectorResult.WEAPONCHANGE;
		}
		// -------------------------------------------------
		// 彩羽加筆ここまで
		// -------------------------------------------------
//		else {
//			this._posCursor.checkCursor();
//		}
		
		return result;
	},
	
	// 反撃時の武器選択では選択対象が不要な為、カーソルを描画しない
	drawPosSelector: function() {
		if (this._posCursor === null) {
			return;
		}
		
//		this._posCursor.drawCursor();
		this._posMenu.drawWindowManager();
	}
}
);




//-------------------------------------
// NoEquipMessageWindowクラス
//-------------------------------------
// 「キャンセルキーで反撃しない事を選択出来ます」表示用ウィンドウ
var NoEquipMessageWindow = defineObject(BaseWindow,
{
	drawWindowContent: function(x, y) {
		var font;
		var textui = this.getWindowTitleTextUI();

		if (textui === null) {
			return;
		}
		font = textui.getFont();

		TextRenderer.drawText(x, y,'キャンセルキーで反撃しない事を選択出来ます', -1, ColorValue.DEFAULT, font);
	},
	
	getWindowTitleTextUI: function() {
		return root.queryTextUI('infowindow_title');
	},
	
	getWindowWidth: function() {
		return 330;
	},
	
	getWindowHeight: function() {
		return 46;
	}
}
);


})();