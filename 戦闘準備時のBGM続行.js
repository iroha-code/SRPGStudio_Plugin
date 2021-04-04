/*--------------------------------------------------------------------------

　戦闘準備時のBGM続行

  ■概要
  マップのカスタムパラメータに {musiccontinue : true} が設定してある場合，
  戦闘準備 → 自軍ターン で同じBGMを設定している場合，途切れずに続くようになります。
  オープニングイベントでBGMを流して，それが自軍ターンにシームレスに続くようにしたい場合などにも使用できます。

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

	BattleSetupScene._changeFreeScene = function() {
		// イベント内でシーン変更やマップクリアが発生していない場合のみ、SceneType.FREEを実行する
		if (root.getCurrentScene() === SceneType.BATTLESETUP) {
			var mapInfo = root.getCurrentSession().getCurrentMapInfo();
			if ('musiccontinue' in mapInfo.custom) {
				if (mapInfo.custom.musiccontinue !== true) {
					MediaControl.clearMusicCache();
				}
			} else {
				MediaControl.clearMusicCache();
			}
		root.changeScene(SceneType.FREE);
		}
	}

})();
