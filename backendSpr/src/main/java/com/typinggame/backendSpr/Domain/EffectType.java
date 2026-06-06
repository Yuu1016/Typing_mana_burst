	package com.typinggame.backendSpr.Domain;

public enum EffectType {
	DAMAGE,
	HEAL,
	BUFF,
	DEBUFF;
	
	/**
     * DBから取得した文字列（String）を、Javaの安全なEnumに変換するためのメソッド
     * * @param text DBに保存されている効果タイプの文字列
     * @return 対応する EffectType のEnum値
     * @throws IllegalArgumentException 未定義の文字列が渡された場合
     */
	public static EffectType fromString(String text) {
		if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("効果タイプの文字列が空です");
        }

        for (EffectType type : EffectType.values()) {
            if (type.name().equalsIgnoreCase(text)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未定義の効果タイプです: " + text);
    }
}
	
	
