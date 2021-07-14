/*--------------------------------------------------------------------------
  
  任意のアニメーション呼び出し

  ■使用方法
  IrohaAnimationPlayer.setData(isParallel,　isruntime, AnimeID, AnimeX, AnimeY);
  で任意のアニメーションを呼び出すことができます。

  isParallel : true = 並列処理 / false = 直列処理
  isruntime : true = ランタイム / false = オリジナル
  AnimeID : アニメーションID
  AnimeX : アニメーションを再生するX座標
  AnimeY : アニメーションを再生するY座標

  【例】
  IrohaAnimationPlayer.setData(false,　true, 0, 10, 20);
  →(10, 20)にランタイムアニメーションid:0（火柱）を直列処理で描画

  ■バージョン履歴
  2021/07/14  新規作成

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

//-------------------------------------------
// 基礎処理
//-------------------------------------------
var IrohaAnimationPlayer = {
  isActive: false,
  _isParallel: false, //false:直列, true:並列
  _isruntime: true,
  _AnimeID: 0,
  _AnimeX: 0,
  _AnimeY: 0,

  setData: function(isParallel, isruntime, AnimeID, AnimeX, AnimeY) {
    this._isParallel = isParallel;
    this._isruntime = isruntime;
    this._isAnimeID = AnimeID;
    this._AnimeX = AnimeX;
    this._AnimeY = AnimeY;

    this.isActive = true;
  }
};

var DrawAnimationMode = {
  ANIME: 0
};

//-------------------------------------------
// 直列処理アニメーション
//-------------------------------------------
var IrohaSeriesAnimation = {
  _dynamicAnime: null,

  enterSceneCycle: function() {
    this._dynamicAnime = createObject(DynamicAnime);
  },

  moveSceneCycle: function() {
    var result = MoveResult.CONTINUE;

    if (IrohaAnimationPlayer.isActive === true && IrohaAnimationPlayer._isParallel === false) {
      IrohaAnimationPlayer.isActive = false;

      var anime = root.getBaseData().getEffectAnimationList(IrohaAnimationPlayer._isruntime).getDataFromId(IrohaAnimationPlayer._AnimeID);
      var pos = LayoutControl.getMapAnimationPos(IrohaAnimationPlayer._AnimeX, IrohaAnimationPlayer._AnimeY, anime);
    
      this._dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
    }

    if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
      result = MoveResult.END;
    }

    return result;
  },

  drawSceneCycle: function() {
    this._dynamicAnime.drawDynamicAnime();
  }
};

//-------------------------------------------
// 並列処理アニメーション
//-------------------------------------------
var IrohaParallelAnimation = {
  _dynamicAnime: null,

  enterSceneCycle: function() {
    this._dynamicAnime = createObject(DynamicAnime);
  },

  moveSceneCycle: function() {
    if (IrohaAnimationPlayer.isActive === true && IrohaAnimationPlayer._isParallel === true) {
      IrohaAnimationPlayer.isActive = false;

      var anime = root.getBaseData().getEffectAnimationList(IrohaAnimationPlayer._isruntime).getDataFromId(IrohaAnimationPlayer._AnimeID);
      var pos = LayoutControl.getMapAnimationPos(IrohaAnimationPlayer._AnimeX, IrohaAnimationPlayer._AnimeY, anime);
    
      this._dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
    }

    this._dynamicAnime.moveDynamicAnime();
  },

  drawSceneCycle: function() {
    this._dynamicAnime.drawDynamicAnime();
  }
};

//-------------------------------------------
// 呼び出し処理
//-------------------------------------------
(function() {
var alias01 = ScriptCall_Enter;
ScriptCall_Enter = function(sceneType, commandType) {
  var result = alias01.call(this, sceneType, commandType);

  IrohaParallelAnimation.enterSceneCycle();
  IrohaSeriesAnimation.enterSceneCycle();

  return result;
}
  

var alias02 = ScriptCall_Move;
ScriptCall_Move = function(sceneType, commandType) {
  var result = IrohaSeriesAnimation.moveSceneCycle();

  if (result !== MoveResult.END) {
    return result;
  }

  var result = alias02.call(this, sceneType, commandType);

  IrohaParallelAnimation.moveSceneCycle();

  return result;
}
  
var alias03 = ScriptCall_Draw;
ScriptCall_Draw = function(sceneType, layerNumber, commandType) {
  alias03.call(this, sceneType, layerNumber, commandType);

  IrohaParallelAnimation.drawSceneCycle();
  IrohaSeriesAnimation.drawSceneCycle();
}

})();
