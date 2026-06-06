package com.typinggame.backendSpr.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.typinggame.backendSpr.Repository.SkillRepository;
import com.typinggame.backendSpr.Repository.StageRepository;

import lombok.RequiredArgsConstructor;

/**
 * マスタデータ（スキル・ステージなど）の取得を担当するサービスクラス
 */
@Service
@RequiredArgsConstructor
public class MasterDataService {

	private final SkillRepository skillRepository;
    private final StageRepository stageRepository;
	
    /**
     * クライアント起動時に必要な全マスタデータを一括で取得する
     * @return スキル一覧とステージ一覧を格納したMap
     */
    public Map<String, Object> getAllMasterData() {
        // 返却用のMap（辞書）を作成
        Map<String, Object> masterData = new HashMap<>();        
        masterData.put("skills", skillRepository.findAll());
        masterData.put("stages", stageRepository.findAll());

        return masterData;
    }
	
	
}
