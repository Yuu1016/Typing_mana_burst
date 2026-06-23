package com.typinggame.backendSpr.RequestDTO;

import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;

import lombok.Data;

@Data
public class DefenseRequestDto {
	
	private int defenseScore;
	
	private BattleStateDto currentState;
}
