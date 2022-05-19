/*--------------------------------------------------------------------------
  
  スキル：ディスタントアーマー

  ■概要
  使用方法:
  スキルでカスタムを選択し、キーワードに「weaponrangedamage」と設定してください。
  スキルにカスタムパラメータを設定してください。

  【設定例】
  // 射程が2以上5以下のとき，受けるダメージをもとの70%にする
  weaponrangedamage: {lowerlim :2, higherlim :5, rate:70}

  // 射程が1のとき，受けるダメージをもとの150%にする
  weaponrangedamage: {higherlim :1, rate:150}

  ■バージョン履歴
  2022/01/03  新規作成

  ■対応バージョン
  SRPG Studio Version:1.248
  
  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。どんどん改造してください。
  ・クレジット明記無し  OK
  ・再配布、転載  OK
  ・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function() {

var alias02 = DamageCalculator.calculateDamage;
DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
  var damage = alias02.call(this, active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue);

  if (WeaponRangeDamageChecker(active, passive)) {
    damage = Math.floor(damage * WeaponRangeDamageValue(active, passive) / 100);
  }

  return damage;
}

var WeaponRangeDamageChecker = function(active, passive) {
  var skill = SkillControl.getPossessionCustomSkill(passive, 'weaponrangedamage');

  if(skill) {
    var dx = active.getMapX() - passive.getMapX();
    var dy = active.getMapY() - passive.getMapY();
    var distance = Math.abs(dx - dy);

    var lowerlim = skill.custom.weaponrangedamage.lowerlim;
    var higherlim = skill.custom.weaponrangedamage.higherlim;

    if (!lowerlim || distance >= lowerlim) {
      if (!higherlim || distance <= higherlim) {
        return true;
      }
    }
  }

  return false;
}

var WeaponRangeDamageValue = function(active, passive) {
  var skill = SkillControl.getPossessionCustomSkill(passive, 'weaponrangedamage');

  if(skill) {
    var rate = skill.custom.weaponrangedamage.rate;

    if (rate) {
      return rate;
    }
  }

  return 100; //rateが設定されていない場合は100を返す
}

})();