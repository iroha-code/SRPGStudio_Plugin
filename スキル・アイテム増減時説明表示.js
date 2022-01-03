/*--------------------------------------------------------------------------
  
  スキル・アイテム増減時説明表示

  ■バージョン履歴
  2022/01/03  新規作成

  ■対応バージョン
  SRPG Studio Version:1.248
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() {

var alias01 = SkillChangeNoticeView.drawNoticeViewContent;
SkillChangeNoticeView.drawNoticeViewContent = function(x, y) {
  alias01.call(this, x, y);

  var textui = root.queryScreen('SkillList').getBottomFrameTextUI();
  var text = this._targetSkill.getDescription();
  TextRenderer.drawScreenBottomText(text, textui);
}

var alias02 = ItemChangeNoticeView.drawNoticeViewContent;
ItemChangeNoticeView.drawNoticeViewContent = function(x, y) {
  alias02.call(this, x, y);

  var textui = root.queryScreen('ItemUse').getBottomFrameTextUI();
  var text = this._targetItem.getDescription();
  TextRenderer.drawScreenBottomText(text, textui);
}

})();
  