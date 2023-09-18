/*-----------------------------------------------------

  難易度による敵ステータス割合変化.js

  ■概要
  特定の難易度で、すべての敵のパラメータを割合変化します。

  ■利用方法
  難易度のカスタムパラメータに
  difficulty_param_rate:[
	  {type: <パラメータ種類1>, rate: <割合>},
	  {type: <パラメータ種類2>, rate: <割合>},
	  {type: <パラメータ種類3>, rate: <割合>},
	  :
  ]
  と設定します。

  ■利用例①
  以下のように設定すると、すべての敵の最大HPを0.8倍します。
  difficulty_param_rate:[
	  {type: ParamType.MHP, rate: 0.8}
  ]

  ■利用例②
  以下のように設定すると、すべての敵の最大HPを2倍にし、守備力と魔防力を0.5倍します。
  difficulty_param_rate:[
	  {type: ParamType.MHP, rate: 2.0},
	  {type: ParamType.DEF, rate: 0.5},
	  {type: ParamType.MDF, rate: 0.5}
  ]

  ■パラメータの設定について
  ParamType.MHP: 最大HP
  ParamType.POW: 攻撃力
  ParamType.MAG: 魔力
  ParamType.SKI: 技
  ParamType.SPD: 速さ
  ParamType.LUK: 幸運
  ParamType.DEF: 守備力
  ParamType.MDF: 魔防力
  ParamType.MOV: 移動力
  ParamType.WLV: 熟練度
  ParamType.BLD: 体格

  ■バージョン履歴
  2023/08/10  新規作成

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

(function(){

// 最初からマップにいる敵に対する処理
var alias01 = OpeningEventFlowEntry._prepareMemberData;
OpeningEventFlowEntry._prepareMemberData = function(battleSetupScene) {
	alias01.call(this, battleSetupScene);

	var list = EnemyList.getAliveList();
	var count = list.getCount();
	for (var i = 0; i < count; i++) {
		var unit = list.getData(i);	
		ModifyEnemyStatusForDifficulty(unit);
	}
}

// イベントで敵が登場する場合
var alias02 = ScriptCall_AppearEventUnit;
ScriptCall_AppearEventUnit = function(unit) {
	alias02.call(this, unit);

	if (unit && unit.getUnitType() === UnitType.ENEMY) {
		ModifyEnemyStatusForDifficulty(unit);
	}
};

// 援軍で敵が登場する場合
var alias03 = ReinforcementChecker._appearUnit;
ReinforcementChecker._appearUnit = function(pageData, x, y) {
	var unit = alias03.call(this, pageData, x, y);
	if (unit && unit.getUnitType() === UnitType.ENEMY) {
		ModifyEnemyStatusForDifficulty(unit);
	}

	return unit;
}

})();


// 修正についての実処理
var ModifyEnemyStatusForDifficulty = function(unit) {
	var difficulty = root.getMetaSession().getDifficulty();
	if (difficulty.custom.difficulty_param_rate) {
		for (var i = 0; i < difficulty.custom.difficulty_param_rate.length; i++) {
			var rateobj = difficulty.custom.difficulty_param_rate[i];
			var type = rateobj.type;
			var rate = rateobj.rate;

			var bonus = ParamBonus.getBonus(unit, type);
			var newParam = Math.ceil(bonus * rate);

			ParamGroup.setUnitValue(unit, ParamGroup.getParameterIndexFromType(type), newParam);

			// HPの現在値を修正
			if (type === ParamType.MHP) {
				unit.setHp(newParam);
			}
		}
	}
}
