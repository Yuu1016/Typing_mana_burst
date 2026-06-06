package com.typinggame.backendSpr.Strategy;

import com.typinggame.backendSpr.Domain.EffectType;
import com.typinggame.backendSpr.Entity.Skill;

public interface SkillEffectStrategy {

	/**
     * このストラテジーが担当する効果タイプを返却する
     * @return 効果タイプのEnum値
     */
    EffectType getHandlerType();
    
    /**
     * 実際にスキル効果の計算・適用を行うメソッド
     * @param skill 発動するスキルのマスタ情報
     * @param context バトルの現在の状態（HPなど）
     */
    void apply(Skill skill, BattleContext context);
}
