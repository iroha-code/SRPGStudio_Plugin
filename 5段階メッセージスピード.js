/*--------------------------------------------------------------------------
  
  5段階メッセージスピード

  ■バージョン履歴
  2022/06/06  新規作成

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
//--------------------------------
// 基本設定
//--------------------------------
SpeedType.LITTLE_HIGH = 6;
SpeedType.LITTLE_LOW = 7;
StringTable.Speed_LittleHigh = 'やや\n高速';
StringTable.Speed_LittleLow = 'やや\n低速';

//--------------------------------
// 環境画面の表示
//--------------------------------
ConfigItem.MessageSpeed.getObjectArray = function() {
  return [StringTable.Speed_High, StringTable.Speed_LittleHigh, StringTable.Speed_Normal, StringTable.Speed_LittleLow, StringTable.Speed_Low];
}

ConfigItem.MessageSpeed.getFlagCount = function() {
  return 5;
}

ConfigScrollbar.getObjectWidth = function() {
  return 520 + HorizontalLayout.OBJECT_WIDTH;
}

//--------------------------------
// メッセージスピードの刻み幅を設定
//--------------------------------
EnvironmentControl.getMessageSpeedType = function() {
  var speedType;
  var n = root.getMetaSession().getDefaultEnvironmentValue(7);
  
  if (n === 0) {
    speedType = SpeedType.HIGH;
  }
  else if (n === 1) {
    speedType = SpeedType.LITTLE_HIGH;
  }
  else if (n === 2) {
    speedType = SpeedType.NORMAL;
  }
  else if (n === 3) {
    speedType = SpeedType.LITTLE_LOW;
  }
  else {
    speedType = SpeedType.LOW;
  }
  
  return speedType;
}

MessageAnalyzer._convertSpeed = function(speedType) {
  var n = 2;
  
  if (speedType === SpeedType.DIRECT || speedType === SpeedType.SUPERHIGH || speedType === SpeedType.HIGH) {
    n = 0;
  }
  else if (speedType === SpeedType.LITTLE_HIGH) {
    n = 0.5;
  }
  else if (speedType === SpeedType.NORMAL) {
    n = 1;
  }
  else if (speedType === SpeedType.LITTLE_LOW) {
    n = 1.5;
  }
  
  return n;
}

})();
