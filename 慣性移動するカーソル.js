/*--------------------------------------------------------------------------
  
  慣性移動するカーソル

  ■概要
  Scrollbar上の選択カーソルとマップカーソルが慣性移動するようになります。

  ■バージョン履歴
  2021/08/29  新規作成
  2021/08/29  マップカーソルも慣性移動するように修正

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

//-------------------------------------------
// 設定
//-------------------------------------------

var CURSOL_MOVE_FRAME = 20; //慣性移動のフレーム数を設定

//-------------------------------------------
// ここから選択カーソル（CommandCursor）の処理
//-------------------------------------------
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

//-------------------------------------------
// ここからマップカーソル（MapCursor）の処理
//-------------------------------------------
MapCursor._preX = -1;
MapCursor._preY = -1;
MapCursor._preX2 = -1;
MapCursor._preY2 = -1;
MapCursor._inertiaCounter = 0;

var alias03 = MapCursor.initialize;
MapCursor.initialize = function() {
  alias03.call(this);

  //カーソル位置初期化
  MapCursor._preX = -1;
  MapCursor._preY = -1;
}

var alias04 = MapCursor.moveCursor;
MapCursor.moveCursor = function() {
  var inputType = alias04.call(this);

  if (inputType > -1) {
    //キーボード入力の場合
    MapCursor._inertiaCounter = CURSOL_MOVE_FRAME;
  }

  return inputType;
}

var alias05 = MouseControl._adjustMapCursor;
MouseControl._adjustMapCursor = function() {
  var session = root.getCurrentSession();
  var xCursor = Math.floor((root.getMouseX() + session.getScrollPixelX() - root.getViewportX()) / GraphicsFormat.MAPCHIP_WIDTH);
  var yCursor = Math.floor((root.getMouseY()  + session.getScrollPixelY() - root.getViewportY()) / GraphicsFormat.MAPCHIP_HEIGHT);
  
  var xboo = root.getCurrentSession().setMapCursorX(xCursor) !== root.getCurrentSession().getMapCursorX();
  var yboo = root.getCurrentSession().setMapCursorY(yCursor) !== root.getCurrentSession().getMapCursorY();

  if ((xboo || yboo) && MapCursor._inertiaCounter === -1) {
    //マウス入力の場合
    MapCursor._inertiaCounter = CURSOL_MOVE_FRAME;
  }

  alias05.call(this);
}

MapCursor.drawCursor = function() {
  var session = root.getCurrentSession();
  var width = UIFormat.MAPCURSOR_WIDTH / 2;
  var height = UIFormat.MAPCURSOR_HEIGHT;
  var x = (session.getMapCursorX() * GraphicsFormat.MAPCHIP_WIDTH) - session.getScrollPixelX();
  var y = (session.getMapCursorY() * GraphicsFormat.MAPCHIP_HEIGHT) - session.getScrollPixelY();
  var pic = root.queryUI('mapcursor');

  //慣性移動実施のための処理 ------------------
  if (MapCursor._inertiaCounter >= 0) MapCursor._inertiaCounter--;
  var counter = MapCursor._inertiaCounter;

  if (counter < 0 || MapCursor._preX === -1) {
    MapCursor._preX = x;
    MapCursor._preY = y;
  }
  if ((counter === CURSOL_MOVE_FRAME - 1) && (MapCursor._preY2 !== y || MapCursor._preX2 !== x)) {
    MapCursor._preX = MapCursor._preX2;
    MapCursor._preY = MapCursor._preY2;
  }
  MapCursor._preX2 = x;
  MapCursor._preY2 = y;

  if(counter > 0 && MapCursor._preX !== -1) {
    var rate = Math.pow((CURSOL_MOVE_FRAME - counter) / CURSOL_MOVE_FRAME * 5, 3);
    x = (this._preX + x * rate) / (1 + rate);
    y = (this._preY + y * rate) / (1 + rate);
  }
  //------------------------------------------

  if (pic !== null) {
    pic.drawStretchParts(x, y, GraphicsFormat.MAPCHIP_WIDTH, GraphicsFormat.MAPCHIP_HEIGHT, this._mapCursorSrcIndex * width, 0, width, height);
  }
}

})();
