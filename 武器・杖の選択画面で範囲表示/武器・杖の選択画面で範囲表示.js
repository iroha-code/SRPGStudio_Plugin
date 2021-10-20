/*--------------------------------------------------------------------------
  
  武器・杖の選択画面で範囲表示.js

  ■
  武器・杖の選択画面で攻撃範囲を表示します。
  
  ■オプション1
  杖の効果範囲を表示するかどうかは「設定」の項目で切替可能です。

  var WAND_WAVEPANEL_DISPLAY = true;  → 杖の効果範囲を表示する
  var WAND_WAVEPANEL_DISPLAY = false; → 杖の効果範囲を表示しない

  なお，杖の効果範囲も使用する場合は，同梱の「WandRange」フォルダを「Material」フォルダに格納してください。
  ※ Material > WandRange > WandRange.png というフォルダ構成になっていればOK
  ※ WandRange.png は名前未定様のプラグイン同梱画像を流用させていただいたものです。

  ■オプション2
  武器・杖の選択後，その相手を選ぶ画面でも攻撃範囲を表示するかどうかは，「設定」の項目で切替可能です。

  var RESULTWINDOW_WAVEPANEL_DISPLAY = true;  → 相手を選ぶ画面でも範囲を表示する
  var RESULTWINDOW_WAVEPANEL_DISPLAY = false; → 相手を選ぶ画面では範囲を表示しない

  ■バージョン履歴
  2021/09/24  新規作成
  2021/10/20  杖の使用範囲も表示できるよう更新

  ■対応バージョン
  SRPG Studio Version:1.244
  
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
var WAND_WAVEPANEL_DISPLAY = true; //杖の範囲も表示する
var RESULTWINDOW_WAVEPANEL_DISPLAY = false; //相手を選ぶ画面でも範囲を表示する

//-------------------------------------------
// 武器選択画面についての処理
//-------------------------------------------
UnitCommand.Attack._wavePanel = null;
UnitCommand.Attack._indexArray = [];
UnitCommand.Attack._tmpweapon = null;

var alias01 = UnitCommand.Attack._prepareCommandMemberData;
UnitCommand.Attack._prepareCommandMemberData = function() {
  this._wavePanel = createObject(WavePanel);

  alias01.call(this);  
}

// 武器選択画面の攻撃範囲表示処理
var alias02 = UnitCommand.Attack._moveTop;
UnitCommand.Attack._moveTop = function() {
  var unit = this.getCommandTarget();
  var weapon = this._weaponSelectMenu.getSelectWeapon();

  if (!this._tmpweapon || this._tmpweapon !== weapon) {
    this._indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
  }
  this._tmpweapon = weapon;
  this._wavePanel.moveWavePanel();

  return alias02.call(this);  
}

var alias03 = UnitCommand.Attack._drawTop;
UnitCommand.Attack._drawTop = function() {
  root.drawWavePanel(this._indexArray, root.queryUI('range_panel'), this._wavePanel.getScrollCount());

  alias03.call(this);
}

// 攻撃相手選択画面の範囲表示処理（RESULTWINDOW_WAVEPANEL_DISPLAY = true の場合のみ）
var alias04 = UnitCommand.Attack._moveSelection;
UnitCommand.Attack._moveSelection = function() {
  if (RESULTWINDOW_WAVEPANEL_DISPLAY) {
    var unit = this.getCommandTarget();
    var weapon = this._weaponSelectMenu.getSelectWeapon();
  
    if (!this._tmpweapon || this._tmpweapon !== weapon) {
      this._indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
    }

    this._tmpweapon = weapon;
    this._wavePanel.moveWavePanel();
  }

  return alias04.call(this);  
}

var alias05 = UnitCommand.Attack._drawSelection;
UnitCommand.Attack._drawSelection = function() {
  if (RESULTWINDOW_WAVEPANEL_DISPLAY) {
    root.drawWavePanel(this._indexArray, root.queryUI('range_panel'), this._wavePanel.getScrollCount());
  }

  alias05.call(this);  
}

//-------------------------------------------
// 杖選択画面についての処理
// （WAND_WAVEPANEL_DISPLAY = true の場合のみ）
//-------------------------------------------
UnitCommand.Wand._wavePanel = null;
UnitCommand.Wand._indexArray = [];
UnitCommand.Wand._tmpwand = null;

var alias06 = UnitCommand.Wand._prepareCommandMemberData;
UnitCommand.Wand._prepareCommandMemberData = function() {
  this._wavePanel = createObject(WavePanel);

  alias06.call(this);
}

var alias07 = UnitCommand.Wand._moveTop;
UnitCommand.Wand._moveTop = function() {
  if (WAND_WAVEPANEL_DISPLAY) {
    var unit = this.getCommandTarget();
    var wand = this._itemSelectMenu.getSelectWand();

    if (!this._wand || this._wand !== wand) {
      this._indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), wand);
    }
    this._tmpwand = wand;
    this._wavePanel.moveWavePanel();
  }

  return alias07.call(this);
}

var alias08 = UnitCommand.Wand._drawTop;
UnitCommand.Wand._drawTop = function() {
  if (WAND_WAVEPANEL_DISPLAY) {
    root.drawWavePanel(this._indexArray, CacheControl.get_WandRangePic(), this._wavePanel.getScrollCount());
  }

  alias08.call(this);
}


// 攻撃相手選択画面の範囲表示処理（RESULTWINDOW_WAVEPANEL_DISPLAY = true の場合のみ）
var alias09 = UnitCommand.Wand._moveSelection;
UnitCommand.Wand._moveSelection = function() {
  if (WAND_WAVEPANEL_DISPLAY && RESULTWINDOW_WAVEPANEL_DISPLAY) {
    var unit = this.getCommandTarget();
    var wand = this._itemSelectMenu.getSelectWand();
  
    if (!this._wand || this._wand !== wand) {
      this._indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), wand);
    }

    this._tmpwand = wand;
    this._wavePanel.moveWavePanel();
  }

  return alias09.call(this);  
}

var alias10 = UnitCommand.Wand._drawSelection;
UnitCommand.Wand._drawSelection = function() {
  if (WAND_WAVEPANEL_DISPLAY && RESULTWINDOW_WAVEPANEL_DISPLAY) {
    root.drawWavePanel(this._indexArray, CacheControl.get_WandRangePic(), this._wavePanel.getScrollCount());
  }

  alias10.call(this);  
}

//--------------------------------------------------
// 緑色のWavePanel表示に必要なキャッシュ処理
//--------------------------------------------------
CacheControl._WandRangePic = null;

CacheControl.get_WandRangePic = function() {
	var pic;

	if (!this._WandRangePic) {
		pic = root.getMaterialManager().createImage('WandRange', 'WandRange.png');
		this._WandRangePic = this._createImageCache(pic);
	} else if (!this._WandRangePic.picCache.isCacheAvailable()) {
		pic = root.getMaterialManager().createImage('WandRange', 'WandRange.png');
		this._setImageCache(pic, this._WandRangePic.picCache);
	}

	return this._WandRangePic.picCache;
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

})();
