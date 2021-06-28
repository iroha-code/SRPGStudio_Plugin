/*--------------------------------------------------------------------------
  
  視界システム

　■概要
  敵に対して視界情報を設定し，その内側にいる場合と外側にいる場合で挙動を変えることができます。
  また，自軍ユニットの移動先を選択する際，敵ユニットの視界に入ると「！」の吹出しを表示したり，
  敵ユニットにカーソルを合わせたときに視界外のマップを薄暗く塗り潰すことができます。

  ■使用方法
  ① 敵のカスタムパラメータに以下を設定
  {
  	isMoveMode: true,
　	ViewLength: xx,
  	dtime: -1
　}
  ※ViewLengthは，視界を定義するパラメータ。xxのところに数を入れてください。
  　1→攻撃範囲と同じ，99→マップ全体，それ以外の数を入れるとその数が視界の広さになります。
  ※たとえばViewLength:5とすると，自分から5マス離れたところまでが視界となります。
　
  ② 敵ユニットの行動パターンで，移動型（or 待機型）の条件を以下のようにする
　　IrohaPlugin_GetisMoveMode.getisMoveMode();
　※条件を満たさないときは行動型になるようにすればOK
　※同梱の「設定：行動パターン.png」をご覧ください。

  ③ 「Material」フォルダの中に「Fukidashi」フォルダを作成し，さらにその下に「Fukidashi.png」を配置してください。
  ※Fukidashi.pngも彩羽作成のやつなので以下規約のとおり利用可能です。画像加工・再配布等OKです。

  ■バージョン履歴
  2021/06/27  新規作成
  2021/06/28　MarkingPanelの処理でも視界外が暗くなるように修正

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
//--------------------------------------------------
// 自軍ターン時，何も選択していないときに吹き出しを表示する
//--------------------------------------------------
var alias31 = MapEdit.clearRange;
MapEdit.clearRange = function() {
	alias31.call(this);

	MapSequenceArea._inprocess = false;
	IrohaPlugin_GetisMoveMode.enemyturnSetup();
}

var alias32 = MapEdit._completeMemberData;
MapEdit._completeMemberData = function() {
	alias32.call(this);

	MapSequenceArea._inprocess = false;
	IrohaPlugin_GetisMoveMode.enemyturnSetup();
}

var alias33 = MapPartsCollection._configureMapParts;
MapPartsCollection._configureMapParts = function(groupArray) {
	groupArray.appendObject(MapParts.Fukidashi);
	alias33.call(this, groupArray);
}

MapParts.Fukidashi = defineObject(BaseMapParts,
{
	drawMapParts: function() {
		var enemyList = EnemyList.getAliveList();
		for (var i = 0; i < enemyList.getCount(); i++) {
			var unit = enemyList.getData(i);

			if (unit.custom.isMoveMode === false) {
				var picx = LayoutControl.getPixelX(unit.getMapX());
				var picy = LayoutControl.getPixelY(unit.getMapY());
	
				var pic = CacheControl.get_FukidashiPic();
				pic.draw(picx + 12, picy - 12);
			}
		}
	}
});

//--------------------------------------------------
// MarkingPanel（右クリックのとき）：敵全体の視界外を暗くする
//--------------------------------------------------
MarkingPanel._indexArrayView = null;
MarkingPanel._Viewsimulator = null;

var alias21 = MarkingPanel.drawMarkingPanel;
MarkingPanel.drawMarkingPanel = function() {
	alias21.call(this);

	if (!this.isMarkingEnabled()) {
		return;
	}
	if (!root.isSystemSettings(SystemSettingsType.MARKING)) {
		return;
	}
	root.drawFadeLight(this._indexArrayView, 000000, this._getAlpha());
}

var alias22 = MarkingPanel.updateMarkingPanel;
MarkingPanel.updateMarkingPanel = function() {
	alias22.call(this);

	if (!this.isMarkingEnabled()) {
		return;
	}
	this._indexArrayView = IrohaPlugin_GetisMoveMode.AllMarkingPanelSetup();
}

var alias23 = MarkingPanel.updateMarkingPanelFromUnit;
MarkingPanel.updateMarkingPanelFromUnit = function(unit) {
	alias23.call(this, unit);
	if (!this.isMarkingEnabled()) {
		return;
	}
	this._indexArrayView = IrohaPlugin_GetisMoveMode.AllMarkingPanelSetup();
}

//--------------------------------------------------
// 敵にカーソルを乗せたとき，視界外を暗闇にする処理
//--------------------------------------------------
MapLightType.VIEW = 3;
UnitRangePanel._mapChipLightView = null;

var alias11 = UnitRangePanel.initialize;
UnitRangePanel.initialize = function() {
	alias11.call(this);
	this._mapChipLightView = createObject(MapChipLight);
}

var alias12 = UnitRangePanel.moveRangePanel;
UnitRangePanel.moveRangePanel = function() {
	if (this._unit === null) {
		return MoveResult.CONTINUE;
	}
	this._mapChipLightView.moveLight();

	return alias12.call(this);
}

var alias13 = UnitRangePanel.drawRangePanel;
UnitRangePanel.drawRangePanel = function() {
	alias13.call(this);

	if (this._unit === null) {
		return;
	}
	if (PosChecker.getUnitFromPos(this._x, this._y) !== this._unit) {
		return;
	}
	if (this._unit.isWait()) {
		return;
	}
	this._mapChipLightView.drawLight();
}

var alias14 =  UnitRangePanel._setLight;
UnitRangePanel._setLight = function(isWeapon) {
	alias14.call(this, isWeapon);

	var array = IrohaPlugin_GetisMoveMode.BlackAreaSetup(this._unit);
	this._mapChipLightView.setLightType(MapLightType.VIEW);
	this._mapChipLightView.setIndexArray(array);
}

var alias15 = MapChipLight.drawLight;
MapChipLight.drawLight = function() {
	alias15.call(this);

	if (this._type === MapLightType.VIEW) {
		root.drawFadeLight(this._indexArray, 000000, this._getAlpha());
	}
}

//--------------------------------------------------
// 味方ユニットの移動先選択時，敵ユニットの視界内に入ったら「！」の吹出しを表示
//--------------------------------------------------
MapSequenceArea._fukidashiSimulator = null;
MapSequenceArea._inprocess = null;

//以下，視界中に味方ユニットがいる敵に吹き出しを出す処理
var alias01 = MapSequenceArea._prepareSequenceMemberData;
MapSequenceArea._prepareSequenceMemberData = function(parentTurnObject) {
	this._fukidashiPic = CacheControl.get_FukidashiPic();
	this._fukidashiSimulator = root.getCurrentSession().createMapSimulator();
	alias01.call(this, parentTurnObject);
};

var alias02 = MapSequenceArea._completeSequenceMemberData;
MapSequenceArea._completeSequenceMemberData = function(parentTurnObject) {
	alias02.call(this, parentTurnObject);

	this._inprocess = true;
	var currentMapCursorX = this._mapCursor.getX();
	var currentMapCursorY = this._mapCursor.getY();
	IrohaPlugin_GetisMoveMode.fukidashiturnSetup(currentMapCursorX, currentMapCursorY, 0);
};

var alias03 = MapSequenceArea._moveArea;
MapSequenceArea._moveArea = function() {
	var result = alias03.call(this);

	var currentMapCursorX = this._mapCursor.getX();
	var currentMapCursorY = this._mapCursor.getY();
	if ((this._prevMapCursorMapX !== currentMapCursorX || this._prevMapCursorMapY !== currentMapCursorY) 
	&& this._isTargetMovable() === true) {
		if (this._unitRangePanel.isMoveArea(currentMapCursorX, currentMapCursorY) > 0) {
			IrohaPlugin_GetisMoveMode.fukidashiturnSetup(currentMapCursorX, currentMapCursorY, 1);
		}
	}

	return result;
};

var alias04 = MapSequenceArea._drawArea;
MapSequenceArea._drawArea = function() {
	alias04.call(this);

	var enemyList = EnemyList.getAliveList();
	for (var i = 0; i < enemyList.getCount(); i++) {
		var unit = enemyList.getData(i);
		if (unit.custom.isMoveMode === false) {
			var picx = LayoutControl.getPixelX(unit.getMapX());
			var picy = LayoutControl.getPixelY(unit.getMapY());
			var dyarray = [0, 3, -3, -5, -6, -5, -2, 0];

			if (unit.custom.dtime !== - 1 && unit.custom.dtime < 7) {
				unit.custom.dtime++;
			}

			var pic = CacheControl.get_FukidashiPic();
			pic.draw(picx + 12, picy - 12 + dyarray[unit.custom.dtime]);
		}
	}
};

//--------------------------------------------------
// 敵ターン開始時に，各敵に対してisMoveModeをセット
//--------------------------------------------------
var alias05 = EnemyTurn._completeTurnMemberData;
EnemyTurn._completeTurnMemberData = function() {
	alias05.call(this);
	IrohaPlugin_GetisMoveMode.enemyturnSetup();
}

//--------------------------------------------------
// 「！」の吹出し表示に必要なキャッシュ処理
//--------------------------------------------------

CacheControl._FukidashiPic = null;

CacheControl.get_FukidashiPic = function() {
	var pic;

	if (!this._FukidashiPic) {
		pic = root.getMaterialManager().createImage('Fukidashi', 'Fukidashi.png');
		this._FukidashiPic = this._createImageCache(pic);
	} else if (!this._FukidashiPic.picCache.isCacheAvailable()) {
		pic = root.getMaterialManager().createImage('Fukidashi', 'Fukidashi.png');
		this._setImageCache(pic, this._FukidashiPic.picCache);		
	}

	return this._FukidashiPic.picCache;
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

//--------------------------------------------------
// 以下は呼び出し用の基礎処理
//--------------------------------------------------

//視界タイプの定義
var ViewLengthType = {
	NONE: 0,
	NORMAL: 1,
	EQUALATTACKRANGE: 2,
	ALLMAP: 3
}

// 敵が移動型かどうかの判定を行う
// 敵ターン開始時に処理を実施し，unit.custom.isMoveModeに値を格納する
IrohaPlugin_GetisMoveMode = {

	_simulator: null,
	_enemyList: null,
	_viewlengthtype: null,
	_array: [],
	_temparrayholder: [],
	_outputarrayholder: [],

	enemyturnSetup: function() {
		this._simulator = root.getCurrentSession().createMapSimulator();
		this._enemyList = EnemyList.getAliveList();
	
		for (var i = 0; i < this._enemyList.getCount(); i++) {
			this._array = [];
			var unit = this._enemyList.getData(i);

			this.preparedata(unit);
			unit.custom.isMoveMode = this.getMovemode(unit);
		}
	},

	fukidashiturnSetup: function(unitx, unity, setuptype) {
		this._simulator = root.getCurrentSession().createMapSimulator();
		this._enemyList = EnemyList.getAliveList();
	
		for (var i = 0; i < this._enemyList.getCount(); i++) {
			this._array = [];
			var unit = this._enemyList.getData(i);
			this.preparedata(unit);

			unit.custom.isMoveMode = true;
			//視界がALLMAPの場合，unit.custom.isMoveMode = falseで確定
			if (this._viewlengthtype == ViewLengthType.ALLMAP) {
				unit.custom.isMoveMode = false;
			}
			for (var j = 0; j < this._array.length; j++) {
				var index = this._array[j];
				var x = CurrentMap.getX(index);
				var y = CurrentMap.getY(index);
	
				if (unitx == x && unity == y) {
					unit.custom.isMoveMode = false;
				}
			}

			if (unit.custom.isMoveMode === true) {
				unit.custom.dtime = -1;
			} else {
				if (unit.custom.dtime == -1 && setuptype == 1) {
					unit.custom.dtime = 0;
				}
				if (setuptype == 0) {
					unit.custom.dtime = 0;
				}
			}
		}

	},

	BlackAreaSetup: function(unit) {
		var outputarray = [];
		this._simulator = root.getCurrentSession().createMapSimulator();
		this._array = [];
		this.preparedata(unit);

		if (unit.getUnitType() == UnitType.PLAYER || unit.getUnitType() == UnitType.ALLY) {
			return outputarray;
		}
		if (this._viewlengthtype == ViewLengthType.ALLMAP) {
			return outputarray;
		}

		var mapwidth = root.getCurrentSession().getCurrentMapInfo().getMapWidth();
		var mapheight = root.getCurrentSession().getCurrentMapInfo().getMapHeight();
		for (var i = 0; i < mapwidth * mapheight; i++) {
			if (this._array.indexOf(i) === -1) {
				outputarray.push(i);
			}
		}

		return outputarray;
	},

	AllMarkingPanelSetup: function() {
		var temparray = [];
		var outputarray = [];
		this._array = [];
		this._simulator = root.getCurrentSession().createMapSimulator();

		this._enemyList = EnemyList.getAliveList();
		for (var i = 0; i < this._enemyList.getCount(); i++) {
			var unit = this._enemyList.getData(i);
			this.preparedata(unit);

			if (this._viewlengthtype == ViewLengthType.ALLMAP) {
				return [];
			}

			temparray = this._array.concat(temparray);
		}
		if (temparray == this._temparrayholder) {
			return this._outputarrayholder;
		}
		this._temparrayholder = temparray;
		outputarray = this.ReverseArray(temparray);
		this._outputarrayholder = outputarray;

		return outputarray;
	},

	//視界を反転して暗闇になるindexを割出す
	ReverseArray: function(array) {
		outputarray = [];
		var hash = makeHashList(array);

		var mapwidth = root.getCurrentSession().getCurrentMapInfo().getMapWidth();
		var mapheight = root.getCurrentSession().getCurrentMapInfo().getMapHeight();
		for (var i = 0; i < mapwidth * mapheight; i++) {
			if (hashSearch(hash, i) == -1) { 
				outputarray.push(i);
			}
		}
		return outputarray;
	},

	preparedata: function(unit) {
		var attackRange = UnitRangePanel.getUnitAttackRange(unit);
		if (attackRange.endRange !== 0) {
			this._viewlengthtype = ViewLengthType.NONE;
			if (unit.custom.ViewLength) {
				if (unit.custom.ViewLength == 1) {
					this._viewlengthtype = ViewLengthType.EQUALATTACKRANGE;
				} else if (unit.custom.ViewLength == 99) {
					this._viewlengthtype = ViewLengthType.ALLMAP;
				} else {
					this._viewlengthtype = ViewLengthType.NORMAL;
				}
			}

			if (this._viewlengthtype == ViewLengthType.EQUALATTACKRANGE) {
				this._simulator.startSimulationWeapon(unit, attackRange.mov, attackRange.startRange, attackRange.endRange);
				this._array = this._simulator.getSimulationIndexArray();
				this._array = this._array.concat(this._simulator.getSimulationWeaponIndexArray());
			}
			if (this._viewlengthtype == ViewLengthType.NORMAL) {
				this._simulator.disableMapUnit();
				this._simulator.disableTerrain();
				this._simulator.disableRestrictedPass();

				this._simulator.startSimulation(unit, unit.custom.ViewLength);
				this._array = this._simulator.getSimulationIndexArray();
			}
		}
	},	

	getMovemode: function(unit) {
		var result = true;

		//視界がALLMAPの場合，unit.custom.isMoveMode = falseで確定
		if (this._viewlengthtype == ViewLengthType.ALLMAP) {
			return false;
		}

		for (var j = 0; j < this._array.length; j++) {
			var index = this._array[j];
			var x = CurrentMap.getX(index);
			var y = CurrentMap.getY(index);
			var targetUnit = PosChecker.getUnitFromPos(x, y);

			if (targetUnit) {
				if(targetUnit.getUnitType() == UnitType.PLAYER || targetUnit.getUnitType() == UnitType.ALLY) {
					result = false;
				}
			}
		}
		return result;
	}, 

	getisMoveMode: function() {
		if (root.getBaseScene() == SceneType.BATTLESETUP) {
			return false;
		} else {
			return root.getCurrentSession().getActiveEventUnit().custom.isMoveMode;
		}
	}
}

makeHashList = function (list) {
	var hashList = list.reduce(function(directory, value, index) {
		directory[value] = (directory[value] || []).concat(index);
		return directory;
	}, {});
	return hashList;
}

hashSearch = function (list, num) {
	var index = -1;
	if(num in list) {
		index = list[num];
	}
	return index;
}

Array.prototype.reduce = function(callback /*, initialValue*/) {
	'use strict';
	if (this == null) {
		throw new TypeError('Array.prototype.reduce called on null or undefined');
	}
	if (typeof callback !== 'function') {
		throw new TypeError(callback + ' is not a function');
	}
	var t = Object(this), len = t.length >>> 0, k = 0, value;
	if (arguments.length == 2) {
		value = arguments[1];
	} else {
		while (k < len && !(k in t)) {
		k++; 
		}
		if (k >= len) {
		throw new TypeError('Reduce of empty array with no initial value');
		}
		value = t[k++];
	}
	for (; k < len; k++) {
		if (k in t) {
		value = callback(value, t[k], k, t);
		}
	}
	return value;
};