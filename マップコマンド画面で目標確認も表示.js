/*--------------------------------------------------------------------------

  マップコマンド画面で目標確認も表示

  ■バージョン履歴
  2022/02/01  スクリプト競合を回避するよう修正
  2022/01/31  新規作成

  ■対応バージョン
  SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し  OK
  ・再配布、転載  OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() { 
PlayerTurn._objectiveWindow = null;

var alias01 = PlayerTurn._prepareTurnMemberData;
PlayerTurn._prepareTurnMemberData = function() {
  alias01.call(this);
  this._objectiveWindow = createWindowObject(MapCommandObjectiveWindow, this);
}

var alias02 = PlayerTurn._completeTurnMemberData;
PlayerTurn._completeTurnMemberData = function() {
  alias02.call(this);
  this._objectiveWindow.setObjectiveData();
}

var alias03 = PlayerTurn._drawMapCommand;
PlayerTurn._drawMapCommand = function() {
  alias03.call(this);

  var x = root.getGameAreaWidth() - this._objectiveWindow.getWindowWidth() - 30;
  var y = LayoutControl.getRelativeY(12);
  
  this._objectiveWindow.drawWindow(x, y);
}

var MapCommandObjectiveWindow = defineObject(ObjectiveWindow,
{
  _scrollbarVictory: null,
  _scrollbarDefeat: null,
  _faceZone: null,
  _objectArray: null,
  
  drawWindowContent: function(x, y) {
    this._drawObjectiveArea(x, y);
    this._drawArea(x, y);
  },
  
  getWindowWidth: function() {
    return 300;
  },
  
  getWindowHeight: function() {
    return 340;
  },
  
  _drawObjectiveArea: function(x, y) {
    var dx = 10;
    var dy = 25;
    
    this._drawTitle(x, y, StringTable.Objective_Victory);
    this._scrollbarVictory.drawScrollbar(x + dx, y + dy);
    
    this._drawTitle(x, y + 140, StringTable.Objective_Defeat);
    this._scrollbarDefeat.drawScrollbar(x + dx, y + dy + 140);
  },
  
  _drawArea: function(x, y) {
    var i;
    var dx = 140;
    var count = this._objectArray.length;
    
    y += 260;
    
    for (i = 0; i < count; i++) {
      this._objectArray[i].drawObjectiveParts(x, y);
      x += dx;
    }
    
  }
}
);
  
})();
