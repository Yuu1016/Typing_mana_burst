package com.typinggame.backendSpr.Strategy;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleContext {
	
	private int playerCurrentHp;
	private int playerMaxHp;
	private int enemyCurrentHp;
	
	/**
     * 敵にダメージを与える
     * @param damage ダメージ量
     */
	public void damageEnemy(int damage) {
		this.enemyCurrentHp =Math.max(0, this.enemyCurrentHp - damage);
	}
	
	/**
     * プレイヤーのHPを回復する
     * @param healAmount 回復量
     * @param maxHp プレイヤーの最大HP（オーバーヒール防止用）
     */
    public void healPlayer(int healAmount) {
        this.playerCurrentHp = Math.min(this.playerMaxHp, this.playerCurrentHp + healAmount);
    }
}
