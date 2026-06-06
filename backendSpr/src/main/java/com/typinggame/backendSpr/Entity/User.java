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
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ユーザー Entity
 * テーブル: t_users
 */
@Entity
@Table(name = "t_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /** ユーザーID (PK / BIGSERIAL) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * ユーザー名
     * NOT NULL / UNIQUE / VARCHAR(50)
     */
    @Column(name = "username", nullable = false, unique = true, length = 50)
    @NotBlank
    private String username;

    /**
     * 現在の最大HP（工房での強化反映後の値）
     * NOT NULL / DEFAULT 100
     */
    @Column(name = "current_hp", nullable = false)
    @NotNull
    @Positive
    private Integer currentHp = 100;

    /**
     * 所持ゴールド（強化用のリソース）
     * NOT NULL / DEFAULT 0
     */
    @Column(name = "gold", nullable = false)
    @NotNull
    @PositiveOrZero
    private Integer gold = 0;

    /**
     * 現在クリア済みの最高ステージID
     * NOT NULL / DEFAULT 0
     */
    @Column(name = "cleared_stage_id", nullable = false)
    @NotNull
    @PositiveOrZero
    private Integer clearedStageId = 0;

    // -------------------------------------------------------
    //  リレーションシップ
    // -------------------------------------------------------

    /**
     * このユーザーのデッキスロット一覧 (1対多)
     * mappedBy: UserDeck.user フィールドで管理
     * CASCADE: t_users削除時に関連するt_user_decksも削除 (ON DELETE CASCADE)
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserDeck> userDecks;

    /**
     * このユーザーのバトルログ一覧 (1対多)
     * mappedBy: BattleLog.user フィールドで管理
     * CASCADE: t_users削除時に関連するt_battle_logsも削除 (ON DELETE CASCADE)
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BattleLog> battleLogs;
}
