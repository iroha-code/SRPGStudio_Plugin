/*--------------------------------------------------------------------------
  
  味方移動時に敵軍攻撃範囲（MarkingPanel）更新

  ■バージョン履歴
  2021/10/19  新規作成
  2021/10/21  バグ改修
  2021/10/23  処理競合が発生しづらいよう，aliasを利用したコードに修正

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

//-----------------------------------------------
// 移動後に更新
//-----------------------------------------------
var alias01 = PlayerTurn._moveArea;
PlayerTurn._moveArea = function() {
  var result = alias01.call(this);
  root.log('iroha');

  if (this._mapSequenceArea.getResultData() === MapSequenceAreaResult.COMPLETE) {
    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
  }

  return result;
}

var alias02 = MapSequenceArea._prepareSequenceMemberData;
MapSequenceArea._prepareSequenceMemberData = function(parentTurnObject) {
  alias02.call(this, parentTurnObject);

  // 終了結果格納用のメンバ変数を初期化
  this._sequenceResultData = MapSequenceAreaResult.NONE;
}

var alias03 = MapSequenceArea.moveSequence;
MapSequenceArea.moveSequence = function() {
  var result = alias03.call(this);

  // resultがMapSequenceAreaResult.NONE以外なら終了結果格納用のメンバ変数に格納
  if (result !== MapSequenceAreaResult.NONE) {
    this._sequenceResultData = result;
  }

  return result;
}

// MapSequenceArea.moveSequence() の終了結果格納用のメンバ変数
MapSequenceArea.getResultData = function() {
  return this._sequenceResultData;
}

//-----------------------------------------------
// 移動後キャンセルしたときにも更新
//-----------------------------------------------
var alias11 = PlayerTurn._moveUnitCommand;
PlayerTurn._moveUnitCommand = function() {
  var result = alias11.call(this);

  if (this._mapSequenceCommand.getResultData() === MapSequenceCommandResult.CANCEL) {
    MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
  }

  return result;
}

var alias12 = MapSequenceCommand._prepareSequenceMemberData;
MapSequenceCommand._prepareSequenceMemberData = function(parentTurnObject) {
  alias12.call(this, parentTurnObject);

  // 終了結果格納用のメンバ変数を初期化
  this._sequenceResultData = MapSequenceCommandResult.NONE;
}

var alias13 = MapSequenceCommand.moveSequence;
MapSequenceCommand.moveSequence = function() {
  var result = alias13.call(this);

  // resultがMapSequenceCommandResult.NONE以外なら終了結果格納用のメンバ変数に格納
  if (result !== MapSequenceCommandResult.NONE) {
    this._sequenceResultData = result;
  }

  return result;
}

// MapSequenceCommand.moveSequence() の終了結果格納用のメンバ変数
MapSequenceCommand.getResultData = function() {
  return this._sequenceResultData;
}

})();