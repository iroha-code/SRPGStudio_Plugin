/*--------------------------------------------------------------------------
  
  武器選択画面で攻撃範囲表示.js

  ■
  武器選択画面で攻撃範囲を表示します。
  武器選択後，攻撃相手を選ぶ画面でも攻撃範囲を表示するかどうかは，「設定」の項目で切替可能です。

  var RESULTWINDOW_WAVEPANEL_DISPLAY = true;  → 攻撃相手を選ぶ画面でも攻撃範囲を表示する
  var RESULTWINDOW_WAVEPANEL_DISPLAY = false; → 攻撃相手を選ぶ画面では攻撃範囲を表示しない

  ■バージョン履歴
  2021/09/24  新規作成

  ■対応バージョン
  SRPG Studio Version:1.244
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
//-------------------------------------------
// 設定
//-------------------------------------------
var RESULTWINDOW_WAVEPANEL_DISPLAY = true;
//-------------------------------------------

(function() {

UnitCommand.Attack._wavePanel = null;
UnitCommand.Attack._indexArray = [];
UnitCommand.Attack._tmpweapon = null;

var alias01 = UnitCommand.Attack._prepareCommandMemberData;
UnitCommand.Attack._prepareCommandMemberData = function() {
  this._wavePanel = createObject(WavePanel);

  alias01.call(this);  
}

var alias02 = UnitCommand.Attack._moveTop;
UnitCommand.Attack._moveTop = function() {
  var unit = this.getCommandTarget();
  var weapon = this._weaponSelectMenu.getSelectWeapon();

  if (!this._tmpweapon || this._tmpweapon !== weapon) {
    this._indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
  }
  this._tmpweapon = weapon;
  this._wavePanel.moveWavePanel();

  return alias02.call(this);  
}

var alias03 = UnitCommand.Attack._drawTop;
UnitCommand.Attack._drawTop = function() {
  root.drawWavePanel(this._indexArray, root.queryUI('range_panel'), this._wavePanel.getScrollCount());

  alias03.call(this);
}



var alias04 = UnitCommand.Attack._moveSelection;
UnitCommand.Attack._moveSelection = function() {
  if (RESULTWINDOW_WAVEPANEL_DISPLAY) this._wavePanel.moveWavePanel();

  return alias04.call(this);  
}

var alias05 = UnitCommand.Attack._drawSelection;
UnitCommand.Attack._drawSelection = function() {
  if (RESULTWINDOW_WAVEPANEL_DISPLAY) root.drawWavePanel(this._indexArray, root.queryUI('range_panel'), this._wavePanel.getScrollCount());

  return alias05.call(this);  
}


})();
