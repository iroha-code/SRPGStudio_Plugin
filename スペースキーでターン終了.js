/*--------------------------------------------------------------------------
    
  スペースキーでターン終了

  ■バージョン履歴
  2021/09/27  新規作成

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

MapEdit._moveCursorMove = function() {
	var unit = this._mapCursor.getUnitFromCursor();
	var result = MapEditResult.NONE;

	if (InputControl.isSelectAction()) {
		result = this._selectAction(unit);
	}
	else if (InputControl.isCancelAction()) {
		result = this._cancelAction(unit);
	}
	else if (InputControl.isOptionAction()) {
		result = this._optionAction(unit);
	}
	else if (InputControl.isLeftPadAction()) {
		this._changeTarget(false);
	}
	else if (InputControl.isRightPadAction()) {
		this._changeTarget(true);
	}
	//ここ追加
	else if (root.getCurrentScene() == SceneType.FREE && InputControl.isStartAction()) {
		TurnControl.turnEnd();
	}
	//ここまで
	else {
		this._mapCursor.moveCursor();
		this._mapPartsCollection.moveMapPartsCollection();
		
		unit = this.getEditTarget();
		
		// ユニットが変更された場合は更新
		if (unit !== this._prevUnit) {
			this._setUnit(unit);
		}
	}
	return result;
}


})();
