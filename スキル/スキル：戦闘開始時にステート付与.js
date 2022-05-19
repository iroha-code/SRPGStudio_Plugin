/*--------------------------------------------------------------------------

	スキル：戦闘開始時にステート付与

	■概要
	戦闘開始時に特定のステートを付与します。
	スキル「カスタム」の名前を「stateStarter」とし、カスタムパラメータを
	{stateId: <付与するステートID>} のように記述してください。

	■バージョン履歴
	2022/05/19  新規作成

	■対応バージョン
	SRPG Studio Version:1.259

	■規約
	・利用はSRPG Studioを使ったゲームに限ります。
	・商用・非商用問いません。フリーです。
	・加工等、問題ありません。どんどん改造してください。
	・クレジット明記無し  OK
	・再配布、転載  OK
	・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function() {

var alias = MapStartFlowEntry.enterFlowEntry;
MapStartFlowEntry.enterFlowEntry = function(battleSetupScene) {
	this.addUnitState(UnitFilterFlag.PLAYER);
	this.addUnitState(UnitFilterFlag.ENEMY);
	this.addUnitState(UnitFilterFlag.ALLY);

	return alias.call(this, battleSetupScene);
}

// 戦闘開始時にステートを付与する処理
MapStartFlowEntry.addUnitState = function(unitfilterflag) {
	var unitlist = FilterControl.getListArray(unitfilterflag)[0];
	if (!unitlist) {
		return;
	}

	for (var j = 0; j < unitlist.getCount(); j++) {
		var unit = unitlist.getData(j);

		var skills = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, 'stateStarter');
		for (var i = 0; i < skills.length; i++) {
			var stateId = skills[i].skill.custom.stateId;
			if (typeof stateId === 'number') {
				var state = root.getBaseData().getStateList().getDataFromId(stateId);
				StateControl.arrangeState(unit, state, IncreaseType.INCREASE);			
			}
		}
	}
}

})();