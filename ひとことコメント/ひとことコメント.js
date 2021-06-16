/*--------------------------------------------------------------------------
  
　ひとことコメント.js

　■概要
  画面右側からひとことコメントを出します。
  ユニットの顔画像 / NPCの顔画像 / アイコン　のいずれかとセットで出すことができます。

  ■使用方法
  詳しい設定方法は同梱の画像をご覧ください。

  ① ユニットの顔画像＋テキスト を出したい場合
  イベントコマンドの「スクリプトの実行」から「コード実行」を選択し，以下のように記述してください。
  ------------
  var text = '表示させたい文言'
  IrohaPlugin._execute('unit', text);
  ------------
　さらに，「オリジナルデータ」タブで，発言者になるユニットを設定してください。
  
  ② NPCの顔画像＋テキスト を出したい場合
  イベントコマンドの「スクリプトの実行」から「コード実行」を選択し，以下のように記述してください。
  ------------
  var text = '表示させたい文言'
  IrohaPlugin._execute('npc', text);
  ------------
　さらに，「オリジナルデータ」タブの「数値1」をNPCリスト番号に，「数値2」をNPCリストIDに設定してください。

  ③ アイコン＋テキスト を出したい場合
  イベントコマンドの「スクリプトの実行」から「コード実行」を選択し，以下のように記述してください。
  ------------
  var text = '表示させたい文言'
  IrohaPlugin._execute('icon', text);
  ------------
　さらに，「オリジナルデータ」タブを以下のように設定してください。
  「数値1」：ランタイムデータを使うなら1，オリジナルデータを使うなら0
  「数値2」：アイコンのid
  「数値3」：アイコンのx座標（左から0，1，2，…でカウント）
  「数値4」：アイコンのy座標（上から0，1，2，…でカウント）

  ③ テキストのみ を出したい場合
  イベントコマンドの「スクリプトの実行」から「コード実行」を選択し，以下のように記述してください。
  ------------
  var text = '表示させたい文言'
  IrohaPlugin._execute('text', text);
  ------------

  ■注意事項
  ・すでに他のスクリプトで「ContentRenderer.drawUnitPartFace」（QBU氏作成）が使用されている場合は，
  　本スクリプトの該当箇所を削除してください。
  ・本スクリプトの「設定」から，コメントを表示するフレーム数や枠の長さを設定できます。

  ■バージョン履歴
  2021/06/15  新規作成
  2021/06/16　NPC，アイコン，テキストのみを表示できるようにアップデート

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

//----------------------------
// 設定
//----------------------------
//コメントを表示するフレーム数を設定
var IrohaPlugin_CharacterComment_AppearanceTime = 120;

//フェード処理を行うフレーム数を設定
var IrohaPlugin_CharacterComment_FadeTime = 6;

//枠の長さを設定
var IrohaPlugin_CharacterComment_WindowWidth = 480;

//表示するY座標を設定
var IrohaPlugin_CharacterComment_Y = 20;

//----------------------------
// 以下，本処理
//----------------------------
var IrohaPlugin = {
	_type: null,
	_cyclecounter: 0,
	_unit: null,
	_text:'',
	_handle: null,

	_execute: function(type, text) {
		this._cyclecounter = IrohaPlugin_CharacterComment_AppearanceTime;
		this._type = type;
		this._text = text;

		if (type == 'unit') {
			this._unit = root.getEventCommandObject().getOriginalContent().getUnit();
		} else if (type == 'npc') {
			var listid = root.getEventCommandObject().getOriginalContent().getValue(0) + 1;
			var dataid = root.getEventCommandObject().getOriginalContent().getValue(1);
			this._unit = root.getBaseData().getNpcList(listid).getData(dataid);
		} else if (type == 'icon') {
			var isRuntime = root.getEventCommandObject().getOriginalContent().getValue(0);
			var id = root.getEventCommandObject().getOriginalContent().getValue(1);
			var xSrc = root.getEventCommandObject().getOriginalContent().getValue(2);
			var ySrc = root.getEventCommandObject().getOriginalContent().getValue(3);
			this._handle = root.createResourceHandle(isRuntime, id, 0, xSrc, ySrc);
		}
	},

	_cyclechecker: function() {
		if (this._cyclecounter > 0) {
			this._cyclecounter--;
		}
		return (this._cyclecounter > 0)
	},

	drawParts: function() {
		var x = this._getPositionX();
		var y = this._getPositionY();
		
		this._drawMain(x, y);
	},
	
	_drawMain: function(x, y) {
		var width = this._getWindowWidth();
		var height = this._getWindowHeight();
		var textui = this._getWindowTextUI();
		var pic = textui.getUIImage();
		var time = IrohaPlugin_CharacterComment_AppearanceTime;
		var fadetime = IrohaPlugin_CharacterComment_FadeTime;
		var alpha = 255;

		if ((time - this._cyclecounter) < fadetime) {
			x = x + (this._cyclecounter - time + fadetime) * (width / fadetime);
//			alpha = alpha - (this._cyclecounter - time + fadetime) * (255 / fadetime);
		}
		if (this._cyclecounter < fadetime) {
			x = x + (fadetime - this._cyclecounter) * (width / fadetime);
//			alpha = alpha - (fadetime - this._cyclecounter) * (255 / fadetime);
		}
		WindowRenderer.drawStretchWindow(x, y, width, height, pic);
		
		x += this._getWindowXPadding();
		y += this._getWindowYPadding();
		this._drawContent(x, y, alpha);
	},
	
	_drawContent: function(x, y, alpha) {
		var text;
		var textui = this._getWindowTextUI();
		var font = textui.getFont();
		var color = textui.getColor();
		var length = this._getTextLength();
		var unit = this._unit;
		var text = this._text;
		var isReverse = false;

		var dx = 0;
		var dy = -7;

		if (this._type == 'unit' || this._type == 'npc') {
			dx = GraphicsFormat.FACE_WIDTH + 24;
			var tmpy = -13;
			ContentRenderer.drawUnitPartFace(x, y + tmpy, unit, isReverse, alpha);
		}
		if (this._type == 'icon') {
			dx = GraphicsFormat.ICON_WIDTH + 5;
			var tmpy = -12;
			GraphicsRenderer.drawImage(x, y + tmpy, this._handle, GraphicsType.ICON);
		}
		TextRenderer.drawAlphaText(x + dx, y + dy, text, length, color, alpha, font);
	},
	
	_getTextLength: function() {
		return this._getWindowWidth() - DefineControl.getWindowXPadding();
	},
	
	_getPositionX: function() {
		return root.getGameAreaWidth() - this._getWindowWidth();
	},
	
	_getPositionY: function() {
		return IrohaPlugin_CharacterComment_Y;
	},
	
	_getWindowXPadding: function() {
		return DefineControl.getWindowXPadding();
	},
	
	_getWindowYPadding: function() {
		return DefineControl.getWindowYPadding();
	},
	
	_getWindowWidth: function() {
		return IrohaPlugin_CharacterComment_WindowWidth;
	},
	
	_getWindowHeight: function() {
		return 33;
	},
	
	_getWindowTextUI: function() {
		return root.queryTextUI('default_window');
	}
}

ContentRenderer.drawUnitPartFace = function(x, y, unit, isReverse, alpha) {
	var handle = unit.getFaceResourceHandle();
	var pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
	var xSrc, ySrc
	var destWidth = GraphicsFormat.FACE_WIDTH;
	var destHeight = 27;
	var srcWidth = destWidth;
	var srcHeight = GraphicsFormat.FACE_HEIGHT;	

	if (pic === null) {
		return;
	}
	pic.setReverse(isReverse);
	pic.setAlpha(alpha);	
	xSrc = handle.getSrcX() * srcWidth;
	ySrc = handle.getSrcY() * srcHeight + Math.floor(GraphicsFormat.FACE_HEIGHT / 3);
	pic.drawStretchParts(x, y, destWidth, destHeight, xSrc, ySrc, srcWidth, destHeight);
};

(function() {

var alias01 = SceneManager.drawSceneManagerCycle;
SceneManager.drawSceneManagerCycle = function() {
	alias01.call(this);

	var boo = IrohaPlugin._cyclechecker();
	if (boo == false) { 
		return;
	}
	IrohaPlugin.drawParts();
}

//タイトル画面に戻ったときcounterを0にする
var alias02 = TitleScene._prepareSceneMemberData;
TitleScene._prepareSceneMemberData = function() {
	alias02.call(this);
	IrohaPlugin._cyclecounter = 0;
}

})();
