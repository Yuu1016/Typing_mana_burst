package com.typinggame.backendSpr.RequestDTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/**
 * フロントエンドから送られてくる「バトル終了（リザルト）」の成績を受け取るデータクラス
 */
@Data
public class BattleResultRequestDto {

    @NotNull
    private Long userId;

    @NotNull
    private Long stageId;

    @NotNull
    private Boolean isVictory; // 勝ったかどうか

    @PositiveOrZero
    private Integer clearTurns; // かかったターン数

    @PositiveOrZero
    private Integer totalTypedChars; // 総タイピング文字数

    @PositiveOrZero
    private Integer missedChars; // タイプミス数
}