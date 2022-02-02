/*--------------------------------------------------------------------------

  フォグスクリプト_彩羽

  ■使い方
  Materialフォルダに「FogImage」フォルダを作成いただき、中に使用したいpngファイルを入れてください。
  マップのカスタムパラメータに以下のように設定してください。
  まずは本プラグイン同梱の'snow.png'を利用して動作を確認いただくことをお勧めします。

  ■設定例

  例1：降雪（ローカルスイッチid:0 がONの場合のみ）
  iroha_fog:{
    FOG_IMAGE_NAME: 'snow.png', //使用するpngファイル名
    FOG_COUNT: 100, //画面上に表示する数
    FOG_SCALE_MIN: 30, //表示倍率の最小値(%)
    FOG_SCALE_MAX: 50, //表示倍率の最大値(%) ※100以下を推奨
    FOG_ANGLE_MIN: (1 * Math.PI / 3), //進行角度の最小値(rad)
    FOG_ANGLE_MAX: (2 * Math.PI / 3), //進行角度の最大値(rad)
    FOG_ANGLE_VAR: (Math.PI / 30),     //進行角度の1フレームごと変動値(rad)
    FOG_SPEED_MIN: 1.0, //速度の最小値(pixel)
    FOG_SPEED_MAX: 1.5, //速度の最大値(pixel)
    FOG_SPEED_VAR: 0.1, //速度の1フレームごと変動値(pixel)
    SWITCH_ID: 0 //起動条件になるローカルスイッチのID
  }

  例2：吹雪
  iroha_fog:{
    FOG_IMAGE_NAME: 'snow.png', //使用するpngファイル名
    FOG_COUNT: 100, //画面上に表示する数
    FOG_SCALE_MIN: 30, //表示倍率の最小値(%)
    FOG_SCALE_MAX: 50, //表示倍率の最大値(%) ※100以下を推奨
    FOG_ANGLE_MIN: (Math.PI / 8), //進行角度の最小値(rad)
    FOG_ANGLE_MAX: (Math.PI / 5), //進行角度の最大値(rad)
    FOG_ANGLE_VAR: (Math.PI / 30),     //進行角度の1フレームごと変動値(rad)
    FOG_SPEED_MIN: 4.0, //速度の最小値(pixel)
    FOG_SPEED_MAX: 8.0, //速度の最大値(pixel)
    FOG_SPEED_VAR: 0.5  //速度の1フレームごと変動値(pixel)
  }

  例3：火の粉
  iroha_fog:{
    FOG_IMAGE_NAME: 'firespark.png', //使用するpngファイル名
    FOG_COUNT: 50, //画面上に表示する数
    FOG_SCALE_MIN: 20, //表示倍率の最小値(%)
    FOG_SCALE_MAX: 30, //表示倍率の最大値(%) ※100以下を推奨
    FOG_ANGLE_MIN: (-1 * Math.PI / 6), //進行角度の最小値(rad)
    FOG_ANGLE_MAX: (-1 * Math.PI / 8), //進行角度の最大値(rad)
    FOG_ANGLE_VAR: (Math.PI / 30),     //進行角度の1フレームごと変動値(rad)
    FOG_SPEED_MIN: 0.8, //速度の最小値(pixel)
    FOG_SPEED_MAX: 1.3, //速度の最大値(pixel)
    FOG_SPEED_VAR: 0.2  //速度の1フレームごと変動値(pixel)
  }

  例4：風雨
  iroha_fog:{
    FOG_IMAGE_NAME: 'rain.png',
    FOG_COUNT: 200, //画面上に表示する数
    FOG_SCALE_MIN: 10, //表示倍率の最小値(%)
    FOG_SCALE_MAX: 15, //表示倍率の最大値(%) ※100以下を推奨
    FOG_ANGLE_MIN: (14 * Math.PI / 24), //進行角度の最小値(rad)
    FOG_ANGLE_MAX: (15 * Math.PI / 24), //進行角度の最大値(rad)
    FOG_ANGLE_VAR: (Math.PI / 120),     //進行角度の1フレームごと変動値(rad)
    FOG_SPEED_MIN: 12.0, //速度の最小値(pixel)
    FOG_SPEED_MAX: 15.0, //速度の最大値(pixel)
    FOG_SPEED_VAR: 1.0  //速度の1フレームごと変動値(pixel)
  }

  ■バージョン履歴
  2021/02/02  30FPSに対応
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
//--------------------------------------------------
// 画像のキャッシュ処理
//--------------------------------------------------
CacheControl._FogPic = null;

CacheControl.get_FogPic = function() {
  var pic;
  var fog_info = MapLayer._getFogInfo();
  if (!fog_info) {
    return;
  }

	if (!this._FogPic) {
		pic = root.getMaterialManager().createImage('FogImage', fog_info.FOG_IMAGE_NAME);
		this._FogPic = this._createImageCache(pic);
	} else if (!this._FogPic.picCache.isCacheAvailable()) {
		pic = root.getMaterialManager().createImage('FogImage', fog_info.FOG_IMAGE_NAME);
		this._setImageCache(pic, this._FogPic.picCache);		
	}

	return this._FogPic.picCache;
};

CacheControl._createImageCache = function(pic) {
	var picCache, height, width, cache;

	if (!pic) {
		return null;
	}

	height = pic.getHeight();
	width = pic.getWidth();

	cache = {};
	cache.picCache = root.getGraphicsManager().createCacheGraphics(width, height);
	this._setImageCache(pic, cache.picCache);

	return cache;
};

CacheControl._setImageCache = function(pic, picCache) {
	var graphicsManager = root.getGraphicsManager();
	graphicsManager.setRenderCache(picCache);
	pic.draw(0, 0);
	graphicsManager.resetRenderCache();
};


//--------------------------------------------------
// MapLayerクラス
//--------------------------------------------------
MapLayer._FogX = [];
MapLayer._FogY = [];
MapLayer._FogScale = [];
MapLayer._FogAngle = [];
MapLayer._FogSpeed = [];

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

  var fog_info = this._getFogInfo();
  if (!fog_info) {
    return;
  }

  for (var i = 0; i < fog_info.FOG_COUNT; i++) {
    var pic = CacheControl.get_FogPic();
    var picsize = Math.max(pic.getWidth(), pic.getHeight());
 
    this._FogX[i] = Math.random() * (root.getGameAreaWidth() + picsize * 2) - picsize;
    this._FogY[i] = Math.random() * (root.getGameAreaHeight() + picsize * 2) - picsize;
    this._FogScale[i] = Math.random() * (fog_info.FOG_SCALE_MAX - fog_info.FOG_SCALE_MIN) + fog_info.FOG_SCALE_MIN;
    this._FogAngle[i] = Math.random() * (fog_info.FOG_ANGLE_MAX - fog_info.FOG_ANGLE_MIN) + fog_info.FOG_ANGLE_MIN;
    this._FogSpeed[i] = Math.random() * (fog_info.FOG_SPEED_MAX - fog_info.FOG_SPEED_MIN) + fog_info.FOG_SPEED_MIN;
  }
};

var alias01 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
  var fog_info = this._getFogInfo();
  if (!fog_info) {
    return alias01.call(this);
  }
  if (!this._isEnableLocalSwitch()) {
    return alias01.call(this);
  }

  var pic = CacheControl.get_FogPic();
  for (var i = 0; i < fog_info.FOG_COUNT; i++) {

    var speed = this._FogSpeed[i];
    //30FPSの場合は速さを2倍に
    if (!DataConfig.isHighPerformance()) {
      speed *= 2;
		}

    this._FogX[i] += Math.cos(this._FogAngle[i]) * speed;
    this._FogY[i] += Math.sin(this._FogAngle[i]) * speed;
  
    this._FogAngle[i] += (Math.random() - 0.5) * fog_info.FOG_ANGLE_VAR;
    this._FogAngle[i] = Math.max(this._FogAngle[i], fog_info.FOG_ANGLE_MIN);
    this._FogAngle[i] = Math.min(this._FogAngle[i], fog_info.FOG_ANGLE_MAX);

    this._FogSpeed[i] += (Math.random() - 0.5) * fog_info.FOG_SPEED_VAR;
    this._FogSpeed[i] = Math.max(this._FogSpeed[i], fog_info.FOG_SPEED_MIN);
    this._FogSpeed[i] = Math.min(this._FogSpeed[i], fog_info.FOG_SPEED_MAX);

    // 画面外に出たら、反対側にワープ
    var picsize = Math.max(pic.getWidth(), pic.getHeight());
    if (this._FogX[i] > root.getGameAreaWidth() + picsize) {
      this._FogX[i] = -1 * picsize;
    }
    if (this._FogX[i] < - picsize) {
      this._FogX[i] = root.getGameAreaWidth() + picsize;
    }
    if (this._FogY[i] > root.getGameAreaHeight() + picsize) {
      this._FogY[i] = -1 * picsize;
    }
    if (this._FogY[i] < - picsize) {
      this._FogY[i] = root.getGameAreaHeight() + picsize;
    }
  }

  return alias01.call(this);
};

var alias02 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer = function() {
  alias02.call(this);

  var fog_info = this._getFogInfo();
  if (!fog_info) {
    return;
  }
  if (!this._isEnableLocalSwitch()) {
    return;
  }

  var pic = CacheControl.get_FogPic();
  for (var i = 0; i < fog_info.FOG_COUNT; i++) {
    pic.draw(this._FogX[i], this._FogY[i]);
    pic.setScale(this._FogScale[i]);
    pic.setDegree(this._FogAngle[i] * 180 / Math.PI);
  }
};

MapLayer._getFogInfo = function() {
	var currentSession = root.getCurrentSession();
	if (!currentSession) {
		return null;
	}
  var currentMapInfo = currentSession.getCurrentMapInfo();
	if (!currentMapInfo) {
		return null;
	}
  var fog_info = currentMapInfo.custom.iroha_fog;
  if (!fog_info) {
    return null;
	}
	return fog_info;
};

MapLayer._isEnableLocalSwitch = function() {
  var currentMapInfo = root.getCurrentSession().getCurrentMapInfo();
  var fog_info = currentMapInfo.custom.iroha_fog;

  if (fog_info.SWITCH_ID != null) {
    var localSwitchTable = currentMapInfo.getLocalSwitchTable();
    var switchIndex = localSwitchTable.getSwitchIndexFromId(fog_info.SWITCH_ID);
    if (localSwitchTable.isSwitchOn(switchIndex)) {
      return true;
    }
  }

  return false;
}

})();

