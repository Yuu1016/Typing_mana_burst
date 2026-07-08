package com.typinggame.backendSpr.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.typinggame.backendSpr.Entity.Skill;
import com.typinggame.backendSpr.Entity.User;
import com.typinggame.backendSpr.Entity.UserDeck;
import com.typinggame.backendSpr.Repository.SkillRepository;
import com.typinggame.backendSpr.Repository.UserRepository;

import lombok.RequiredArgsConstructor;


/**
 * ユーザー情報の取得・更新（強化など）を担当するサービスクラス
 */
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final SkillRepository skillRepository;
	
	/**
     * 指定されたIDのユーザー情報を取得する
     * （Entityで @OneToMany を設定しているため、紐づくデッキ情報も自動で取得できる）
     * * @param userId 取得したいユーザーのID
     * @return ユーザー情報
     */
    public User getUserProfile(Long userId) {
        // DBからユーザーを探し、見つからなかった場合はエラーを投げる
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません。ID: " + userId));
    }
    
    
    /**
     * 統合された強化メソッド
     * @param userId ユーザーID
     * @param upgradeType 強化の種類 ("HP", "DEFENSE", "TIME", "MANA")
     * @return 更新されたユーザー情報
     */
    @Transactional
    public User upgradeStatus(Long userId, String upgradeType) {
        User user = getUserProfile(userId);
        
        // 強化に必要な基本コスト（例: レベル × 50G + 初期50G）
        int upgradeCost = 0;

        switch (upgradeType.toUpperCase()) {
            case "HP":
                upgradeCost = 50 + (user.getUpgradeHpLevel() * 50);
                if (user.getGold() < upgradeCost) throw new IllegalStateException("ゴールドが足りません！");
                user.setGold(user.getGold() - upgradeCost);
                user.setUpgradeHpLevel(user.getUpgradeHpLevel() + 1);
                user.setCurrentHp(user.getCurrentHp() + 10); // HPはレベルアップで+10
                break;

            case "DEFENSE":
                upgradeCost = 100 + (user.getUpgradeDefenseLevel() * 80);
                if (user.getGold() < upgradeCost) throw new IllegalStateException("ゴールドが足りません！");
                user.setGold(user.getGold() - upgradeCost);
                user.setUpgradeDefenseLevel(user.getUpgradeDefenseLevel() + 1);
                break;

            case "TIME":
                upgradeCost = 150 + (user.getUpgradeTimeLevel() * 100);
                if (user.getGold() < upgradeCost) throw new IllegalStateException("ゴールドが足りません！");
                user.setGold(user.getGold() - upgradeCost);
                user.setUpgradeTimeLevel(user.getUpgradeTimeLevel() + 1);
                break;

            case "MANA":
                upgradeCost = 200 + (user.getUpgradeManaLevel() * 150);
                if (user.getGold() < upgradeCost) throw new IllegalStateException("ゴールドが足りません！");
                user.setGold(user.getGold() - upgradeCost);
                user.setUpgradeManaLevel(user.getUpgradeManaLevel() + 1);
                break;

            default:
                throw new IllegalArgumentException("不明な強化タイプです: " + upgradeType);
        }

        return userRepository.save(user);
    }
    
    
    /**
     * 指定したスロットのスキルを、新しいスキルに上書き
     * @param userId 操作するユーザーのID
     * @param slotNumber 変更したいスロット番号（1〜5）
     * @param newSkillId セットしたいスキルのID
     * @return 更新されたユーザー情報
     */
    @Transactional
    public User updateDeckSlot(Long userId, int slotNumber, Long newSkillId) {
    	
    	if (slotNumber < 1 || slotNumber > 5) {
            throw new IllegalArgumentException("スロット番号は1〜5の間で指定してください。");
        }
    	
    	User user = getUserProfile(userId);
        Skill newSkill = skillRepository.findById(newSkillId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたスキルが存在しません。ID: " + newSkillId));

        boolean isAlreadyEquipped = user.getUserDecks().stream()
                .anyMatch(deck -> deck.getSkill().getSkillId().equals(newSkillId) && deck.getSlotNumber() != slotNumber);
        if (isAlreadyEquipped) {
            throw new IllegalStateException("そのスキルは既に別のスロットにセットされています！");
        }
    	
    	UserDeck targetDeck = user.getUserDecks().stream()
	    	.filter(deck -> deck.getSlotNumber() == slotNumber)
	        .findFirst()
	        // 万が一、対象スロットのデータが無かった場合は新規作成の準備をする
	        .orElseGet(() -> {
	            UserDeck newDeck = new UserDeck();
	            newDeck.setUser(user);
	            newDeck.setSlotNumber(slotNumber);
	            user.getUserDecks().add(newDeck);
	            return newDeck;
	        });
    	
    	targetDeck.setSkill(newSkill);
    	
    	return userRepository.save(user);
    }
    
    
}
