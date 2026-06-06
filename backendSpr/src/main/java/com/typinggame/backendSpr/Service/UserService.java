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
     * （※Entityで @OneToMany を設定しているため、紐づくデッキ情報も自動で取得できます）
     * * @param userId 取得したいユーザーのID
     * @return ユーザー情報
     */
    public User getUserProfile(Long userId) {
        // DBからユーザーを探し、見つからなかった場合はエラーを投げる
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません。ID: " + userId));
    }
    
    
    //強化（最大HPアップ）
    @Transactional
    public User upGradeMaxHp(Long userId) {
    	
    	User user = getUserProfile(userId);
    	
    	int upgradeCost = 50; 
        int hpIncreaseAmount = 10;
        
        if (user.getGold() < upgradeCost) {
            throw new IllegalStateException("ゴールドが足りません！ 所持: " + user.getGold() + "G, 必要: " + upgradeCost + "G");
        }
        
        user.setGold(user.getGold() - upgradeCost);
        user.setCurrentHp(user.getCurrentHp() + hpIncreaseAmount);
        
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
