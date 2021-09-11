/*--------------------------------------------------------------------------
  
  戦闘予測画面で武器変更.js

  ■バージョン履歴
  2021/09/10  新規作成

  ■対応バージョン
  SRPG Studio Version:1.234
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() {

// ---------------------------------------
// PosAttackWindow 描画処理まわりの変更
// ---------------------------------------

PosAttackWindow._isSrc = false;

// 自軍かどうかの情報をクラスに持たせる
var alias01 = PosAttackWindow.setPosTarget;
PosAttackWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
	this._isSrc = isSrc;

	alias01.call(this, unit, item, targetUnit, targetItem, isSrc);
}

// 自軍ウインドウの場合は「Cキーで装備武器変更」を表示
var alias02 = PosAttackWindow.drawInfoBottom;
PosAttackWindow.drawInfoBottom = function(xBase, yBase) {
	alias02.call(this, xBase, yBase);

	if (this._isSrc) {
		var textui = this.getWindowTextUI();
		var font = textui.getFont();
		var color = textui.getColor();
		
		var width = this.getWindowWidth();
		var height = 30;
		var pic = textui.getUIImage();
		WindowRenderer.drawStretchWindow(xBase -16, yBase + this.getWindowHeight() - 10, width, height, pic);
		TextRenderer.drawText(xBase, yBase + this.getWindowHeight() - 2, 'Cキーで装備武器変更', -1, color, font);
	}
}

// ---------------------------------------
// Cキーを押したときに反応するように
// PosSelectorをベースにAttackPosSelectorを作成
// ---------------------------------------
var AttackPosSelector = defineObject(PosSelector,
{
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
		else if (InputControl.isOptionAction()) {
			// Cキーを押した場合
			this._playSelectSound();
			result = PosSelectorResult.WEAPONCHANGE;
		}
		else {
			this._posCursor.checkCursor();
		}
		return result;
	}
}
);

UnitCommand.Attack._prepareCommandMemberData = function() {
	this._weaponSelectMenu = createObject(WeaponSelectMenu);
	this._posSelector = createObject(AttackPosSelector); //AttackPosSelectorを参照するように変更
	this._isWeaponSelectDisabled = false;
}

// 新しい状態（装備武器変更）を追加
PosSelectorResult.WEAPONCHANGE = 3;

// ---------------------------------------
// UnitCommand.Attack 装備武器変更の実処理
// ---------------------------------------
UnitCommand.Attack._moveSelection = function() {
	var attackParam;
	var result = this._posSelector.movePosSelector();
	
	if (result === PosSelectorResult.SELECT) {
		if (this._isPosSelectable()) {
			this._posSelector.endPosSelector();
			
			attackParam = this._createAttackParam();
			
			this._preAttack = createObject(PreAttack);
			result = this._preAttack.enterPreAttackCycle(attackParam);
			if (result === EnterResult.NOTENTER) {
				this.endCommandAction();
				return MoveResult.END;
			}
			
			this.changeCycleMode(AttackCommandMode.RESULT);
		}
	}
	else if (result === PosSelectorResult.CANCEL) {
		this._posSelector.endPosSelector();
		if (this._isWeaponSelectDisabled) {
			return MoveResult.END;
		}
		
		this._weaponSelectMenu.setMenuTarget(this.getCommandTarget());
		this.changeCycleMode(AttackCommandMode.TOP);
	} else if (result === PosSelectorResult.WEAPONCHANGE) {
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

		this._startSelection(weapon);
	}
	
	return MoveResult.CONTINUE;
}


})();
