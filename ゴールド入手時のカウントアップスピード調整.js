/*-----------------------------------------------------

  ゴールド入手時のカウントアップスピード調整.js

  ■バージョン履歴
  2023/11/17  新規作成

  ■対応バージョン
  SRPG Studio Version:1.285
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。

------------------------------------------------------*/

(function() {
	
// メソッドを直接上書きしているので、プラグインの競合に注意
GoldChangeNoticeView.setGoldChangeData = function(n) {
	var speed = 10; // この数字を調整。Defaultは30
	
	this._gold = n;
	if (n < 0) {
		n *= -1;
	}
	
	this._counter = createObject(CycleCounter);
	this._counter.setCounterInfo(4);
	
	this._balancer = createObject(SimpleBalancer);
	this._balancer.setBalancerInfo(0, n);
	this._balancer.setBalancerSpeed(speed);
	this._balancer.startBalancerMove(n);
	
	this.changeCycleMode(GoldNoticeMode.WAIT);
}

})();
