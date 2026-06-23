package com.typinggame.backendSpr.RequestDTO;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SkillCastRequestDto {

	@NotNull(message = "ユーザーIDは必須です")
	private Long userId;
	
	@NotEmpty(message = "スロット番号は1つ以上指定してください")
	private List<Integer> slotNumbers;
	
	private boolean justBonus;
	
	
	
}
