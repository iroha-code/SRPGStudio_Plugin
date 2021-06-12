/*--------------------------------------------------------------------------
  
  タイトル画面：アップデートチェック

  ■概要
  ゲームのバージョンをチェックし，最新でない場合はタイトル画面にアラートを表示します。

  ■使用方法：初期設定
  ① Google Driveに現在バージョン（例：1.0）を記述したテキストファイルをアップしてください。
  ② テキストファイルの共有先を「リンクを知っている全員」に変更してください。
  ③ 本プラグインの「設定」項目のUpdateTextURLの「id=」以降を，テキストファイルのidに書き換えてください。
  ※Google Drive上で，テキストファイルの「リンクを取得」を選ぶと
  　　　https://drive.google.com/file/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxx/view?usp=sharing
　　のようなurlが取得できます。↑の「xxxxxxxxxxxxxxxxxxxxxxx」にあたる部分がファイルidです。
  ④ 本プラグインの「設定」項目のCurrentGameVersionを現在バージョン（例1.0）に変更してください。

  ■使用方法：バージョン更新ごとの設定
  ① Google Drive上にアップされているテキストファイルのバージョンを書き換えてください。
	このとき，ファイルを再アップロードするとGoogle idも再発行されてしまうため，
	必ずGoogle Drive上でバージョンを書き換えるようにしてください。
	アプリで開く -> Text Editor　などと選択すれば，Drive上でテキストファイルを直接書き換えられます。
  ② 本プラグインの「設定」項目のCurrentGameVersionを新バージョンに変更してください。

  ■正しい挙動について
  Google Driveにあがっているテキストファイルに記述されたバージョン情報と，
  本プラグインで設定されているバージョン情報が一致していない場合のみ，タイトル画面にアラートを表示します。
  ゲームをリリースする前に，一度挙動を確認いただくことを強く推奨します。

  ■注意事項
  ・ゲームを新バージョンに差し替える際は，このプラグインのバージョンと，Google Drive上のテキストファイルのバージョンの両方を変更してください。
  ・ウインドウの表示内容（文言や位置など）は，「//Window描画処理」「//Text描画処理」の部分をいじれば調整可能です。
  
  ■バージョン履歴
  2021/06/10  新規作成
  2021/06/12  ゲーム起動時のみ動作するよう修正（F12キーなどでタイトルに戻った場合には動作しません）
  　　　　　　 使用方法：バージョン更新ごとの設定　を追加

　■対応バージョン
　SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
//-------------------------------------------
// 設定
//-------------------------------------------
var UpdateTextURL = 'https://drive.google.com/uc?export=download&id=xxxxxxxxxxxxxxxxxxxxxxx';
var CurrentGameVersion = '1.1';
//-------------------------------------------

var alias101 = TitleScene._prepareSceneMemberData;
TitleScene._prepareSceneMemberData = function() {
	alias101.call(this);

	if (UpdateMessageAPIRequest._execute == true) {
		UpdateMessageAPIRequest.initialize();
		UpdateMessageAPIRequest.setRequest();
		UpdateMessageAPIRequest.sendRequest();
	} else {
		UpdateMessageAPIRequest._responseData = CurrentGameVersion;
	}

	UpdateMessageAPIRequest._execute = false;
}

var alias102 = TitleScene.moveSceneCycle;
TitleScene.moveSceneCycle = function() {
	if (UpdateMessageAPIRequest.getResponseData() == '') {
		UpdateMessageAPIRequest.waitRequest();
	}

	alias102.call(this);
}

TitleScene.drawSceneCycle = function() {
	var mode = this.getCycleMode();

	if (mode === TitleSceneMode.FLOW) {
		this._straightFlow.drawStraightFlow();
		return;
	}
	else if (mode === TitleSceneMode.BLACKIN) {
		this._transition.drawTransition();
	}

	this._drawBackground();
	this._drawLogo();
	this._drawScrollbar();

	if (UpdateMessageAPIRequest.getResponseData() !== '') {
		if (UpdateMessageAPIRequest.getResponseData() !== CurrentGameVersion) {
			//Window描画処理
			var width = 300;
			var height = 60;
			x = root.getGameAreaWidth() - width - 20;
			y = 20;
			var textui = root.queryTextUI('default_window')
			var pic  = textui.getUIImage();
			WindowRenderer.drawStretchWindow(x, y, width, height, pic);

			//Text描画処理
			var font = textui.getFont();
			var color = ColorValue.KEYWORD;
			var text1 = '新しいバージョンがリリースされました。';
			var text2 = '最新版のダウンロードをお願いします。';
			TextRenderer.drawText(x + 20, y + 12, text1, -1, color, font);
			TextRenderer.drawText(x + 20, y + 32, text2, -1, color, font);
		}
	}

	if (mode === TitleSceneMode.SELECT) {
		this._drawSelect();
	}
	else if (mode === TitleSceneMode.OPEN) {
		this._drawOpen();
	}
}

var _ScriptCall__Setup =  ScriptCall_Setup;
ScriptCall_Setup = function() {
	_ScriptCall__Setup.call(this);
	UpdateMessageAPIRequest._execute = true;
}

var UpdateMessageAPIRequest = defineObject(BaseObject,
{
	_execute: false,
	_request: null,
	_counter: null,
	_responseData: null,

	initialize: function() {
		this._request = new ActiveXObject("Msxml2.ServerXMLHTTP");

		this._responseData = 'OK';
		this._counter = createObject(CycleCounter);
		this._counter.setCounterInfo(this._getRequestTimeOut());
		this._counter.disableGameAcceleration();
	},

	_getRequestTimeOut: function() {
		return 60;
	},

	getResponseData: function() {
		return this._responseData;
	},

	waitRequest: function() {
		var waitRequestResult = MoveResult.END;
		var counterResult = this._counter.moveCycleCounter();

		if (this._request.readyState === 4 && this._request.status === 200) {
			this._responseData = this._request.responseText;
			waitRequestResult = MoveResult.END;
			root.log("Request Success");
		}
		else if (this._request.readyState <= 3 || counterResult === MoveResult.CONTINUE) {
			waitRequestResult = MoveResult.CONTINUE;
		}
		else {
			root.log("UpdateMessageAPI Request Error");
			if (counterResult === MoveResult.END) {
				root.log("TimeOut");
			}
			else {
				root.log("StatusCode:" + this._request.status);
				root.log("ReadyState:" + this._request.readyState);
			}
			waitRequestResult = MoveResult.END;
			this._responseData = '';
		}
		return waitRequestResult;
	},

	setRequest: function() {
		this._request.open('GET', UpdateTextURL, true);
	},

	sendRequest: function() {
		this._responseData = '';
		this._counter.resetCounterValue();
		this._request.send();
	}
}); 