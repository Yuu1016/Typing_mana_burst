package com.typinggame.backendSpr.Strategy;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.typinggame.backendSpr.Domain.EffectType;


/**
 * EffectType（Enum）に応じて、適切なストラテジー（計算クラス）を提供するファクトリクラス
 */
@Component
public class SkillEffectFactory {
	// Enum をキーにして、対応する Strategy を取り出せるようにする Map
    private final Map<EffectType, SkillEffectStrategy> strategies;
    
    /**
     * コンストラクタ（Spring Boot が自動的に呼び出します）
     * * @param strategyList Spring が @Component の付いた SkillEffectStrategy の実装クラス
     * （DamageStrategy や HealStrategy）を全部かき集めて渡してくれます。
     */
    public SkillEffectFactory(List<SkillEffectStrategy> strategyList) {
        // 受け取ったリストを、getHandlerType() の結果（Enum）をキーにした Map に変換して保存します
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(SkillEffectStrategy::getHandlerType, strategy -> strategy));
    }
    
    /**
     * 指定された EffectType に対応する計算ロジック（Strategy）を返却します
     * * @param effectType 実行したい効果の種類（DAMAGE, HEALなど）
     * @return 対応する SkillEffectStrategy のインスタンス
     * @throws IllegalArgumentException 未実装の EffectType が渡された場合
     */
    public SkillEffectStrategy getStrategy(EffectType effectType) {
        SkillEffectStrategy strategy = strategies.get(effectType);
        
        // もし Map の中に該当するストラテジーが無かった場合の安全対策
        if (strategy == null) {
            throw new IllegalArgumentException("対応するストラテジーが見つかりません: " + effectType);
        }
        
        return strategy;
    }
    
}
