/*--------------------------------------------------------------------------
  
　目標確認画面で変数利用

　■概要
　目標確認画面の勝利条件・敗北条件の項目で、メッセージの変数（\act、\pdb[1]など）を利用できます。
　http://srpgstudio.com/help/control.html

　※本プラグインを マップコマンド画面で目標確認も表示.js と併用することで、
　　マップコマンド画面に出てくる目標確認ウインドウにも同様に反映されます。
　https://github.com/iroha-code/SRPGStudio_Plugin/blob/main/%E3%83%9E%E3%83%83%E3%83%97%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E7%94%BB%E9%9D%A2%E3%81%A7%E7%9B%AE%E6%A8%99%E7%A2%BA%E8%AA%8D%E3%82%82%E8%A1%A8%E7%A4%BA.js

　■バージョン履歴
　2023/01/15  新規作成

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

(function () { 

var alias01 = ObjectiveScrollbar.drawScrollContent;
ObjectiveScrollbar.drawScrollContent = function(x, y, text, isSelect, index) {
	var replacer = createObject(VariableReplacer);
	var text = replacer.startReplace(text);

	alias01.call(this, x, y, text, isSelect, index);
}

})();