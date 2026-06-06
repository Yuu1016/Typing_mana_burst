package com.typinggame.backendSpr.RequestDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SkillCastRequestDto {

	@NotNull(message = "ユーザーIDは必須です")
	private Long userId;
	
	@Min(value = 1, message = "スロット番号は１〜５で指定してください")
	@Max(value = 5, message = "スロット番号は１〜５で指定してください")
	private int slotNumber;
	
	
	
}
