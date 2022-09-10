/*--------------------------------------------------------------------------

  アイテム利用AI_移動制御

  敵がアイテムを使用するとき，以下のように移動を制御できるようにします。
   ① 味方に接近しながらアイテムを使用する
   ② その場にとどまってアイテムを使用する
　
  ■概要
  ① 武器のカスタムパラメータに {rush : true} が設定してある場合，
    敵が味方に接近しながらアイテムを使用するようになります。
  ② 武器のカスタムパラメータに {stay : true} が設定してある場合，
    敵がその場にとどまってアイテムを使用するようになります。
  ※デフォルトの挙動では，MapIndexが最小となる座標（上または左）に移動するようです。

  ■バージョン履歴
  2021/04/04  新規作成

　■対応バージョン
　SRPG Studio Version:1.225
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し　OK
  ・再配布、転載　OK
  ・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function() {

var alias = AutoActionBuilder.buildApproachAction;
AutoActionBuilder.buildApproachAction = function(unit, autoActionArray) {
	var combination;
	var combinationtmp;
	
	// 現在位置から攻撃可能なユニットの中で、最も優れた組み合わせを取得する
	combination = CombinationManager.getApproachCombination(unit, true);
	
	if (combination !== null) {
		if (combination.item) {
			if (combination.item.custom.rush == true) {
				// rushアイテムを利用する場合は，攻撃範囲にユニットがいない場合と同様に処理する
				// 現在位置では攻撃可能な相手がいないため、どの敵を狙うべきかを取得する
				combinationtmp = CombinationManager.getEstimateCombination(unit);
				if (combinationtmp !== null) {
//					root.log(unit.getName() + ' rushアイテム使用');
					combination.cource = combinationtmp.cource;
					this._pushGeneral(unit, autoActionArray, combination);
					
					return true;
				} else {
					return true;
				}
			}
			if (combination.item.custom.stay == true) {
				// stayアイテムを利用する場合は，その場に留まってアイテムを使用する
				// courceを空白にすることで実現
//				root.log(unit.getName() + ' stayアイテム使用');
				combination.cource = [];
				this._pushGeneral(unit, autoActionArray, combination);
				return true;
			}
		}
	}
	return alias.call(this, unit, autoActionArray);
}

CombinationSelectorEx.getEstimateCombinationIndex = function(unit, combinationArray) {
	var i, index, combination;
	var count = combinationArray.length;
	var data = this._createEstimateData();
	
	for (i = 0; i < count; i++) {
		combination = combinationArray[i];

		//処理追加 ----------------------------
		if (combination.item && combination.item.custom.rush == true) {
			continue;
		}
		//------------------------------------

		if (this._isDistanceBase(unit, combination)) {
			this._checkDistanceBaseIndex(unit, combination, data, i);
		}
		else {
			this._checkScoreBaseIndex(unit, combination, data, i);
		}
	}
	
	if (data.recheckIndex !== -1) {
		this._checkDistanceBaseIndex(unit, combinationArray[data.recheckIndex], data, data.recheckIndex);
	}
	
	index = data.combinationIndex;
	if (index < 0) {
		return -1;
	}
	
	combinationArray[index].posIndex = data.posIndex;
	combinationArray[index].movePoint = data.min;
	
	return index;
}

})();
