package com.typinggame.backendSpr.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 進行中のバトルの現在の状態を保持し、フロントエンドに返すためのデータクラス
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleStateDto {
    private Long userId;
    private Long stageId;
    private String enemyName;
    private int playerCurrentHp;
    private int playerMaxHp;
    private int enemyCurrentHp;
    private int enemyMaxHp;
    private int currentLimitCost; // 今ターンの使えるコスト上限
    private int remainingCost;    // 今ターンでまだ使えるコスト
    private int turnCount;        // 現在のターン数
    private boolean battleFinished;   // バトルが終了したかどうか
    private boolean victory;    // 勝利したかどうか
}