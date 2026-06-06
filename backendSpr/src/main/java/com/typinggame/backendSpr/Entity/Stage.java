package com.typinggame.backendSpr.Entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ステージマスタ Entity
 * テーブル: m_stages
 */
@Entity
@Table(name = "m_stages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stage {

    /** ステージID (PK / BIGSERIAL) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * ステージ番号
     * NOT NULL / UNIQUE
     */
    @Column(name = "stage_number", nullable = false, unique = true)
    @NotNull
    private Integer stageNumber;

    /**
     * ステージ名
     * NOT NULL / VARCHAR(100)
     */
    @Column(name = "stage_name", nullable = false, length = 100)
    @NotBlank
    private String stageName;

    /**
     * 敵の名前
     * NOT NULL / VARCHAR(100)
     */
    @Column(name = "enemy_name", nullable = false, length = 100)
    @NotBlank
    private String enemyName;

    /**
     * 敵のHP
     * NOT NULL
     */
    @Column(name = "enemy_hp", nullable = false)
    @NotNull
    @Positive
    private Integer enemyHp;

    /**
     * 敵の攻撃力
     * NOT NULL
     */
    @Column(name = "enemy_attack", nullable = false)
    @NotNull
    @Positive
    private Integer enemyAttack;

    /**
     * 毎ターン発生するリミットコストの範囲
     * NOT NULL / VARCHAR(10)
     * 値例: "3-4", "3-5", "4-5"（プログラム側でパース）
     */
    @Column(name = "limit_cost_pool", nullable = false, length = 10)
    @NotBlank
    private String limitCostPool;

    // -------------------------------------------------------
    //  リレーションシップ
    // -------------------------------------------------------

    /**
     * このステージのバトルログ一覧 (1対多)
     * mappedBy: BattleLog.stage フィールドで管理
     * CASCADE: m_stages削除時に関連するt_battle_logsも削除 (ON DELETE CASCADE)
     */
    @OneToMany(mappedBy = "stage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BattleLog> battleLogs;
}