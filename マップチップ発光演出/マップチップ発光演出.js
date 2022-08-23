
/*--------------------------------------------------------------------------
  
	マップチップ発光演出

	■概要
	特定のマップチップを指定して、そのマップチップが発光（明滅）しているような演出を行います。
	デフォルトの場合では、ランタイムの燭台マップチップに対して発光（明滅）の演出を行います。

	■使い方
	①「Material」フォルダの中に「CandleSpark」フォルダを作成し，さらにその下に「CandleSpark.png」を配置してください。
	※CandleSpark.pngも彩羽作成のため、以下規約のとおり利用可能です。画像加工・再配布等OKです。
	※画像の大きさなど変更しても動作します。必要に応じて調整してください。

	②「各種設定」を適宜調整してください。
	  デフォルトの場合、ランタイムのマップチップID102番（燭台）に対して発光の演出を行います。
	
	■使用上の注意
	・【重要】マップチップが上書きされた場合、即時反映されません。
	   即時反映を行いたい場合は、以下の手順を踏んでください。
		   イベントコマンド -> スクリプトの実行 -> コード実行 にチェックして、プロパティに以下を入力
		   CandleComposition.initialize();
	   ※MAPCHIP_ANIMATION_ISACTIVATED = trueの場合は、14フレームに1度更新を行いますが、即時反映ではありません。
	
	・Version:1.265で追加されたcomposition APIを使用しています。それ以前のバージョンでは動作しません。
	・Composition APIを使用しているため、動作が重くなる恐れがあります。サファイアソフト様からは以下の案内が出ています。
		   Composition APIを使用する場合、スクリーンキャプチャなどの目的を除き、game.iniの「画像の描画方法」はハードであるべきです。
		   ソフトはハードよりも多くの描画時間を要します。

	■バージョン履歴
	2022/08/23  新規作成

	■対応バージョン
	SRPG Studio Version:1.265

	■規約
	・利用はSRPG Studioを使ったゲームに限ります。
	・商用・非商用問いません。フリーです。
	・加工等、問題ありません。どんどん改造してください。
	・クレジット明記無し  OK
	・再配布、転載  OK
	・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

// ---------------------------------------
// 各種設定
// ---------------------------------------

// 明滅の仕方に関する設定
var CANDLE_MOVE_FRAME = 120; //明滅の周期（デフォルトは120フレーム＝2秒）
var BASE_ALPHA_VALUE = 0.5; //もとの明るさ
var DIV_ALPHA_VALUE = 1.0; //明滅により変化する明るさ

// 明滅させる対象マップチップに関する設定
var CANDLE_MAPCHIP_ISRUNTIME = true; //特定のマップチップに対して明滅を適用させる場合、ランタイムか否か（falseの場合オリジナル）
var CANDLE_MAPCHIP_ID = 102; //特定のマップチップに対して明滅を適用させる場合、対象のマップチップID（102の場合、!3#アニメ置物＝燭台）
var CANDLE_TERRAIN_GROUP_ID = -1; //地形グループに対して明滅を適用させる場合、地形グループのID

(function() {
// マップチップアニメ（燭台の火が大きくなったり小さくなったり…など）を考慮するか
// trueの場合、14フレームごとにマップチップの描画を更新します。
// falseにするとマップチップの更新を行わなくなるため、動作が軽くなります。
var MAPCHIP_ANIMATION_ISACTIVATED = false;
	
// ---------------------------------------
// CurrentMapクラス
// ---------------------------------------
var alias1 = CurrentMap.prepareMap;
CurrentMap.prepareMap = function() {
	alias1.call(this);
	
	CandleComposition.initialize();
	CandleComposition.setupAlphaCounter();
};

// ---------------------------------------
// MapLayerクラス
// ---------------------------------------
var alias2 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
	alias2.call(this);

	// マップアニメの更新
	if (this._counter._counter.getCounter() === 0 && MAPCHIP_ANIMATION_ISACTIVATED) {
		CandleComposition.updateMapAnimation();
	}

	CandleComposition.moveCandleComposition();
};

var alias3 = MapLayer.drawMapLayer;
MapLayer.drawMapLayer = function() {
	alias3.call(this);

	CandleComposition.drawCandleComposition();
};

// ---------------------------------------
// CacheControlクラス
// ---------------------------------------
CacheControl._CandleSparkPic = null;

CacheControl.get_CandleSparkPic = function() {
	var pic;

	if (!this._CandleSparkPic) {
		pic = root.getMaterialManager().createImage('CandleSpark', 'CandleSpark.png');
		this._CandleSparkPic = this._createImageCache(pic);
	} else if (!this._CandleSparkPic.picCache.isCacheAvailable()) {
		pic = root.getMaterialManager().createImage('CandleSpark', 'CandleSpark.png');
		this._setImageCache(pic, this._CandleSparkPic.picCache);		
	}

	return this._CandleSparkPic.picCache;
};

CacheControl._createImageCache = function(pic) {
	var height, width, cache;

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

// ---------------------------------------
// CandleCompositionクラス
// ---------------------------------------
var CandleComposition = {
	_composition: null,
	_candleIndexArray: null,
	_bitmap: null,
	_overlayCache: null,
	_counter: null,

	initialize: function() {
		if (this._composition == null) {
			this._composition = root.getGraphicsManager().createComposition();
		}
		
		this._candleIndexArray = this._setCandleIndexArray();
		this._bitmap = this._createMapCache();
		this._overlayCache = this._getOverlayCache();
	},

	setupAlphaCounter: function() {
		this._counter = createObject(CycleCounter);
		this._counter.setCounterInfo(CANDLE_MOVE_FRAME);
		this._counter.disableGameAcceleration();
	},

	_setCandleIndexArray: function() {
		var x, y, width, height, candleIndexArray;
		width = CurrentMap.getWidth();
		height = CurrentMap.getHeight();
		candleIndexArray = [];
		
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				if (this._isCandle(x, y)) {
					candleIndexArray.push(CurrentMap.getIndex(x, y));
				}
			}
		}

		return candleIndexArray;
	},

	_isCandle: function(x, y) {
		//マップチップを参照
		var handle = root.getCurrentSession().getMapChipGraphicsHandle(x, y, true);
		var isRuntime = handle.getHandleType() === ResourceHandleType.RUNTIME;
		if (isRuntime === CANDLE_MAPCHIP_ISRUNTIME && handle.getResourceId() === CANDLE_MAPCHIP_ID) {
			return true;
		}
		
		//地形グループを参照
		var terraingroup = PosChecker.getTerrainFromPos(x, y).getTerrainGroup();
		if (terraingroup && terraingroup.getId() === CANDLE_TERRAIN_GROUP_ID) {
			return true;
		}
		
		return false;
	},
	
	updateMapAnimation: function() {
		this._bitmap = this._createMapCache();
	},

	moveCandleComposition: function() {
		if (this._counter !== null) {
			this._counter.moveCycleCounter();
		}
	},
	
	drawCandleComposition: function() {
		var session = root.getCurrentSession();
		if (!session) {
			return;
		}

		var x = -1 * session.getScrollPixelX();
		var y = -1 * session.getScrollPixelY();

		this._setComposition(this._bitmap);
		this._bitmap.draw(x, y);
	},
	
	_setComposition: function(pic) {
		this._composition.setImage(pic);
		this._setCompositionInternal();
		pic.setComposition(this._composition);
	},
	
	_setCompositionInternal: function() {
		this._composition.setBlendBitmap(this._overlayCache, BlendMode.OVERLAY, this._getAlpha());
		this._composition.composite(CompositeMode.SOURCE_IN);
	},
		
	// 三角関数の周期に従って透明度が増減
	_getAlpha: function() {
		var rate = Math.sin(2 * Math.PI * this._counter.getCounter() / CANDLE_MOVE_FRAME) + 1;
		return rate * DIV_ALPHA_VALUE / 2 + BASE_ALPHA_VALUE;
	},
	
	_createMapCache: function() {
		var graphicsManager = root.getGraphicsManager();
		var mapData = root.getCurrentSession().getCurrentMapInfo();
		var mapwidth = mapData.getMapWidth() * GraphicsFormat.MAPCHIP_WIDTH;
		var mapheight = mapData.getMapHeight() * GraphicsFormat.MAPCHIP_HEIGHT;
		var cache = graphicsManager.createCacheGraphics(mapwidth, mapheight);
		
		graphicsManager.setRenderCache(cache);
		root.getCurrentSession().drawMapAll();
		graphicsManager.resetRenderCache();
		
		return cache;
	},
	
	_getOverlayCache: function(x, y) {
		var graphicsManager = root.getGraphicsManager();
		var mapData = root.getCurrentSession().getCurrentMapInfo();
		var mapwidth = mapData.getMapWidth() * GraphicsFormat.MAPCHIP_WIDTH;
		var mapheight = mapData.getMapHeight() * GraphicsFormat.MAPCHIP_HEIGHT;
		var cache = graphicsManager.createCacheGraphics(mapwidth, mapheight);
		var candleIndexArray = this._candleIndexArray;
		
		graphicsManager.setRenderCache(cache);

		var i, x, y;
		var count = candleIndexArray.length;
		
		var sparkPic = CacheControl.get_CandleSparkPic();
		var width = sparkPic.getWidth();
		var height = sparkPic.getHeight();
		
		for (i = 0; i < count; i++) {
			x = CurrentMap.getX(candleIndexArray[i]) * GraphicsFormat.MAPCHIP_WIDTH;
			y = CurrentMap.getY(candleIndexArray[i]) * GraphicsFormat.MAPCHIP_HEIGHT;
			x = x - Math.floor((width / 2) - (GraphicsFormat.MAPCHIP_WIDTH / 2));
			y = y - Math.floor((height / 2) - (GraphicsFormat.MAPCHIP_HEIGHT / 2));

			sparkPic.draw(x, y);
		}
		graphicsManager.resetRenderCache();
		
		return cache;
	}
};
