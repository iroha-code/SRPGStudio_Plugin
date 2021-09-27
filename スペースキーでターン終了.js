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

var alias = MapEdit._moveCursorMove;
MapEdit._moveCursorMove = function() {
	if (root.getCurrentScene() == SceneType.FREE && InputControl.isStartAction()) {
		TurnControl.turnEnd();
	}

	return alias.call(this);
}


})();
