/*--------------------------------------------------------------------------

イベントコマンド：立ち絵キャラクリエイト

■概要
　立ち絵キャラクリエイト（任意の立ち絵を重ね合わせて1枚のように見せる機能）を呼び出します。
　イベントコマンドで「スクリプトの実行 > イベントコマンドの呼び出し」を指定し、
　「オブジェクト名」に CharaIllustCreateCommand を入力してください。
　「オリジナルデータ」タブの「ユニット」で指定したユニットの立ち絵画像が、
　キャラクリエイトで作成したものに切り替わります（表情IDにかかわらず、一律に切り替わります）。
　※unit.custom.charaIndexArr に重ね合わせる画像のindexを格納することで情報を保存しています。

■詳しい使い方
　01_立ち絵キャラクリエイト_データ集.js を参照してください。

■表情IDごとの指定パーツ強制上書き機能について
　ユニットのカスタムパラメータに以下のように記述することで、
　クリエイトした立ち絵データのパーツを無視して、強制的に上書きすることができます。

(例) 表情が「微笑み」のときは「目→微笑む目.png」「口→にっこり.png」で上書き
     表情が「怒り」のときは「目→怒りの目.png」で上書き
     
{
  charaExpressionOverwrite:
  [
    {
      expressionId: 1, //微笑み
      overWrite:
      [
        {categoryName: '目', picName: '微笑む目.png'},
        {categoryName: '口', picName: 'にっこり.png'}
      ]
    },
    {
      expressionId: 7, //怒り
      overWrite:
      [
        {categoryName: '目', picName: '怒りの目.png'}
      ]
    }
  ]
}

※expressionIdは、「立ち絵画像 → 表情の編集」に対応しています。
　「通常」=0、「微笑む」=1、「キメ顔」=2、… といった具合です。

■注意点
　① 立ち絵のサイズには規格が存在しないため、導入する立ち絵のサイズやゲームサイズによっては、
　　レイアウトが不自然になる可能性があります。
　　本プラグイン内の数値（表示する座標）を適宜いじって調整してください。

　② 本プラグインでは、公式でサポートされている立ち絵表示機能（メッセージ表示画面のみ）で
　　キャラクリエイトで作成した立ち絵が表示されるようにしています。
　　外部プラグインにより、その他の画面で立ち絵を表示できるようにしている場合は、
　　そのメソッドにも加筆する必要があることにご注意ください。

■バージョン履歴
　2023/01/20  表情IDごとに指定パーツを強制上書きする機能を追加
　2023/01/19  新規作成

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
CommandActionType.CHARAILLUSTCREATE = 52;

var alias01 = CommandMixer._getScreenLauncher;
CommandMixer._getScreenLauncher = function (commandLayout) {
	var screenLauncher = null;
	var commandActionType = commandLayout.getCommandActionType();

	if (commandActionType === CommandActionType.CHARAILLUSTCREATE) {
		screenLauncher = CharaIllustCreateScreenLauncher;
		return screenLauncher.isLaunchable() ? screenLauncher : null;
	}

	return alias01.call(this, commandLayout);
}

var CharaIllustCreateScreenLauncher = defineObject(BaseScreenLauncher,
{
	_getScreenObject: function () {
		return CharaIllustCreateScreen;
	}
});

//-------------------------------------------
// ScriptExecuteEventCommandクラス
//-------------------------------------------
var alias02 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
	alias02.call(this, groupArray);

	// CharaIllustCreateCommandを追加
	groupArray.appendObject(CharaIllustCreateCommand);
};

})();

//-------------------------------------------
// CharaIllustCreateCommandクラス
//-------------------------------------------
var CharaIllustCreateCommand = defineObject(BaseEventCommand,
{
	_CharaIllustCreateScreen: null,

	enterEventCommandCycle: function () {
		this._prepareEventCommandMemberData();

		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}

		return this._completeEventCommandMemberData();
	},

	moveEventCommandCycle: function () {
		if (this._CharaIllustCreateScreen.moveScreenCycle() !== MoveResult.CONTINUE) {
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},

	drawEventCommandCycle: function () {
		this._CharaIllustCreateScreen.drawScreenCycle();
	},

	getEventCommandName: function () {
		return 'CharaIllustCreateCommand';
	},

	isEventCommandSkipAllowed: function () {
		// スキップを許可しないイベントコマンド(選択肢など)は、これをfalseを返す
		return false;
	},

	_prepareEventCommandMemberData: function () {
		this._CharaIllustCreateScreen = createObject(CharaIllustCreateScreen);
	},

	_checkEventCommand: function () {
		return true;
	},

	_completeEventCommandMemberData: function () {
		var screenParam = this._createScreenParam();
		this._CharaIllustCreateScreen.setScreenData(screenParam);

		return EnterResult.OK;
	},

	_createScreenParam: function () {
		var screenParam = {};
		var eventCommandData = root.getEventCommandObject();
		screenParam.unit = eventCommandData.getOriginalContent().getUnit();
		return screenParam;
	}
});

var CharaIllustCreateScreenMode = {
	PARTSELECT: 0,
	CHIPSELECT: 1,
	QUESTION: 2,
	END: 9
};

// ------------------------------------------
// CharaIllustCreateScreenクラス
// ------------------------------------------
var CharaIllustCreateScreen = defineObject(BaseScreen,
{
	_PartSelectWindow: null,
	_ChipSelectWindow: null,
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

		if (mode === CharaIllustCreateScreenMode.PARTSELECT) {
			mode = this._PartSelectWindow.moveWindow();
			this.changeCycleMode(mode);

			// 選択中のパーツを変更
			if (this._PartSelectWindow.isIndexChanged()) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();

				this._ChipSelectWindow.setselectPage(CHARACTER_CREATE_MATERIAL_ARRAY[partIndex]);
				this._ChipSelectWindow._scrollbar.setIndex(this._indexArr[partIndex]);
			}

			// チップ選択画面に移行
			if (mode === CharaIllustCreateScreenMode.CHIPSELECT) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();
				this._ChipSelectWindow._scrollbar.setIndex(this._indexArr[partIndex]);
			}
		}
		else if (mode === CharaIllustCreateScreenMode.CHIPSELECT) {
			mode = this._ChipSelectWindow.moveWindow();
			this.changeCycleMode(mode);

			// 選択中のチップを変更
			if (this._ChipSelectWindow.isIndexChanged()) {
				var partIndex = this._PartSelectWindow._scrollbar.getIndex();
				var chipIndex = this._ChipSelectWindow._scrollbar.getIndex();

				this._indexArr[partIndex] = chipIndex;
				this._picArr[partIndex] = getCharaIllustMaterialPic(partIndex, chipIndex);

				var commandList = StructureBuilder.buildDataList();
				commandList.setDataArray(this._indexArr);
				this._PartSelectWindow.setselectPage2(commandList);
			}
		}
		else if (mode === CharaIllustCreateScreenMode.QUESTION) {
			if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
				// カスタムパラメータに書き込んで処理を終了
				if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
					this._targetUnit.custom.charaIndexArr = this._indexArr;

					result = MoveResult.END;
				}
				// パーツ選択に戻る
				else {
					mode = CharaIllustCreateScreenMode.PARTSELECT;
					this.changeCycleMode(mode);
				}
			}
		}

		return result;
	},

	drawScreenCycle: function () {
		var x = 30;
		var y = (root.getGameAreaHeight() - this._PartSelectWindow.getWindowHeight())/2;

		var width1 = this._PartSelectWindow.getWindowWidth();

		this._PartSelectWindow.drawWindow(x, y);
		this._ChipSelectWindow.drawWindow(x + width1, y);

		this.drawPreviewIllust(x, y);

		var mode = this.getCycleMode();
		var x = (root.getGameAreaWidth() - this._questionWindow.getWindowWidth())/2;
		var y = (root.getGameAreaHeight() - this._questionWindow.getWindowHeight())/2;
		if (mode === CharaIllustCreateScreenMode.QUESTION) {
			this._questionWindow.drawWindow(x, y);
		}
	},

	drawPreviewIllust: function (x, y) {
		var width1 = this._PartSelectWindow.getWindowWidth();
		var width2 = this._ChipSelectWindow.getWindowWidth();

		for (var i = this._indexArr.length - 1; i >= 0; i--) {
			this._picArr[i].draw(x + width1 + width2 - 50, 0);
		}
	},

	_prepareScreenMemberData: function (screenParam) {
		this._PartSelectWindow = createWindowObject(PartSelectWindow, this);
		this._ChipSelectWindow = createWindowObject(ChipSelectWindow, this);
		this._questionWindow = createWindowObject(QuestionWindow, this);

		this._indexArr = [];
		this._picArr = [];
		for (var i = 0; i < CHARACTER_CREATE_MATERIAL_ARRAY.length; i++) {
			var index = 0;
			this._indexArr.push(index);
			this._picArr.push(getCharaIllustMaterialPic(i, index));
		}

		this._targetUnit = screenParam.unit;
	},

	_completeScreenMemberData: function (screenParam) {
		this._PartSelectWindow.setselectWindowData();
		var commandList = StructureBuilder.buildDataList();
		commandList.setDataArray(CHARACTER_CREATE_MATERIAL_ARRAY);
		this._PartSelectWindow.setselectPage(commandList);

		commandList.setDataArray(this._indexArr);
		this._PartSelectWindow.setselectPage2(commandList);

		this._ChipSelectWindow.setselectWindowData();
		this._ChipSelectWindow.setselectPage(CHARACTER_CREATE_MATERIAL_ARRAY[0]);

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
		this._scrollbar.setScrollFormation(1, getCharaIllustCreateScrollbarIndex());
		this._scrollbar.setActive(true);

		this._scrollbar2 = createScrollbarObject(CurrentPartScrollbar, this);
		this._scrollbar2.setScrollFormation(1, getCharaIllustCreateScrollbarIndex());
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
			return CharaIllustCreateScreenMode.CHIPSELECT;
		}
		// キャンセルキーを押下した場合
		else if (input === ScrollbarInput.CANCEL) {
			this._scrollbar.setActive(false);
			return CharaIllustCreateScreenMode.QUESTION;
		}
		else {
			return CharaIllustCreateScreenMode.PARTSELECT;
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
		return this._scrollbar.getScrollbarWidth() + this._scrollbar2.getScrollbarWidth() + (this.getWindowXPadding() * 3);
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
		TextRenderer.drawKeywordText(x, y, object, -1, ColorValue.KEYWORD, font);
	},

	getObjectWidth: function () {
		return 100 + HorizontalLayout.OBJECT_WIDTH;
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

		var category = CHARACTER_CREATE_MATERIAL_ARRAY[index];
		var text = root.getMaterialManager().getMaterialName(object, category).replace(".png", "");

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);	},

	getObjectWidth: function () {
		return 180 + HorizontalLayout.OBJECT_WIDTH;
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
		this._scrollbar.setScrollFormation(1, getCharaIllustCreateScrollbarIndex());
		this._scrollbar.setActive(false);
	},

	setselectPage: function (category) {
		var count = root.getMaterialManager().getMaterialCount(category);
		var arr = [];
		for (var i = 0; i < count; i++) {
			arr.push(root.getMaterialManager().getMaterialName(i, category));
		}

		var commandList = StructureBuilder.buildDataList();
		commandList.setDataArray(arr);
		this._scrollbar.setDataList(commandList);
	},

	moveWindowContent: function () {
		this._scrollbar.enableSelectCursor(true);
		var input = this._scrollbar.moveInput();

		// キャンセルキーを押下した場合
		if (input === ScrollbarInput.CANCEL) {
			this._scrollbar.setActive(false);
			return CharaIllustCreateScreenMode.PARTSELECT;
		}
		// 決定キーを押下した場合
		if (input === ScrollbarInput.SELECT) {
			// 決定キーを押した場合の処理
		}

		return CharaIllustCreateScreenMode.CHIPSELECT;
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
		var text = object.replace(".png", "");

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	getObjectWidth: function () {
		return 180 + HorizontalLayout.OBJECT_WIDTH;
	},

	getObjectHeight: function () {
		return 25;
	}
});

var getCharaIllustCreateScrollbarIndex = function() {
	return Math.max(CHARACTER_CREATE_MATERIAL_ARRAY.length, 12)
};

var getCharaIllustMaterialPic = function(i, index) {
	var category = CHARACTER_CREATE_MATERIAL_ARRAY[i];
	var name = root.getMaterialManager().getMaterialName(index, category);
	var pic = root.getMaterialManager().createImage(category, name);

	return pic;
};

// -----------------------------------------
// メッセージ立ち絵の描画処理を上書き
// -----------------------------------------
(function () {
BaseMessageView._picArr = null;

var alias03 = BaseMessageView._setupIllustImage;
BaseMessageView._setupIllustImage = function(messageViewParam) {
	this._picArr = [];
	var unit = messageViewParam.unit;
	if (unit.custom.charaIndexArr) {
		var indexArr = unit.custom.charaIndexArr;
		for (var i = 0; i < CHARACTER_CREATE_MATERIAL_ARRAY.length; i++) {
			this._picArr.push(getCharaIllustMaterialPic(i, indexArr[i]));
		}

		// さらに、上書き用のデータがある場合は実行
		if (unit.custom.charaExpressionOverwrite) {
			var charaExpressionOverwrite = unit.custom.charaExpressionOverwrite;
			for (var j = 0; j < charaExpressionOverwrite.length; j++) {
				var id = charaExpressionOverwrite[j].expressionId;
				if (id === this._illustId) {
					var overWriteArr = charaExpressionOverwrite[j].overWrite;
					for (var k = 0; k < overWriteArr.length; k++) {
						var overWriteObj = overWriteArr[k];
						var index = CHARACTER_CREATE_MATERIAL_ARRAY.indexOf(overWriteObj.categoryName);
						this._picArr[index] = root.getMaterialManager().createImage(overWriteObj.categoryName, overWriteObj.picName);
					}
				}
			}
		}
	}

	alias03.call(this, messageViewParam);
}

var alias04 = BaseMessageView.drawCharIllust;
BaseMessageView.drawCharIllust = function(isActive) {
	if (MessageViewControl.isHidden()) {
		return;
	}
	else if (this._picArr.length > 0) {
		for (var i = this._picArr.length - 1; i >= 0; i--) {
			var image = this._picArr[i];

			var pos = this.getIllustPos(image);
			var xCharIllust = pos.x + this._messageLayout.getCharIllustX();
			var yCharIllust = pos.y + this._messageLayout.getCharIllustY();

			if (this._messageLayout.isCharIllustReverse()) {
				image.setReverse(true);
			}
			if (!isActive) {
				image.setColor(this._getNonActiveColor(), this._getNonActiveAlpha());
			}
			image.draw(xCharIllust, yCharIllust);
		}
	}
	else {
		alias04.call(this, isActive);
	}
}

})();
