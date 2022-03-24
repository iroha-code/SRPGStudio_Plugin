/*--------------------------------------------------------------------------

  武器・アイテムで付与するステート詳細表示

  武器に「追加ステート」の設定がある場合、あるいはアイテムの種類が「ステート付加」の場合、
  アイテム詳細ウインドウに隣接してステートの説明文を表示します。

  ■バージョン履歴
  2022/03/25  新規作成

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

// --------------------------------------------------
// ....SelectMenu.moveWindowManager をエイリアス化するための補助処理
// --------------------------------------------------
ItemListScrollbar._tempIndex = false;
var alias00 = ItemListScrollbar.checkAndUpdateIndex;
ItemListScrollbar.checkAndUpdateIndex = function() {
  this._tempIndex = this._prevIndex;

  return alias00.call(this);
}

// --------------------------------------------------
// WeaponSelectMenu にItemStateInfoWindowを追加
// --------------------------------------------------
WeaponSelectMenu._itemStateInfoWindow = null;

var alias01 = WeaponSelectMenu.setMenuTarget;
WeaponSelectMenu.setMenuTarget = function(unit) {
  alias01.call(this, unit);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias02 = WeaponSelectMenu.moveWindowManager;
WeaponSelectMenu.moveWindowManager = function() {
  var result = alias02.call(this);

  if (this._itemListWindow._scrollbar._tempIndex !== this._itemListWindow._scrollbar.getIndex()) {
    this._itemStateInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
    this._itemListWindow._scrollbar._tempIndex = this._itemListWindow._scrollbar.getIndex();

    //上方向以外 表示可能
    var x = this.getPositionWindowX();
    var y = this.getPositionWindowY() + this._itemListWindow.getWindowHeight() + this._getWindowInterval();
    this._itemStateInfoWindow.setWindowDirection(x, y, this.getTotalWindowWidth(), this._itemInfoWindow.getWindowHeight(), true, false, true, true);
  }

  return result;
}

var alias03 = WeaponSelectMenu.drawWindowManager;
WeaponSelectMenu.drawWindowManager = function() {
  alias03.call(this);

  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// WandSelectMenu にItemStateInfoWindowを追加
// --------------------------------------------------
WandSelectMenu._itemStateInfoWindow = null;

var alias11 = WandSelectMenu.setMenuTarget;
WandSelectMenu.setMenuTarget = function(unit) {
  alias11.call(this, unit);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias12 = WandSelectMenu.moveWindowManager;
WandSelectMenu.moveWindowManager = function() {
  var result = alias12.call(this);

  if (this._itemListWindow._scrollbar._tempIndex !== this._itemListWindow._scrollbar.getIndex()) {
    this._itemStateInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
    this._itemListWindow._scrollbar._tempIndex = this._itemListWindow._scrollbar.getIndex();

    //上方向以外 表示可能
    var x = this.getPositionWindowX();
    var y = this.getPositionWindowY() + this._itemListWindow.getWindowHeight() + this._getWindowInterval();
    this._itemStateInfoWindow.setWindowDirection(x, y, this.getTotalWindowWidth(), this._itemInfoWindow.getWindowHeight(), true, false, true, true);
  }

  return result;
}

var alias13 = WandSelectMenu.drawWindowManager;
WandSelectMenu.drawWindowManager = function() {
  alias13.call(this);

  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}
// --------------------------------------------------
// ItemSelectMenu にItemStateInfoWindowを追加
// --------------------------------------------------
ItemSelectMenu._itemStateInfoWindow = null;

var alias21 = ItemSelectMenu.setMenuTarget;
ItemSelectMenu.setMenuTarget = function(unit) {
  alias21.call(this, unit);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias22 = ItemSelectMenu.moveWindowManager;
ItemSelectMenu.moveWindowManager = function() {
  var result = alias22.call(this);

  if (this._itemListWindow._scrollbar._tempIndex !== this._itemListWindow._scrollbar.getIndex()) {
    this._itemStateInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
    this._itemListWindow._scrollbar._tempIndex = this._itemListWindow._scrollbar.getIndex();

    //上方向以外 表示可能
    var x = this.getPositionWindowX();
    var y = this.getPositionWindowY() + this._itemListWindow.getWindowHeight() + this._getWindowInterval();
    this._itemStateInfoWindow.setWindowDirection(x, y, this.getTotalWindowWidth(), this._itemInfoWindow.getWindowHeight(), true, false, true, true);
  }

  return result;
}

var alias23 = ItemSelectMenu.drawWindowManager;
ItemSelectMenu.drawWindowManager = function() {
  alias23.call(this);

  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// UnitMenu にItemStateInfoWindowを追加
// --------------------------------------------------
UnitMenuBottomWindow._itemStateInfoWindow = null;

var alias31 = UnitMenuBottomWindow.setUnitMenuData;
UnitMenuBottomWindow.setUnitMenuData = function() {
  alias31.call(this);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this);
}

var alias32 = UnitMenuBottomWindow.moveWindowContent;
UnitMenuBottomWindow.moveWindowContent = function() {
  var result = alias32.call(this);

  if (this._itemInteraction._window._isWindowEnabled) {
    var item = this._itemInteraction._scrollbar.getObject();
    this._itemStateInfoWindow.setInfoItem(item);
  } else {
    this._itemStateInfoWindow.setInfoItem(null);
  }
  return result;
}

var alias33 = UnitMenuBottomWindow._drawInfoWindow;
UnitMenuBottomWindow._drawInfoWindow = function(xBase, yBase) {
  alias33.call(this, xBase, yBase);

  if (this._isTracingLocked) {
    return;
  }

  var help = this._getActiveUnitMenuHelp();
  x = xBase + ItemRenderer.getItemWidth();
  if (help === UnitMenuHelp.ITEM) {
    if (x + this._itemInteraction.getInteractionWindow().getWindowWidth() > root.getGameAreaWidth()) {
      x -= x + this._itemInteraction.getInteractionWindow().getWindowWidth() - root.getGameAreaWidth();
      x -= 8;
    }

    //上下方向のみ 表示可能
    this._itemStateInfoWindow.setWindowDirection(x, yBase, this._itemInteraction.getInteractionWindow().getWindowWidth(), this._itemInteraction.getInteractionWindow().getWindowHeight(), false, true, false, true);  
    this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
  }
}

// --------------------------------------------------
// ShopLayoutScreen にItemStateInfoWindowを追加
// --------------------------------------------------
ShopLayoutScreen._itemStateInfoWindow = null;

var alias41 = ShopLayoutScreen._prepareScreenMemberData;
ShopLayoutScreen._prepareScreenMemberData = function(screenParam) {
  alias41.call(this, screenParam);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias42 = ShopLayoutScreen._processMode;
ShopLayoutScreen._processMode = function(mode) {
  if (mode === ShopLayoutMode.BUYSELLSELECT) {
    this._itemStateInfoWindow.setInfoItem(null);
  }
  else if (mode === ShopLayoutMode.BUY) {
    this._itemStateInfoWindow.setInfoItem(this._buyItemWindow.getShopSelectItem());
  }
  else if (mode === ShopLayoutMode.SELL) {
    this._itemStateInfoWindow.setInfoItem(this._sellItemWindow.getShopSelectItem());
  }

  alias42.call(this, mode);
}

var alias43 = ShopLayoutScreen.notifyInfoItem;
ShopLayoutScreen.notifyInfoItem = function(item) {
  alias43.call(this, item);
  this._itemStateInfoWindow.setInfoItem(item);
}

var alias44 = ShopLayoutScreen.drawScreenCycle;
ShopLayoutScreen.drawScreenCycle = function() {
  alias44.call(this);

  var x = LayoutControl.getCenterX(-1, this._getTopWindowWidth()) + this._activeItemWindow.getWindowWidth();
  var y = LayoutControl.getCenterY(-1, this._getTopWindowHeight()) + this._keeperWindow.getWindowHeight();

  //下方向のみ 表示可能
  this._itemStateInfoWindow.setWindowDirection(x, y, this._itemInfoWindow.getWindowWidth(), this._itemInfoWindow.getWindowHeight(), false, false, false, true);  
  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// BonusLayoutScreen にItemStateInfoWindowを追加
// --------------------------------------------------
BonusLayoutScreen._itemStateInfoWindow = null;

var alias51 = BonusLayoutScreen._prepareScreenMemberData;
BonusLayoutScreen._prepareScreenMemberData = function(screenParam) {
  alias51.call(this, screenParam);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias52 = BonusLayoutScreen._processMode;
BonusLayoutScreen._processMode = function(mode) {
  if (mode === ShopLayoutMode.BUY) {
    this._itemStateInfoWindow.setInfoItem(this._buyItemWindow.getShopSelectItem());
  }

  alias52.call(this, mode);
}

var alias53 = BonusLayoutScreen.notifyInfoItem;
BonusLayoutScreen.notifyInfoItem = function(item) {
  alias53.call(this, item);
  this._itemStateInfoWindow.setInfoItem(item);
}

var alias54 = BonusLayoutScreen.drawScreenCycle;
BonusLayoutScreen.drawScreenCycle = function() {
  alias54.call(this);

  var x = LayoutControl.getCenterX(-1, this._getTopWindowWidth()) + this._activeItemWindow.getWindowWidth();
  var y = LayoutControl.getCenterY(-1, this._getTopWindowHeight()) + this._keeperWindow.getWindowHeight();

  // 下方向のみ 表示可能
  this._itemStateInfoWindow.setWindowDirection(x, y, this._itemInfoWindow.getWindowWidth(), this._itemInfoWindow.getWindowHeight(), false, false, false, true);  
  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// DurabilitySelectManager にItemStateInfoWindowを追加
// --------------------------------------------------
DurabilitySelectManager._itemStateInfoWindow = null;

var alias61 = DurabilitySelectManager.setTargetUnit;
DurabilitySelectManager.setTargetUnit = function(targetUnit, item) {
  alias61.call(this, targetUnit, item);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias62 = DurabilitySelectManager.moveWindowManager;
DurabilitySelectManager.moveWindowManager = function() {
  var result = alias62.call(this);

  if (this._itemListWindow._scrollbar._tempIndex !== this._itemListWindow._scrollbar.getIndex()) {
    this._itemStateInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
    this._itemListWindow._scrollbar._tempIndex = this._itemListWindow._scrollbar.getIndex();

    //上方向以外 表示可能
    var x = this.getPositionWindowX();
    var y = this.getPositionWindowY() + this._itemListWindow.getWindowHeight() + this._getWindowInterval();
    this._itemStateInfoWindow.setWindowDirection(x, y, this.getTotalWindowWidth(), this._itemInfoWindow.getWindowHeight(), true, false, true, true);
  }

  return result;
}

var alias63 = DurabilitySelectManager.drawWindowManager;
DurabilitySelectManager.drawWindowManager = function() {
  alias63.call(this);

  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// StockItemTradeScreen にItemStateInfoWindowを追加
// --------------------------------------------------
StockItemTradeScreen._itemStateInfoWindow = null;

var alias71 = StockItemTradeScreen._prepareScreenMemberData;
StockItemTradeScreen._prepareScreenMemberData = function(screenParam) {
  alias71.call(this, screenParam);

  this._itemStateInfoWindow = createWindowObject(ItemStateInfoWindow, this); 
}

var alias72 = StockItemTradeScreen.moveScreenCycle;
StockItemTradeScreen.moveScreenCycle = function() {
  var result = alias72.call(this);

  if (this._itemInfoWindow._isWindowEnabled) {
    var item = this._itemInfoWindow.getInfoItem();
    this._itemStateInfoWindow.setInfoItem(item);
  } else {
    this._itemStateInfoWindow.setInfoItem(null);
  }

  return result;
}

var alias73 = StockItemTradeScreen.drawScreenCycle;
StockItemTradeScreen.drawScreenCycle = function() {
  alias73.call(this);

  var width = this._unitItemWindow.getWindowWidth() + this._stockItemWindow.getWindowWidth();
  var unitWindowWidth = this._unitItemWindow.getWindowWidth();
  var stockWindowHeight = this._stockItemWindow.getWindowHeight();
  var x = LayoutControl.getCenterX(-1, width);
  var y = LayoutControl.getCenterY(-1, stockWindowHeight);

  if (this._isRightSideInfoWindow()) {
    xInfo = x + this._stockItemWindow.getWindowWidth();
    yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
  } else {
    xInfo = (x + unitWindowWidth) - this._itemInfoWindow.getWindowWidth();
    yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
  }

  //上方向のみ 表示可能
  this._itemStateInfoWindow.setWindowDirection(xInfo, yInfo, this._itemInfoWindow.getWindowWidth(), this._itemInfoWindow.getWindowHeight(), false, true, false, false);  
  this._itemStateInfoWindow.drawWindow(this._itemStateInfoWindow._x, this._itemStateInfoWindow._y);
}

// --------------------------------------------------
// ItemStateInfoWindowクラス
// --------------------------------------------------
var ItemStateInfoWindow = defineObject(BaseWindow,
{
  _item: null,
  _state: null,
  _infotext: null,
  _x: 0,
  _y: 0,
  
  // BaseWindowのプロパティの置き換え
  _isWindowEnabled: false,
  
  drawWindowContent: function(x, y) {
    if (!this._isWindowEnabled) {
      return;
    }

    var textui = root.queryTextUI('default_window');
    var color = textui.getColor();
    var font = textui.getFont();

    var state = this._state;
    var handle = state.getIconResourceHandle();
    var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
    var iconHeight = GraphicsFormat.ICON_HEIGHT + 5;

    //アイコン＋ステート名を表示
    GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
    TextRenderer.drawKeywordText(x + iconWidth, y, state.getName(), -1, color, font);

    //説明文の内容を表示
    range = createRangeObject(x, y + iconHeight, this.getWindowWidth() - 2 * this.getWindowXPadding(), 65);
    TextRenderer.drawRangeText(range, TextFormat.LEFT, this._infotext, -1, color, font);
    // root.getGraphicsManager().fillRange(range.x, range.y, range.width, range.height, 0, 128); //debug用
  },
  
  getWindowWidth: function() {
    return ItemRenderer.getItemWindowWidth();
  },
  
  getWindowHeight: function() {
    return 125;
  },
  
  setInfoItem: function(item) {
    this._item = item;
    this.enableWindow(false);

    if (item === null) {
			return;
		}

    //ステートを付加する武器の場合
    if (item.isWeapon() === true) {
      this._state = item.getStateInvocation().getState();
      if (this._state) {
        this._infotext = this._state.getDescription();
        this.enableWindow(true);
        return;
      }
    }

    //ステート付加アイテムの場合
    if (item.isWeapon() === false) {
      var stateInfo = item.getStateInfo();
      if (stateInfo) {
        this._state = stateInfo.getStateInvocation().getState();
        if (this._state) {
          this._infotext = this._state.getDescription();
          this.enableWindow(true);
          return;
        }
      }
    }
  },

  //ItemInfoWindowから見てどの方向にwindowを表示するか決定し、xy座標を書き換える
  setWindowDirection: function(x, y, totalWindowWidth, totalWindowHeight, leftAllowed, topAllowed, rightAllowed, bottomAllowed) {
    //下→上→右→左 の順に表示可能かどうかチェック
    if (bottomAllowed) {
      if (y + totalWindowHeight + this.getWindowHeight() <= root.getGameAreaHeight()) {
        this._x = x;
        this._y = y + totalWindowHeight;
        return;
      }
    }
    if (topAllowed) {
      if (y - this.getWindowHeight() >= 0) {
        this._x = x;
        this._y = y - this.getWindowHeight();
        return;
      }
    }
    if (rightAllowed) {
      if (x + totalWindowWidth + this.getWindowWidth() <= root.getGameAreaWidth()) {
        this._x = x + totalWindowWidth;
        this._y = y;
        return;
      }
    }
    if (leftAllowed) {
      if (x - this.getWindowWidth() >= 0) {
        this._x = x - this.getWindowWidth();
        this._y = y;
        return;
      }
    }

    //どの方向でも表示不可の場合、window自体表示しない
    this.enableWindow(false);
  }
});

})();
