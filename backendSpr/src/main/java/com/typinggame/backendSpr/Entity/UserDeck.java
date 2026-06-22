package com.typinggame.backendSpr.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ユーザーデッキ Entity
 * テーブル: t_user_decks
 *
 * 複合ユニーク制約: uq_user_slot (user_id, slot_number)
 *   → 同一ユーザーの同一スロットへの重複登録を防止
 */
@Entity
@Table(
    name = "t_user_decks",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_slot", columnNames = {"user_id", "slot_number"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDeck {

    /** デッキ内一連番号 (PK / BIGSERIAL) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * デッキ内のスロット番号
     * NOT NULL / CHECK (slot_number BETWEEN 1 AND 5)
     */
    @Column(name = "slot_number", nullable = false)
    @NotNull
    @Min(1)
    @Max(5)
    private Integer slotNumber;

    // -------------------------------------------------------
    //  リレーションシップ
    // -------------------------------------------------------

    /**
     * 所有ユーザー (多対1)
     * FK: user_id → t_users(id)
     * ON DELETE CASCADE: ユーザー削除時に当レコードも削除
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_decks_user"))
    @NotNull
    @JsonIgnore
    private User user;

    /**
     * 割り当てスキル (多対1)
     * FK: skill_id → m_skills(skill_id)
     * ON DELETE CASCADE: スキル削除時に当レコードも削除
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_decks_skill"))
    @NotNull
    private Skill skill;
}
