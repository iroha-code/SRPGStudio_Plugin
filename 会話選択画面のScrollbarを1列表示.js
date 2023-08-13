/*-----------------------------------------------------

  会話選択画面のScrollbarを1列表示.js

  ■バージョン履歴
  2023/08/14  新規作成

  ■対応バージョン
  SRPG Studio Version:1.234
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。

------------------------------------------------------*/

ImageTalkWindow.setWindowData = function(eventList) {
    var count = LayoutControl.getObjectVisibleCount(DefineControl.getTextPartsHeight(), 4);
    
    this._scrollbar = createScrollbarObject(ImageTalkScrollbar, this);
    this._scrollbar.checkIcon(eventList);
    this._scrollbar.setScrollFormation(1, count);
    this._scrollbar.setActive(true);
}

// ウインドウの横幅を定義
// 270のところは適当に調整してOK
ImageTalkScrollbar.getObjectWidth = function() {
    var dx = this._isIconVisible ? GraphicsFormat.ICON_WIDTH + 5 : 0;
    return 270 + dx;
}