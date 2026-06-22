package com.typinggame.backendSpr.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * スキル・カードマスタ Entity
 * テーブル: m_skills
 */
@Entity
@Table(name = "m_skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    /** スキルID (PK / BIGSERIAL) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_id")
    private Long skillId;

    /**
     * スキル名
     * NOT NULL / UNIQUE / VARCHAR(100)
     */
    @Column(name = "skill_name", nullable = false, unique = true, length = 100)
    @NotBlank
    private String skillName;

    /**
     * 消費コスト
     * NOT NULL / CHECK (cost BETWEEN 1 AND 5)
     */
    @Column(name = "cost", nullable = false)
    @NotNull
    @Min(1)
    @Max(5)
    private Integer cost;

    /**
     * チャージに必要なマナ属性
     * NOT NULL / VARCHAR(20)
     * 値例: FIRE, WATER, WIND, EARTH, LIGHT, DARK
     */
    @Column(name = "required_mana_type", nullable = false, length = 20)
    @NotBlank
    private String requiredManaType;

    /**
     * 基本威力（攻撃力や回復量のベース値）
     * NOT NULL
     */
    @Column(name = "base_value", nullable = false)
    @NotNull
    private Integer baseValue;

    /**
     * 効果の分類
     * NOT NULL / VARCHAR(20)
     * 値例: DAMAGE, HEAL, BUFF, DEBUFF
     */
    @Column(name = "effect_type", nullable = false, length = 20)
    @NotBlank
    private String effectType;

    /**
     * 対象
     * NOT NULL / VARCHAR(20)
     * 値例: ENEMY_SINGLE, ENEMY_ALL, PLAYER
     */
    @Column(name = "target_type", nullable = false, length = 20)
    @NotBlank
    private String targetType;

    /**
     * スキルの説明文
     * NULL許容 / TEXT
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // -------------------------------------------------------
    //  リレーションシップ
    // -------------------------------------------------------

    /**
     * このスキルを参照しているデッキスロット一覧 (1対多)
     * mappedBy: UserDeck.skill フィールドで管理
     * CASCADE: m_skills削除時に関連するt_user_decksも削除 (ON DELETE CASCADE)
     */
    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserDeck> userDecks;
}
