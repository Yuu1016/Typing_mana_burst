package com.typinggame.backendSpr.Strategy;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.typinggame.backendSpr.Domain.EffectType;
import com.typinggame.backendSpr.Entity.Skill;

/**
 * スキル効果ストラテジーおよびファクトリの連動テストクラス
 */
@SpringBootTest(classes = {SkillEffectFactory.class, DamageStrategy.class, HealStrategy.class}) // 💡 SpringのDIコンテキストを起動し、@Componentを自動で集める設定
class SkillEffectFactoryTest {

    @Autowired
    private SkillEffectFactory factory; // 💡 自動的に部品が集まったFactoryが注入されます

    /**
     * DAMAGEタイプのスキルを実行した際、敵のHPが正しく減算されることをテスト
     */
    @Test
    void damageStrategyShouldDecreaseEnemyHp() {
        // 1. 準備 (Arrange)
        Skill damageSkill = new Skill();
        damageSkill.setSkillName("ファイアバースト");
        damageSkill.setBaseValue(30); // 威力30
        damageSkill.setEffectType("DAMAGE");

        // 初期状態：プレイヤー現在HP 100, プレイヤー最大HP 100, 敵HP 50
        BattleContext context = new BattleContext(100, 100, 50);

        // 2. 実行 (Act)
        // FactoryからDAMAGE用のストラテジーを自動取得して適用
        SkillEffectStrategy strategy = factory.getStrategy(EffectType.DAMAGE);
        strategy.apply(damageSkill, context);

        // 3. 検証 (Assert)
        // 敵のHPが 50 - 30 = 20 に減っていること
        assertEquals(20, context.getEnemyCurrentHp());
        // プレイヤーのHPは 100 のまま変わっていないこと
        assertEquals(100, context.getPlayerCurrentHp());
    }

    /**
     * HEALタイプのスキルを実行した際、プレイヤーのHPが正しく回復することをテスト
     */
    @Test
    void healStrategyShouldIncreasePlayerHp() {
        // 1. 準備 (Arrange)
        Skill healSkill = new Skill();
        healSkill.setSkillName("ケアル");
        healSkill.setBaseValue(25); // 回復量25
        healSkill.setEffectType("HEAL");

        // 初期状態：プレイヤー現在HP 60 (傷ついている状態), 最大HP 100, 敵HP 50
        BattleContext context = new BattleContext(60, 100, 50);

        // 2. 実行 (Act)
        SkillEffectStrategy strategy = factory.getStrategy(EffectType.HEAL);
        strategy.apply(healSkill, context);

        // 3. 検証 (Assert)
        // プレイヤーのHPが 60 + 25 = 85 に増えていること
        assertEquals(85, context.getPlayerCurrentHp());
        // 敵のHPは変わっていないこと
        assertEquals(50, context.getEnemyCurrentHp());
    }

    /**
     * HEALタイプのスキルを実行した際、最大HPを超えてオーバーヒールしないことをテスト
     */
    @Test
    void healStrategyShouldNotExceedMaxHp() {
        // 1. 準備 (Arrange)
        Skill superHealSkill = new Skill();
        superHealSkill.setSkillName("ベホマ");
        superHealSkill.setBaseValue(999); // 規格外の過剰な回復量
        superHealSkill.setEffectType("HEAL");

        // 初期状態：プレイヤー現在HP 90, 最大HP 100, 敵HP 50
        BattleContext context = new BattleContext(90, 100, 50);

        // 2. 実行 (Act)
        SkillEffectStrategy strategy = factory.getStrategy(EffectType.HEAL);
        strategy.apply(superHealSkill, context);

        // 3. 検証 (Assert)
        // 前回の修正通り、最大HPである「100」でピタッと止まり、破綻しないことを検証
        assertEquals(100, context.getPlayerCurrentHp());
    }
}