/*--------------------------------------------------------------------------

  スキルで付与するステート詳細表示

  スキル種類が「ステート攻撃」の場合、スキル詳細ウインドウに隣接してステートの説明文を表示します。

  ■バージョン履歴
  2022/03/26 新規作成
  2022/04/03 スキルを所持していないユニットのユニットウインドウを開くとゲームが止まるバグを修正

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
// UnitMenu にSkillStateInfoWindowを追加
// --------------------------------------------------
UnitMenuBottomWindow._skillStateInfoWindow = null;

var alias01 = UnitMenuBottomWindow.setUnitMenuData;
UnitMenuBottomWindow.setUnitMenuData = function() {
  alias01.call(this);

  this._skillStateInfoWindow = createWindowObject(SkillStateInfoWindow, this);
}

var alias02 = UnitMenuBottomWindow.moveWindowContent;
UnitMenuBottomWindow.moveWindowContent = function() {
  var result = alias02.call(this);

  var skillEntry = this._skillInteraction._scrollbar.getObject();
  if (skillEntry) {
    this._skillStateInfoWindow.setSkillInfoData(skillEntry.skill, skillEntry.objecttype);
  }

  return result;
}

var alias03 = UnitMenuBottomWindow._drawInfoWindow;
UnitMenuBottomWindow._drawInfoWindow = function(xBase, yBase) {
  alias03.call(this, xBase, yBase);

  if (this._isTracingLocked) {
    return;
  }

  var help = this._getActiveUnitMenuHelp();
  if (help === UnitMenuHelp.SKILL) {
    //上下方向のみ 表示可能
    this._skillStateInfoWindow.setWindowDirection(xBase, yBase, this._skillInteraction.getInteractionWindow().getWindowWidth(), this._skillInteraction.getInteractionWindow().getWindowHeight(), false, true, false, true);  
    this._skillStateInfoWindow.drawWindow(this._skillStateInfoWindow._x, this._skillStateInfoWindow._y);
  }
}
// --------------------------------------------------
// SkillScreen にSkillStateInfoWindowを追加
// --------------------------------------------------
SkillScreen._skillStateInfoWindow = null;

var alias11 = SkillScreen._prepareScreenMemberData;
SkillScreen._prepareScreenMemberData = function(screenParam) {
  alias11.call(this, screenParam);

  this._skillStateInfoWindow = createWindowObject(SkillStateInfoWindow, this); 
}

var alias12 = SkillScreen._completeScreenMemberData;
SkillScreen._completeScreenMemberData = function(screenParam) {
  alias12.call(this, screenParam);

  var arr = this._getArray();
  this._skillStateInfoWindow.setSkillInfoData(arr[0].skill, ObjectType.NULL);
}

var alias13 = SkillScreen.changeSkill;
SkillScreen.changeSkill = function(obj) {
  alias13.call(this, obj);

  this._skillStateInfoWindow.setSkillInfoData(obj.skill, ObjectType.NULL);
}

var alias14 = SkillScreen.drawScreenCycle;
SkillScreen.drawScreenCycle = function() {
  alias14.call(this);

  var height = this._skillListWindow.getWindowHeight();
  var width = this._skillInfoWindow.getWindowWidth() + this._skillListWindow.getWindowWidth();
  var x = LayoutControl.getCenterX(-1, width) + this._skillListWindow.getWindowWidth();
  var y = LayoutControl.getCenterY(-1, height) + (height - this._skillInfoWindow.getWindowHeight());

  //上方向のみ 表示可能
  this._skillStateInfoWindow.setWindowDirection(x, y, this._skillInfoWindow.getWindowWidth(), this._skillInfoWindow.getWindowHeight(), false, true, false, false);  
  this._skillStateInfoWindow.drawWindow(this._skillStateInfoWindow._x, this._skillStateInfoWindow._y);
}

// --------------------------------------------------
// SkillStateInfoWindowクラス
// --------------------------------------------------
var SkillStateInfoWindow = defineObject(BaseWindow,
{
  _skill: null,
	_objecttype: 0,
	_aggregationViewer: null,
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
		var width = 0;
		
		if (this._objecttype === ObjectType.NULL || (this._aggregationViewer !== null && this._aggregationViewer.getAggregationViewerCount() > 0)) {
			width += 30;
		}
		
		return 210 + width;
	},
  
  getWindowHeight: function() {
    return 125;
  },
  
	setSkillInfoData: function(skill, objecttype) {
		this._skill = skill;
    this.enableWindow(false);

    if (this._skill === null) {
			return;
		}

    if (this._skill.getSkillType() !== SkillType.STATEATTACK) {
      return;
    }

    this._state = AttackEvaluator.HitCritical._getState(skill);
    if (this._state) {
      this._aggregationViewer = createObject(AggregationViewer);
      this._aggregationViewer.setEnabled(DataConfig.isAggregationVisible());
      this._aggregationViewer.setAggregationViewer(skill.getTargetAggregation());
      this._objecttype = objecttype;
  
      this._infotext = this._state.getDescription();
      this.enableWindow(true);
    }
  },

  //SkillInfoWindowから見てどの方向にwindowを表示するか決定し、xy座標を書き換える
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
