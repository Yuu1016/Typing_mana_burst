package com.typinggame.backendSpr.RequestDTO;

import lombok.Data;

@Data
public class BattleStartRequestDto {
    private Long userId;
    private Long stageId;
}
