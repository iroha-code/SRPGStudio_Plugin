/*--------------------------------------------------------------------------
  
  FadeLightを明滅させるプラグイン

  ■バージョン履歴
  2022/05/29  新規作成

  ■対応バージョン
  SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し OK
  ・再配布、転載 OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() {

// 明滅の周期
// 下記の設定だと60フレーム（＝1秒）です
var MAPCHIPLIGHT_MOVE_FRAME = 60;

MapChipLight._cyclecounter = 0;
var alias01 = MapChipLight.initialize;
MapChipLight.initialize = function() {
  this._cyclecounter = 0;

  alias01.call(this);
}

var alias02 = MapChipLight.moveLight;
MapChipLight.moveLight = function() {
  // MapLightType.NORMALの場合のみ
  if (this._type === MapLightType.NORMAL) {
    this._cyclecounter++;
    if (this._cyclecounter >= MAPCHIPLIGHT_MOVE_FRAME) {
      this._cyclecounter = 0;
    }
  }

  return alias02.call(this);
}

// 三角関数の周期に従って透明度が増減
MapChipLight._getAlpha = function() {
  var basevalue = 128;
  var highPerformanceCorrection = DataConfig.isHighPerformance() ? 1 : 2;
  var rate = Math.sin(2 * Math.PI * this._cyclecounter / MAPCHIPLIGHT_MOVE_FRAME) + 1;

  var value = Math.floor(basevalue / 2 * rate * highPerformanceCorrection);
  return value;
}

// 色を調整する場合はこちら
// デフォルトの色（白）に戻す場合は 0xffffff を指定
MapChipLight._getColor = function() {
  return 0xfffacd;
}

})();
