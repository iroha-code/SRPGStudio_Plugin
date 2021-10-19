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
var alias1 = PlayerTurn._moveArea;
PlayerTurn._moveArea = function() {
  var result = this._mapSequenceArea.moveSequence();

  if (result === MapSequenceAreaResult.COMPLETE) {
    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
  }
  
  return alias1.call(this);
}

//移動後キャンセルしたときにも更新
var alias2 = PlayerTurn._moveUnitCommand;
PlayerTurn._moveUnitCommand = function() {
  var result = this._mapSequenceCommand.moveSequence();

  if (result === MapSequenceCommandResult.CANCEL) {
    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
  }

  return alias2.call(this);
}

})();
