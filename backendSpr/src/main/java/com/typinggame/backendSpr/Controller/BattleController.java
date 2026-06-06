package com.typinggame.backendSpr.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.typinggame.backendSpr.Entity.User;
import com.typinggame.backendSpr.RequestDTO.BattleResultRequestDto;
import com.typinggame.backendSpr.RequestDTO.BattleStartRequestDto;
import com.typinggame.backendSpr.RequestDTO.BattleTurnRequestDto;
import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;
import com.typinggame.backendSpr.Service.BattleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/apo/v1/battles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BattleController {

	private final BattleService battleService;
	
	/**
	 * ステージへの挑戦開始
     * エンドポイント: POST /api/v1/battles/start
     */
    @PostMapping("/start")
    public ResponseEntity<BattleStateDto> startBattle(@RequestBody BattleStartRequestDto request) {
        // Serviceを呼んで、初期状態のバトルデータ（DTO）を作ってもらう
        BattleStateDto initialState = battleService.startBattle(request.getUserId(), request.getStageId());
        return ResponseEntity.ok(initialState);
    }
    
    /**
     *ターンの進行（スキル発動）
     * フロントエンドから「ユーザーのアクション」と「現在のバトルの状態」を受け取り、計算して返す
     * エンドポイント: POST /api/v1/battles/cast
     */
    @PostMapping("/cast")
    public ResponseEntity<BattleStateDto> castSkill(@RequestBody BattleTurnRequestDto request) {
        // Step 4のロジックが詰まった魔法のメソッドを発動！
        BattleStateDto nextState = battleService.executeTurn(request.getAction(), request.getCurrentState());
        return ResponseEntity.ok(nextState);
    }
    
    /**
     *バトルの決着（リザルト送信）
     *エンドポイント: POST /api/v1/battles/result
     */
    @PostMapping("/result")
    public ResponseEntity<User> finishBattle(@RequestBody BattleResultRequestDto request) {
        // ログを保存し、報酬を与えて、最新のユーザー情報を返す
        User updatedUser = battleService.finishBattle(request);
        return ResponseEntity.ok(updatedUser);
    }
	
	
	
	
	
}
