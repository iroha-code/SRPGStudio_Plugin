/*--------------------------------------------------------------------------
  
  武器選択画面で攻撃範囲表示.js

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

})();
