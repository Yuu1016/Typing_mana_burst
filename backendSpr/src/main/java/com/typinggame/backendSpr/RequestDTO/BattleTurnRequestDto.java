package com.typinggame.backendSpr.RequestDTO;

import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class BattleTurnRequestDto {
	@Valid
    private SkillCastRequestDto action; // 「どのスロットを使ったか」の情報
    private BattleStateDto currentState; // 「今HPはいくつか」の情報
}