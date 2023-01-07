/*--------------------------------------------------------------------------

【開発者向け】ヘルプ機能

■概要
　出撃準備コマンド・マップコマンド・拠点コマンドに「ヘルプ」を追加します。
　なお、本プラグインは開発者様向けのものであり、改変して利用いただくことを前提としております。
　コード中のコメントをよく読んでご利用ください。

■バージョン履歴
　2023/01/07  新規作成

■対応バージョン
　SRPG Studio Version:1.267

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function() {

// ------------------------------------------
// 出撃準備コマンドへのヘルプ追加
// ※不要ならまるごとコメントアウトしてください。
// ------------------------------------------
var alias01 = SetupCommand.configureCommands;
SetupCommand.configureCommands = function(groupArray) {
	alias01.call(this, groupArray);

	var commandIndex = groupArray.length - 2; //下から2番目に表示
	groupArray.insertObject(SetupCommand.HelpInfoList, commandIndex);
}

// ------------------------------------------
// マップコマンドへのヘルプ追加
// ※不要ならまるごとコメントアウトしてください。
// ------------------------------------------
var alias02 = MapCommand.configureCommands;
MapCommand.configureCommands = function(groupArray) {
	alias02.call(this, groupArray);

	var commandIndex = groupArray.length - 2; //下から2番目に表示
	groupArray.insertObject(SetupCommand.HelpInfoList, commandIndex);
}

// ------------------------------------------
// 拠点コマンドへのヘルプ追加
// ※不要ならまるごとコメントアウトしてください。
// ------------------------------------------
var alias03 = RestCommand.configureCommands;
RestCommand.configureCommands = function(groupArray) {
	alias03.call(this, groupArray);

	var commandIndex = groupArray.length - 2; //下から2番目に表示
	groupArray.insertObject(SetupCommand.HelpInfoList, commandIndex);
}

})();

// ------------------------------------------
// SetupCommand.HelpInfoList
// ------------------------------------------
SetupCommand.HelpInfoList = defineObject(BaseListCommand, 
{
	_HelpInfoListScreen: null,

	openCommand: function() {
		var screenParam = this._createScreenParam();
		this._HelpInfoListScreen = createObject(HelpInfoListScreen);
		SceneManager.addScreen(this._HelpInfoListScreen, screenParam);
	},
	
	moveCommand: function() {
		if (SceneManager.isScreenClosed(this._HelpInfoListScreen)) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},

	_createScreenParam: function() {
		return null;
	},

	getCommandName: function() {
		return 'ヘルプ'; // コマンド名。適宜変更してください。
	}
});

// ------------------------------------------
// HelpInfoListScreenクラス
// ------------------------------------------
var HelpInfoListScreen = defineObject(BaseScreen,
{
	_HelpSelectWindow: null,
	_HelpInfoWindow: null,

	setScreenData: function(screenParam) {
		this._prepareScreenMemberData(screenParam);
		this._completeScreenMemberData(screenParam);
	},

	_prepareScreenMemberData: function(screenParam) {
		this._HelpSelectWindow = createWindowObject(HelpSelectWindow, this);
		this._HelpInfoWindow = createWindowObject(HelpInfoWindow, this);
	},
	
	_completeScreenMemberData: function(screenParam) {
		this._HelpSelectWindow.setselectWindowData();

		// ヘルプページの項目を追加
		var groupArray = [];
		groupArray.appendObject(HelpInfo.PAGE01);
		groupArray.appendObject(HelpInfo.PAGE02);
		groupArray.appendObject(HelpInfo.PAGE03);

		var commandList = StructureBuilder.buildDataList();
		commandList.setDataArray(groupArray);
		this._HelpSelectWindow.setselectPage(commandList);

		var helpInfo = this._HelpSelectWindow.getCurrentHelpInfo();
		this._HelpInfoWindow.setHelpInfo(helpInfo);
	},

	moveScreenCycle: function() {
		var result = this._HelpSelectWindow.moveWindow();

		if (this._HelpSelectWindow.isIndexChanged()) {
			var helpInfo = this._HelpSelectWindow.getCurrentHelpInfo();
			this._HelpInfoWindow.setHelpInfo(helpInfo);
		}

		this._HelpInfoWindow.moveWindow();

		return result;
	},

	drawScreenCycle: function() {
		var selectX = 40;
		var selectY = 80;
		this._HelpSelectWindow.drawWindow(selectX, selectY);

		var infoX = selectX + this._HelpSelectWindow.getWindowWidth();
		var infoY = selectY;
		this._HelpInfoWindow.drawWindow(infoX, infoY);
	},

	getScreenInteropData: function() {
		return root.queryScreen('UnitMenu');
	},

	drawScreenBottomText: function(textui) {
	},

	getScreenTitleName: function() {
		return 'ヘルプ'; //画面上のタイトルとして入る文字。適宜変更してください。
	}
});

// ------------------------------------------
// HelpSelectWindowクラス
// ※ヘルプ画面左側のウインドウ
// ------------------------------------------
var HelpSelectWindow = defineObject(BaseWindow,
{
	_scrollbar: null,

	setselectWindowData: function () {
		var count = 5; //1画面に入るヘルプページの数。適宜変更してください。

		this._scrollbar = createScrollbarObject(HelpInfoScrollbar, this);
		this._scrollbar.setScrollFormation(1, count);
		this._scrollbar.setActive(true);
	},

	setselectPage: function (commandList) {
		this._scrollbar.setDataList(commandList);
	},

	moveWindowContent: function() {
		this._scrollbar.enableSelectCursor(true);
		var input = this._scrollbar.moveInput();

		// キャンセルキーを押下した場合
		if (input === ScrollbarInput.CANCEL) {
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},

	drawWindowContent: function (x, y) {
		this._scrollbar.drawScrollbar(x, y);
	},

	isIndexChanged: function() {
		return this._scrollbar.checkAndUpdateIndex();
	},

	getCurrentHelpInfo: function() {
		return this._scrollbar.getObject();
	},

	getWindowWidth: function () {
		return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},

	getWindowHeight: function () {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2);
	}
});

// ------------------------------------------
// HelpInfoScrollbarクラス
// ------------------------------------------
var HelpInfoScrollbar = defineObject(BaseScrollbar,
{
	drawScrollContent: function (x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		TextRenderer.drawKeywordText(x, y, object.getText(), -1, ColorValue.DEFAULT, font);
	},

	getObjectWidth: function () {
		return 150;
	},

	getObjectHeight: function () {
		return 30;
	}
});

// ------------------------------------------
// HelpInfoWindowクラス
// ※ヘルプ画面右側のウインドウ
// ------------------------------------------
var HelpInfoWindow = defineObject(BaseWindow,
{
	_helpInfo: null,

	setHelpInfo: function (helpInfo) {
		this._helpInfo = helpInfo;
	},

	moveWindowContent: function() {
		this._helpInfo.moveHelpInfo();
	},

	drawWindowContent: function (x, y) {
		this._helpInfo.drawHelpInfo(x, y);
	},

	getWindowWidth: function () {
		return root.getGameAreaWidth() - 260;
	},

	getWindowHeight: function () {
		return root.getGameAreaHeight() - 120;
	}
});

// ------------------------------------------
// BaseHelpInfo
// ------------------------------------------
var BaseHelpInfo = defineObject(BaseObject,
{
	getText: function() {
		return '';
	},

	moveHelpInfo: function() {
	},

	drawHelpInfo: function(x, y) {
	},

	getHelpInfoTextUI: function() {
		return root.queryTextUI('default_window');
	}
});

var HelpInfo = {};

// ------------------------------------------
// 以下はお好きに編集してください。
// 作成したヘルプページは、
//  HelpInfoListScreen._completeScreenMemberData
// にて項目を追加してください。
// ------------------------------------------
HelpInfo.PAGE01 = defineObject(BaseHelpInfo,
{
	getText: function() {
		return 'SAMPLE_PAGE01';
	},

	drawHelpInfo: function(x, y) {
		var textui = this.getHelpInfoTextUI();
		var font = textui.getFont();
		var color = textui.getColor();

		TextRenderer.drawKeywordText(x, y, 'ヘルプのサンプル', -1, color, font);
	}
});

HelpInfo.PAGE02 = defineObject(BaseHelpInfo,
{
	getText: function() {
		return 'SAMPLE_PAGE02';
	},

	drawHelpInfo: function(x, y) {
		var textui = this.getHelpInfoTextUI();
		var font = textui.getFont();
		var color = textui.getColor();

		TextRenderer.drawKeywordText(x, y, '画像表示のサンプル', -1, color, font);

		// 例として、キャラチップ（ランタイム・ID0番）を表示
		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.CHARCHIP, true);
		var pic = list.getDataFromId(0);
		pic.draw(x, y + 20);
	}
});

HelpInfo.PAGE03 = defineObject(BaseHelpInfo,
{
	_page: 0,
	_pageCnt: 3,

	getText: function() {
		return 'SAMPLE_PAGE03';
	},

	moveHelpInfo: function() {
		if (InputControl.isInputAction(InputType.LEFT)) {
			MediaControl.soundDirect('menutargetchange');
			this._page--;
		}
		else if (InputControl.isInputAction(InputType.RIGHT)) {
			MediaControl.soundDirect('menutargetchange');
			this._page++;
		}

		if (this._page >= this._pageCnt) {
			this._page = 0;
		}
		else if (this._page < 0) {
			this._page = this._pageCnt - 1;
		}
	},

	drawHelpInfo: function(x, y) {
		var textui = this.getHelpInfoTextUI();
		var font = textui.getFont();
		var color = textui.getColor();

		TextRenderer.drawKeywordText(x, y, '画面切替えのサンプル(左右キーで切替え)', -1, color, font);

		y += 30;
		if (this._page === 0) {
			TextRenderer.drawKeywordText(x, y, 'ページ1', -1, color, font);

			// 例として、キャラチップ（ランタイム・ID1番）を表示
			var list = root.getBaseData().getGraphicsResourceList(GraphicsType.CHARCHIP, true);
			var pic = list.getDataFromId(1);
			pic.draw(x, y + 20);
		}
		else if (this._page === 1) {
			TextRenderer.drawKeywordText(x, y, 'ページ2', -1, color, font);

			// 例として、キャラチップ（ランタイム・ID2番）を表示
			var list = root.getBaseData().getGraphicsResourceList(GraphicsType.CHARCHIP, true);
			var pic = list.getDataFromId(2);
			pic.draw(x, y + 20);
		}	
		else if (this._page === 2) {
			TextRenderer.drawKeywordText(x, y, 'ページ3', -1, color, font);

			// 例として、キャラチップ（ランタイム・ID3番）を表示
			var list = root.getBaseData().getGraphicsResourceList(GraphicsType.CHARCHIP, true);
			var pic = list.getDataFromId(3);
			pic.draw(x, y + 20);
		}	
	}
});
