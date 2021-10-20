/*--------------------------------------------------------------------------
  
  味方移動時に敵軍攻撃範囲（MarkingPanel）更新
  ■バージョン履歴
  2021/10/19  新規作成
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

//移動後に更新
PlayerTurn._moveArea = function() {
  var result = this._mapSequenceArea.moveSequence();

  if (result === MapSequenceAreaResult.COMPLETE) {
    this._mapEdit.clearRange();
    this._mapSequenceCommand.openSequence(this);
    this.changeCycleMode(PlayerTurnMode.UNITCOMMAND);

    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit); //ここ追加
  }
  else if (result === MapSequenceAreaResult.CANCEL) {
    this.changeCycleMode(PlayerTurnMode.MAP);
  }
  
  return MoveResult.CONTINUE;
}

//移動後キャンセルしたときにも更新
PlayerTurn._moveUnitCommand = function() {
  var result = this._mapSequenceCommand.moveSequence();
		
  if (result === MapSequenceCommandResult.COMPLETE) {
    this._mapSequenceCommand.resetCommandManager();
    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
    this._changeEventMode();
  }
  else if (result === MapSequenceCommandResult.CANCEL) {
    this._mapSequenceCommand.resetCommandManager();
    this.changeCycleMode(PlayerTurnMode.MAP);

    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit); //ここ追加
  }
  
  return MoveResult.CONTINUE;
}

})();