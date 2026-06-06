package com.typinggame.backendSpr.RequestDTO;

import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;

import lombok.Data;

@Data
public class BattleTurnRequestDto {
    private SkillCastRequestDto action; // 「どのスロットを使ったか」の情報
    private BattleStateDto currentState; // 「今HPはいくつか」の情報
}