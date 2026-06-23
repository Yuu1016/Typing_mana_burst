package com.typinggame.backendSpr.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.typinggame.backendSpr.Entity.User;
import com.typinggame.backendSpr.RequestDTO.BattleResultRequestDto;
import com.typinggame.backendSpr.RequestDTO.BattleStartRequestDto;
import com.typinggame.backendSpr.RequestDTO.BattleTurnRequestDto;
import com.typinggame.backendSpr.RequestDTO.DefenseRequestDto;
import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;
import com.typinggame.backendSpr.Service.BattleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/battles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BattleController {

	private final BattleService battleService;
	
	/**
	 * ステージへの挑戦開始
     * エンドポイント: POST /api/v1/battles/start
     */
	@Transactional
    @PostMapping("/start")
    public ResponseEntity<BattleStateDto> startBattle(@Valid @RequestBody BattleStartRequestDto request) {
        // Serviceを呼んで、初期状態のバトルデータ（DTO）を作ってもらう
        BattleStateDto initialState = battleService.startBattle(request.getUserId(), request.getStageId());
        return ResponseEntity.ok(initialState);
    }
    
    /**
     *攻撃フェーズ用のAPI
     * エンドポイント: POST /api/v1/battles/attack
     */
    @Transactional
    @PostMapping("/attack")
    public ResponseEntity<BattleStateDto> executeAttack(@Valid @RequestBody BattleTurnRequestDto request) {
        BattleStateDto nextState = battleService.executeAttack(request.getAction(), request.getCurrentState());
        return ResponseEntity.ok(nextState);
    }
    
    /**
     *防衛フェーズ（および詠唱失敗ペナルティ）用のAPI
     * エンドポイント: POST /api/v1/battles/defense
     */
    @Transactional
    @PostMapping("/defense")
    public ResponseEntity<BattleStateDto> executeDefense(@RequestBody DefenseRequestDto request) {
        BattleStateDto nextState = battleService.executeDefense(request);
        return ResponseEntity.ok(nextState);
    }
    
    
    /**
     *バトルの決着（リザルト送信）
     *エンドポイント: POST /api/v1/battles/result
     */
    @Transactional
    @PostMapping("/result")
    public ResponseEntity<User> finishBattle(@Valid @RequestBody BattleResultRequestDto request) {
        // ログを保存し、報酬を与えて、最新のユーザー情報を返す
        User updatedUser = battleService.finishBattle(request);
        return ResponseEntity.ok(updatedUser);
    }
	
	
	
	
	
}
