package com.typinggame.backendSpr.Strategy;

import org.springframework.stereotype.Component;

import com.typinggame.backendSpr.Domain.EffectType;
import com.typinggame.backendSpr.Entity.Skill;

@Component
public class DamageStrategy implements SkillEffectStrategy{
	
	/**
     * このクラスが「DAMAGE」タイプを担当することを宣言する
     * @return EffectType.DAMAGE
     */
    @Override
	public EffectType getHandlerType() {
		return EffectType.DAMAGE;
	}
	
    /**
     * スキルの基本威力を取得し、敵のHPを減らす
     * @param skill 発動したスキルのデータ
     * @param context バトルの現在状態
     */
    @Override
	public void apply(Skill skill, BattleContext context) {
    	int damage = skill.getBaseValue();
    	
    	// 💡 将来の拡張メモ: 
        // ここに「属性相性（FIREはWINDに強い等）」や「タイピング精度による倍率」を
        // 計算するロジックを挟むことで、元のコードを汚さずに強化できます。
    	
    	// 敵にダメージを適用
        context.damageEnemy(damage);
        
     // ログ出力（動作確認用）
        System.out.println("【バトルログ】" + skill.getSkillName() + " が発動！ 敵に " + damage + " のダメージを与えた！");
    	
	}
	
}
