/*--------------------------------------------------------------------------
  
  慣性移動する選択カーソル

  ■概要
  Scrollbar上の選択カーソルが慣性移動するようになります。

  ■バージョン履歴
  2021/08/29  新規作成

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

//----------------------------
// 設定
//----------------------------

var CURSOL_MOVE_FRAME = 15; //コメントを表示するフレーム数を設定

//----------------------------

CommandCursor._preX = -1;
CommandCursor._preY = -1;
CommandCursor._preX2 = -1;
CommandCursor._preY2 = -1;
CommandCursor._inertiaCounter = 0;

var alias01 = CommandCursor.initialize;
CommandCursor.initialize = function() {
  alias01.call(this);

  //カーソル位置初期化
  CommandCursor._preX = -1;
  CommandCursor._preY = -1;
}

var alias02 = BaseScrollbar.moveScrollbarCursor;
BaseScrollbar.moveScrollbarCursor = function() {
  var inputType = alias02.call(this);

  if (inputType > -1) {
    //キーボード入力の場合
    CommandCursor._inertiaCounter = CURSOL_MOVE_FRAME;
  } 
  if (inputType === -2 && CommandCursor._inertiaCounter === -1) {
    //マウス入力の場合
    CommandCursor._inertiaCounter = CURSOL_MOVE_FRAME;
  }

  return inputType;
}

CommandCursor.drawCursor = function(x, y, isActive, pic) {
		var xSrc = 0;
		var width = UIFormat.SELECTCURSOR_WIDTH / 2;
		var height = UIFormat.SELECTCURSOR_HEIGHT / 2;
		
		if (pic === null) {
			return;
		}
		
		x -= 25;
		xSrc = this._commandCursorSrcIndex * width;
		
		if (isActive) {
      root.log(y + ' ' + CommandCursor._inertiaCounter);

      //慣性移動実施のための処理 ------------------
      if (CommandCursor._inertiaCounter >= 0) CommandCursor._inertiaCounter--;
      var counter = CommandCursor._inertiaCounter;

      if (counter < 0 || CommandCursor._preX === -1) {
        CommandCursor._preX = x;
        CommandCursor._preY = y;
      }
      if ((counter === CURSOL_MOVE_FRAME - 1) && (CommandCursor._preY2 !== y || CommandCursor._preX2 !== x)) {
        CommandCursor._preX = CommandCursor._preX2;
        CommandCursor._preY = CommandCursor._preY2;
      }
      CommandCursor._preX2 = x;
      CommandCursor._preY2 = y;

      if(counter > 0 && CommandCursor._preX !== -1) {
        var rate = Math.pow((CURSOL_MOVE_FRAME - counter) / CURSOL_MOVE_FRAME * 5, 3);
        x = (this._preX + x * rate) / (1 + rate);
        y = (this._preY + y * rate) / (1 + rate);
      }
      //------------------------------------------

      pic.drawParts(x - 0, y + 0, xSrc, 0, width, height);
		}
		else {
			xSrc = 0;
			pic.drawParts(x - 0, y + 0, xSrc, height, width, height);
		}
}

})();
