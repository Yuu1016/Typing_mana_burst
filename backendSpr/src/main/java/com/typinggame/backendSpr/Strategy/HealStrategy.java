package com.typinggame.backendSpr.Strategy;

import org.springframework.stereotype.Component;

import com.typinggame.backendSpr.Domain.EffectType;
import com.typinggame.backendSpr.Entity.Skill;

@Component
public class HealStrategy implements SkillEffectStrategy{
	
	/**
     * このクラスが「HEAL」タイプを担当することを宣言する
     * @return EffectType.HEAL
     */
    @Override
	public EffectType getHandlerType() {
		return EffectType.HEAL;
	}
    
    /**
     * スキルの基本威力を取得し、味方のHPを増やす
     * @param skill 発動したスキルのデータ
     * @param context バトルの現在状態
     */
    @Override
	public void apply(Skill skill, BattleContext context) {
    	int healAmount = skill.getBaseValue();
    	
    	// 💡 将来の拡張メモ: 
        // ここに「属性相性（FIREはWINDに強い等）」や「タイピング精度による倍率」を
        // 計算するロジックを挟むことで、元のコードを汚さずに強化できます。
    	
    	// 敵にダメージを適用
        context.healPlayer(healAmount);
        
     // ログ出力（動作確認用）
        System.out.println("【バトルログ】" + skill.getSkillName() + " が発動！プレイヤーのHPが " + healAmount + " 回復した！");
    	
	}
}
