package com.typinggame.backendSpr.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.typinggame.backendSpr.Service.MasterDataService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/master-data")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MasterDataController {
	
	private final MasterDataService masterDataService;
	
	/**
     * ゲーム起動時（またはタイトル画面〜ホーム画面遷移時）に呼び出されるAPI。
     * スキルやステージの全一覧をReactに渡します。
     * エンドポイント: GET /api/v1/master-data
     * @return マスタデータのまとまり（JSON形式で自動変換されます）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMasterData() {
        // Serviceを呼んでデータをもらい、ステータスコード200 (OK) と返す
        Map<String, Object> data = masterDataService.getAllMasterData();
        return ResponseEntity.ok(data);
    }
	
	
	
	
}
