/*--------------------------------------------------------------------------

イベントコマンド：キャラクリエイト

■概要
　キャラクリエイト（任意の顔グラフィックを重ね合わせて1枚のように見せる機能）を呼び出します。
　イベントコマンドで「スクリプトの実行 > イベントコマンドの呼び出し」を指定し、
　「オブジェクト名」に CharaCreateCommand を入力してください。
　「オリジナルデータ」タブの「ユニット」で指定したユニットの顔画像が、
　キャラクリエイトで作成したものに切り替わります。
　※unit.custom.charaIndexArr に重ね合わせる画像のindexを格納することで情報を保存しています。

■詳しい使い方
　01_キャラクリエイト_データ集.js を参照してください。

■バージョン履歴
　2023/01/14  新規作成

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

(function () {
// ------------------------------------------
// コマンド定義
// ------------------------------------------
CommandActionType.CHARACREATE = 51;

var alias01 = CommandMixer._getScreenLauncher;
CommandMixer._getScreenLauncher = function (commandLayout) {
	var screenLauncher = null;
	var commandActionType = commandLayout.getCommandActionType();

	if (commandActionType === CommandActionType.CHARACREATE) {
		screenLauncher = CharaCreateScreenLauncher;
		return screenLauncher.isLaunchable() ? screenLauncher : null;
	}

	return alias01.call(this, commandLayout);
}

var CharaCreateScreenLauncher = defineObject(BaseScreenLauncher,
{
	_getScreenObject: function () {
		return CharaCreateScreen;
	}
});

//-------------------------------------------
// ScriptExecuteEventCommandクラス
//-------------------------------------------
var alias02 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
	alias02.call(this, groupArray);

	// CharaCreateCommandを追加
	groupArray.appendObject(CharaCreateCommand);
};

})();

//-------------------------------------------
// CharaCreateCommandクラス
//-------------------------------------------
var CharaCreateCommand = defineObject(BaseEventCommand,
{
	_CharaCreateScreen: null,

	enterEventCommandCycle: function () {
		this._prepareEventCommandMemberData();

		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}

		return this._completeEventCommandMemberData();
	},

	moveEventCommandCycle: function () {
		if (this._CharaCreateScreen.moveScreenCycle() !== MoveResult.CONTINUE) {
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},

	drawEventCommandCycle: function () {
		this._CharaCreateScreen.drawScreenCycle();
	},

	getEventCommandName: function () {
		return 'CharaCreateCommand';
	},

	isEventCommandSkipAllowed: function () {
		// スキップを許可しないイベントコマンド(選択肢など)は、これをfalseを返す
		return false;
	},

	_prepareEventCommandMemberData: function () {
		this._CharaCreateScreen = createObject(CharaCreateScreen);
	},

	_checkEventCommand: function () {
		return true;
	},

	_completeEventCommandMemberData: function () {
		var screenParam = this._createScreenParam();
		this._CharaCreateScreen.setScreenData(screenParam);

		return EnterResult.OK;
	},

	_createScreenParam: function () {
		var screenParam = {};
		var eventCommandData = root.getEventCommandObject();
		screenParam.unit = eventCommandData.getOriginalContent().getUnit();
		return screenParam;
	}
});

var CharaCreateScreenMode = {
	PARTSELECT: 0,
	CHIPSELECT: 1,
	QUESTION: 2,
	END: 9
};

// ------------------------------------------
// CharaCreateScreenクラス
// ------------------------------------------
var CharaCreateScreen = defineObject(BaseScreen,
{
	_PartSelectWindow: null,
	_ChipSelectWindow: null,
	_PreviewWindow: null,
	_questionWindow: null,
	_indexArr: null,
	_targetUnit: null,

	setScreenData: function (screenParam) {
		this._prepareScreenMemberData(screenParam);
		this._completeScreenMemberData(screenParam);
	},

	moveScreenCycle: function () {
		var result = MoveResult.CONTINUE;
		var mode = this.getCycleMode();

		if (mode === CharaCreateScreenMode.PARTSELECT) {
			mode = this._PartSelectWindow.moveWindow();
			this.changeCycleMode(mode);

			// 選択中のパーツを変更
			if (this._PartSelectWindow.isIndexChanged()) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();

				var commandList = StructureBuilder.buildDataList();
				commandList.setDataArray(CHARACTER_CREATE_PARTS[partIndex].parts);
				this._ChipSelectWindow.setselectPage(commandList);

				this._ChipSelectWindow._scrollbar.setIndex(this._indexArr[partIndex]);
			}

			// チップ選択画面に移行
			if (mode === CharaCreateScreenMode.CHIPSELECT) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();
				this._ChipSelectWindow._scrollbar.setIndex(this._indexArr[partIndex]);
			}
		}
		else if (mode === CharaCreateScreenMode.CHIPSELECT) {
			mode = this._ChipSelectWindow.moveWindow();
			this.changeCycleMode(mode);

			// 選択中のチップを変更
			if (this._ChipSelectWindow.isIndexChanged()) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();
				var chipIndex = this._ChipSelectWindow._scrollbar.getIndex();

				this._indexArr[partIndex] = chipIndex;
				this._PreviewWindow.setselectPage(this._indexArr);

				var commandList = StructureBuilder.buildDataList();
				commandList.setDataArray(this._indexArr);
				this._PartSelectWindow.setselectPage2(commandList);
			}
		}
		else if (mode === CharaCreateScreenMode.QUESTION) {
			if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
				// カスタムパラメータに書き込んで処理を終了
				if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
					this._targetUnit.custom.charaIndexArr = this._indexArr;

					result = MoveResult.END;
				}
				// パーツ選択に戻る
				else {
					mode = CharaCreateScreenMode.PARTSELECT;
					this.changeCycleMode(mode);
				}
			}
		}

		return result;
	},

	drawScreenCycle: function () {
		var x = (root.getGameAreaWidth() - this._PartSelectWindow.getWindowWidth() - this._ChipSelectWindow.getWindowWidth() - this._PreviewWindow.getWindowWidth())/2;
		var y = (root.getGameAreaHeight() - this._PartSelectWindow.getWindowHeight())/2;

		var width1 = this._PartSelectWindow.getWindowWidth();
		var width2 = this._ChipSelectWindow.getWindowWidth();

		this._PartSelectWindow.drawWindow(x, y);
		this._ChipSelectWindow.drawWindow(x + width1, y);
		this._PreviewWindow.drawWindow(x + width1 + width2, y);

		var mode = this.getCycleMode();
		var x = (root.getGameAreaWidth() - this._questionWindow.getWindowWidth())/2;
		var y = (root.getGameAreaHeight() - this._questionWindow.getWindowHeight())/2;
		if (mode === CharaCreateScreenMode.QUESTION) {
			this._questionWindow.drawWindow(x, y);
		}
	},

	_prepareScreenMemberData: function (screenParam) {
		this._PartSelectWindow = createWindowObject(PartSelectWindow, this);
		this._ChipSelectWindow = createWindowObject(ChipSelectWindow, this);
		this._PreviewWindow = createWindowObject(PreviewWindow, this);
		this._questionWindow = createWindowObject(QuestionWindow, this);

		this._indexArr = [];
		for (var i = 0; i < CHARACTER_CREATE_PARTS.length; i++) {
			var index = CHARACTER_CREATE_PARTS[i].default_index;
			this._indexArr.push(index);
		}

		this._targetUnit = screenParam.unit;
	},

	_completeScreenMemberData: function (screenParam) {
		this._PartSelectWindow.setselectWindowData();
		var commandList = StructureBuilder.buildDataList();
		commandList.setDataArray(CHARACTER_CREATE_PARTS);
		this._PartSelectWindow.setselectPage(commandList);

		commandList.setDataArray(this._indexArr);
		this._PartSelectWindow.setselectPage2(commandList);

		this._ChipSelectWindow.setselectWindowData();
		var commandList = StructureBuilder.buildDataList();
		commandList.setDataArray(CHARACTER_CREATE_PARTS[0].parts);
		this._ChipSelectWindow.setselectPage(commandList);

		this._PreviewWindow.setselectPage(this._indexArr);

		this._questionWindow.setQuestionMessage('キャラクターを確定します。よろしいですか？');
		this._questionWindow.setQuestionActive(true);
	}
});

// ------------------------------------------
// PartSelectWindowクラス
// ------------------------------------------
var PartSelectWindow = defineObject(BaseWindow,
{
	_scrollbar: null,
	_scrollbar2: null,

	setselectWindowData: function () {
		this._scrollbar = createScrollbarObject(PartSelectScrollbar, this);
		this._scrollbar.setScrollFormation(1, getCharaCreateScrollbarIndex());
		this._scrollbar.setActive(true);

		this._scrollbar2 = createScrollbarObject(CurrentPartScrollbar, this);
		this._scrollbar2.setScrollFormation(1, getCharaCreateScrollbarIndex());
		this._scrollbar2.setActive(false);
	},

	setselectPage: function (commandList) {
		this._scrollbar.setDataList(commandList);
	},

	setselectPage2: function (commandList) {
		this._scrollbar2.setDataList(commandList);
	},

	moveWindowContent: function () {
		this._scrollbar.enableSelectCursor(true);
		var input = this._scrollbar.moveInput();

		// 決定キーを押下した場合
		if (input === ScrollbarInput.SELECT) {
			this._scrollbar.setActive(false);
			return CharaCreateScreenMode.CHIPSELECT;
		}
		// キャンセルキーを押下した場合
		else if (input === ScrollbarInput.CANCEL) {
			this._scrollbar.setActive(false);
			return CharaCreateScreenMode.QUESTION;
		}
		else {
			return CharaCreateScreenMode.PARTSELECT;
		}
	},

	drawWindowContent: function (x, y) {
		this._scrollbar.drawScrollbar(x, y);
		this._scrollbar2.drawScrollbar(x + this._scrollbar.getScrollbarWidth() + this.getWindowXPadding(), y);
	},

	isIndexChanged: function() {
		return this._scrollbar.checkAndUpdateIndex();
	},

	getWindowWidth: function () {
		return this._scrollbar.getScrollbarWidth() + this._scrollbar2.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},

	getWindowHeight: function () {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2);
	}
});

var PartSelectScrollbar = defineObject(BaseScrollbar,
{
	drawScrollContent: function (x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		TextRenderer.drawKeywordText(x, y, object.name, -1, ColorValue.KEYWORD, font);
	},

	getObjectWidth: function () {
		return 150 + HorizontalLayout.OBJECT_WIDTH;
	},

	getObjectHeight: function () {
		return 25;
	}
});

var CurrentPartScrollbar = defineObject(BaseScrollbar,
{
	drawScrollContent: function (x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var color = textui.getColor();

		var text = CHARACTER_CREATE_PARTS[index].parts[object];
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	getObjectWidth: function () {
		return 120 + HorizontalLayout.OBJECT_WIDTH;
	},

	getObjectHeight: function () {
		return 25;
	}
});
	

// ------------------------------------------
// ChipSelectWindowクラス
// ------------------------------------------
var ChipSelectWindow = defineObject(BaseWindow,
{
	_scrollbar: null,
	_unit: null,
	_SkillTreeGetArr: null,
	_SkillCount: 0,
	_SkillCost: 0,

	setselectWindowData: function () {
		this._scrollbar = createScrollbarObject(ChipSelectScrollbar, this);
		this._scrollbar.setScrollFormation(1, getCharaCreateScrollbarIndex());
		this._scrollbar.setActive(false);
	},

	setselectPage: function (commandList) {
		this._scrollbar.setDataList(commandList);
	},

	moveWindowContent: function () {
		this._scrollbar.enableSelectCursor(true);
		var input = this._scrollbar.moveInput();

		// キャンセルキーを押下した場合
		if (input === ScrollbarInput.CANCEL) {
			this._scrollbar.setActive(false);
			return CharaCreateScreenMode.PARTSELECT;
		}
		// 決定キーを押下した場合
		if (input === ScrollbarInput.SELECT) {
			// 決定キーを押した場合の処理
		}

		return CharaCreateScreenMode.CHIPSELECT;
	},

	drawWindowContent: function (x, y) {
		this._scrollbar.drawScrollbar(x, y);
	},

	isIndexChanged: function() {
		return this._scrollbar.checkAndUpdateIndex();
	},

	getWindowWidth: function () {
		return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},

	getWindowHeight: function () {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2);
	}
});

var ChipSelectScrollbar = defineObject(BaseScrollbar,
{
	drawScrollContent: function (x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var color = textui.getColor();

		TextRenderer.drawKeywordText(x, y, object, -1, color, font);
	},

	getObjectWidth: function () {
		return 120 + HorizontalLayout.OBJECT_WIDTH;
	},

	getObjectHeight: function () {
		return 25;
	}
});

// ------------------------------------------
// PreviewWindowクラス
// ------------------------------------------
var PreviewWindow = defineObject(BaseWindow,
{
	_width: 0,
	_height: 0,
	_indexArr: null,

	setselectPage: function (indexArr) {
		this._indexArr = indexArr;
	},

	drawWindowContent: function (x, y) {
		var dx = this.getWindowWidth() / 2 - GraphicsFormat.FACE_WIDTH / 2 - 20;
		var dy = this.getWindowHeight() / 2 - GraphicsFormat.FACE_HEIGHT / 2 - 20;

		for (var i = this._indexArr.length - 1; i >= 0; i--) {
			var id = CHARACTER_CREATE_PARTS[i].id;

			var chipIndex = this._indexArr[i];
			var srcX = chipIndex % 6;
			var srcY = Math.floor(chipIndex / 6);

			var handle = root.createResourceHandle(false, id, 0, srcX, srcY);
			GraphicsRenderer.drawImage(x + dx, y + dy, handle, GraphicsType.FACE);	
		}
	},

	getWindowWidth: function () {
		return 200;
	},

	getWindowHeight: function () {
		return 200;
	}
});

var getCharaCreateScrollbarIndex = function() {
	return Math.max(CHARACTER_CREATE_PARTS.length, 12)
};

// -----------------------------------------
// 顔画像の描画処理を上書き
// -----------------------------------------
(function () {
var alias03 = ContentRenderer.drawUnitFace;
ContentRenderer.drawUnitFace = function(x, y, unit, isReverse, alpha) {
	if (unit.custom.charaIndexArr) {
		var indexArr = unit.custom.charaIndexArr;
		for (var i = indexArr.length - 1; i >= 0; i--) {
			var id = CHARACTER_CREATE_PARTS[i].id;

			var chipIndex = indexArr[i];
			var srcX = chipIndex % 6;
			var srcY = Math.floor(chipIndex / 6);

			var handle = root.createResourceHandle(false, id, 0, srcX, srcY);
			GraphicsRenderer.drawImage(x, y, handle, GraphicsType.FACE);	
		}
	}
	else {
		alias03.call(this, x, y, unit, isReverse, alpha);
	}
}
})();