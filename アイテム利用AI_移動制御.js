/*--------------------------------------------------------------------------

  アイテム利用AI_移動制御

  敵がアイテムを使用するとき，以下のように移動を制御できるようにします。
   ① 味方に接近しながらアイテムを使用する
   ② その場にとどまってアイテムを使用する

  ■概要
  ① アイテムのカスタムパラメータに {rush : true} が設定してある場合，
    敵が味方に接近しながらアイテムを使用するようになります。
  ※自軍または同盟軍にもっとも近づくように移動します。
  ② アイテムのカスタムパラメータに {stay : true} が設定してある場合，
    敵がその場にとどまってアイテムを使用するようになります。
  ※デフォルトの挙動では，MapIndexが最小となる座標（上または左）に移動するようです。

  ■バージョン履歴
  2024/02/11  バグ修正
  2024/02/02  武器の使用を禁止した場合も接近するように修正
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
			if (combination.item.custom.stay == true) {
				// stayアイテムを利用する場合は，その場に留まってアイテムを使用する
				// courceを空白にすることで実現
				combination.cource = [];
				this._pushGeneral(unit, autoActionArray, combination);
				return true;
			}
		}
	}
	return alias.call(this, unit, autoActionArray);
}

CombinationSelector._configureScorerSecond = function(groupArray) {
	groupArray.appendObject(AIScorer.Counterattack);
	groupArray.appendObject(AIScorer.Avoid);
	groupArray.appendObject(AIScorer.ItemAdditional); //新規追加
}

})();

// rushアイテムの場合、もっとも距離が味方に近い場所を参照するよう修正
AIScorer.ItemAdditional = defineObject(BaseAIScorer,
{
	getScore: function(unit, combination) {
		var score = -1000;

		if (combination.item.custom.rush) {
			// PlayerUnitと移動先の距離をスコア化
			var playerlist = PlayerList.getSortieList();
			for (var i = 0; i < playerlist.getCount(); i++) {
				var playerUnit = playerlist.getData(i);
				var index = combination.posIndex;
				var x = CurrentMap.getX(index);
				var y = CurrentMap.getY(index);
				
				var dx = Math.abs(x - playerUnit.getMapX());
				var dy = Math.abs(y - playerUnit.getMapY());
	
				score = Math.max(-1 * (dx + dy), score);
			}	
			// AllyUnitと移動先の距離をスコア化
			var allylist = AllyList.getAliveList();
			for (var i = 0; i < allylist.getCount(); i++) {
				var allyUnit = allylist.getData(i);
				var index = combination.posIndex;
				var x = CurrentMap.getX(index);
				var y = CurrentMap.getY(index);
				
				var dx = Math.abs(x - allyUnit.getMapX());
				var dy = Math.abs(y - allyUnit.getMapY());
	
				score = Math.max(-1 * (dx + dy), score);
			}
		}

		return score + 1000;
	}
}
);