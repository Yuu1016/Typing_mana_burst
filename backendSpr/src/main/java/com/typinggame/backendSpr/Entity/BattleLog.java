package com.typinggame.backendSpr.Entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * バトルログ Entity
 * テーブル: t_battle_logs
 */
@Entity
@Table(name = "t_battle_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleLog {

    /** ログID (PK / BIGSERIAL) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 勝敗フラグ (TRUE = 勝利)
     * NOT NULL / DEFAULT FALSE
     */
    @Column(name = "is_victory", nullable = false)
    @NotNull
    private Boolean isVictory = false;

    /**
     * クリアに要したターン数
     * NULL許容（敗北時はNULL）
     */
    @Column(name = "clear_turns")
    @PositiveOrZero
    private Integer clearTurns;

    /**
     * 総タイピング入力文字数
     * NOT NULL / DEFAULT 0
     */
    @Column(name = "total_typed_chars", nullable = false)
    @NotNull
    @PositiveOrZero
    private Integer totalTypedChars = 0;

    /**
     * タイプミス数
     * NOT NULL / DEFAULT 0
     */
    @Column(name = "missed_chars", nullable = false)
    @NotNull
    @PositiveOrZero
    private Integer missedChars = 0;

    /**
     * プレイ日時
     * NOT NULL / DEFAULT CURRENT_TIMESTAMP
     * 挿入時に自動セット
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // -------------------------------------------------------
    //  リレーションシップ
    // -------------------------------------------------------

    /**
     * プレイしたユーザー (多対1)
     * FK: user_id → t_users(id)
     * ON DELETE CASCADE: ユーザー削除時に当レコードも削除
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_battle_logs_user"))
    @NotNull
    private User user;

    /**
     * 挑戦したステージ (多対1)
     * FK: stage_id → m_stages(id)
     * ON DELETE CASCADE: ステージ削除時に当レコードも削除
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stage_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_battle_logs_stage"))
    @NotNull
    private Stage stage;
}