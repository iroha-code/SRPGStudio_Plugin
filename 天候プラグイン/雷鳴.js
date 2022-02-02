/*--------------------------------------------------------------------------

  雷鳴

  ■使い方
  マップのカスタムパラメータに以下のように設定してください。
  まずは以下のとおりに設定して動作を確認いただくことをお勧めします。
  ※作っておいてアレですが、あまりオススメできないプラグインです。
    集中してマップを見るゲームで画面がフラッシュするのはプレイヤー側にストレスを与える可能性があります。

  ■設定例(ローカルスイッチid:0がONのとき、10～15秒の間隔で稲光が発生)
  lightning: {
    INTERVAL_MIN: 600, //稲光の時間間隔の最小値（60fpsベース）
    INTERVAL_MAX: 900, //稲光の時間間隔の最大値（60fpsベース）
    FULL_LIGHT  : 150, //稲光の明るさの最大値（255が最大）
    DURATION    : 10,  //稲光の継続時間（60fpsベース）
    SWITCH_ID   : 0,  //起動条件になるローカルスイッチのID（この行は必須ではありません）
    SOUND: {isRuntime: false, id: 0, rug: -10} //稲光の効果音（この行は必須ではありません）
  }

  // SOUND: 以降についての補足
  isRuntime: true→ランタイム、false→オリジナルのsoundを使用
  id: 使用するsoundのid
  rug: 発光に比べてsoundが何フレーム遅れるか（60fpsベース）

  ※上記の設定例の場合、オリジナルのid:0の効果音が、発光に比べて10フレーム早く鳴ります。

  ■バージョン履歴
  2021/02/02  新規作成

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
MapLayer._LightCounter = 0;
MapLayer._LightCounterLimit = 0;
MapLayer._LightSoundDone = false;

var alias00 = MapLayer.prepareMapLayer;
MapLayer.prepareMapLayer = function() {
	alias00.call(this);

  var currentScene = root.getCurrentScene();
  if (
    currentScene !== SceneType.BATTLESETUP &&
    currentScene !== SceneType.FREE && 
    currentScene !== SceneType.BATTLERESULT
  ) {
    return;
  }

  var lightning_info = this._getLightningInfo();
  if (!lightning_info) {
    return;
  }

  this._initializeLightning();
}

var alias01 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
  var lightning_info = this._getLightningInfo();
  if (lightning_info) {
    if (!this._isEnableLocalSwitch()) {
      return alias01.call(this);
    }
    this._LightCounter++;

    //30FPSの場合は倍のCounterをのせる
    if (!DataConfig.isHighPerformance()) {
      this._LightCounter++;
		}
  }

  return alias01.call(this);
};

var alias02 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer = function() {
  alias02.call(this);

  var lightning_info = this._getLightningInfo();
  if (!lightning_info) {
    return;
  }
  if (!this._isEnableLocalSwitch()) {
    return;
  }

  if (lightning_info.SOUND) {
    if (this._LightCounter >= this._LightCounterLimit + lightning_info.SOUND.rug && !this._LightSoundDone) {
      var handle = root.createResourceHandle(lightning_info.SOUND.isRuntime, lightning_info.SOUND.id, 0, 0, 0);
      MediaControl.soundPlay(handle);
      this._LightSoundDone = true;
    }
  }

  if (this._LightCounter >= this._LightCounterLimit) {
    var overCounter = this._LightCounter - this._LightCounterLimit;

    var canvas = root.getGraphicsManager().getCanvas();
    var width = root.getGameAreaWidth();
    var height = root.getGameAreaHeight();
    var color = 0xffffff;

    canvas.setFillColor(color, lightning_info.FULL_LIGHT - (lightning_info.FULL_LIGHT / lightning_info.DURATION) * overCounter);
    canvas.drawRectangle(0, 0, width, height);

    if (overCounter >= lightning_info.DURATION) {
      this._LightCounter = 0;
      this._initializeLightning();
    }
  }
};

MapLayer._initializeLightning = function() {
  var lightning_info = this._getLightningInfo();
  if (!lightning_info) {
    return;
  }

  this._LightCounter = 0;
  this._LightCounterLimit = (lightning_info.INTERVAL_MAX - lightning_info.INTERVAL_MIN) * Math.random() + lightning_info.INTERVAL_MIN;
  this._LightSoundDone = false;
}

MapLayer._getLightningInfo = function() {
	var currentSession = root.getCurrentSession();
	if (!currentSession) {
		return null;
	}
  var currentMapInfo = currentSession.getCurrentMapInfo();
	if (!currentMapInfo) {
		return null;
	}
  var lightning_info = currentMapInfo.custom.lightning;
  if (!lightning_info) {
    return null;
	}

	return lightning_info;
};

MapLayer._isEnableLocalSwitch = function() {
  var currentMapInfo = root.getCurrentSession().getCurrentMapInfo();
  var lightning_info = currentMapInfo.custom.lightning;

  if (lightning_info.SWITCH_ID != null) {
    var localSwitchTable = currentMapInfo.getLocalSwitchTable();
    var switchIndex = localSwitchTable.getSwitchIndexFromId(lightning_info.SWITCH_ID);
    if (localSwitchTable.isSwitchOn(switchIndex)) {
      return true;
    }
  }

  return false;
}

})();

