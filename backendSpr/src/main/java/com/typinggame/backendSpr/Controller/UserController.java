package com.typinggame.backendSpr.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.typinggame.backendSpr.Entity.User;
import com.typinggame.backendSpr.RequestDTO.DeckUpdateRequestDto;
import com.typinggame.backendSpr.Service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
	
	private final UserService userService;
	
	/**
     * 【ホーム画面・その他】ユーザーのプロフィール（HP、所持金、デッキ等）を取得するAPI
     * エンドポイント: GET /api/v1/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@Valid @PathVariable Long userId) {
        User user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 【工房画面】ゴールドを消費して最大HPを強化するAPI
     * エンドポイント: POST /api/v1/users/{userId}/upgrade-hp
     */
    @PostMapping("/{userId}/upgrade-hp")
    public ResponseEntity<User> upGradeMaxHp(@Valid @PathVariable Long userId) {
        User updatedUser = userService.upGradeMaxHp(userId);
        return ResponseEntity.ok(updatedUser);
    }
    
    /**
     * 【魔法書画面】デッキの指定スロットのスキルを入れ替えるAPI
     * エンドポイント: PUT /api/v1/users/{userId}/decks/{slotNumber}
     */
    @PutMapping("/{userId}/decks/{slotNumber}")
    public ResponseEntity<User> updateDeckSlot(
    		@Valid
            @PathVariable Long userId,
            @PathVariable int slotNumber,
            @RequestBody DeckUpdateRequestDto request) {
        
        // request.getNewSkillId() でフロントエンドから送られてきた新しいスキルIDを取得
        User updatedUser = userService.updateDeckSlot(userId, slotNumber, request.getNewSkillId());
        return ResponseEntity.ok(updatedUser);
    }
    
    
	
	
	
}
