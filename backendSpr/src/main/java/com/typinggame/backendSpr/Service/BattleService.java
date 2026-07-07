package com.typinggame.backendSpr.Service;

import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.typinggame.backendSpr.Domain.EffectType;
import com.typinggame.backendSpr.Entity.BattleLog;
import com.typinggame.backendSpr.Entity.Skill;
import com.typinggame.backendSpr.Entity.Stage;
import com.typinggame.backendSpr.Entity.User;
import com.typinggame.backendSpr.Entity.UserDeck;
import com.typinggame.backendSpr.Repository.StageRepository;
import com.typinggame.backendSpr.Repository.UserRepository;
import com.typinggame.backendSpr.RequestDTO.BattleResultRequestDto;
import com.typinggame.backendSpr.RequestDTO.DefenseRequestDto;
import com.typinggame.backendSpr.RequestDTO.SkillCastRequestDto;
import com.typinggame.backendSpr.ResponseDTO.BattleStateDto;
import com.typinggame.backendSpr.Strategy.BattleContext;
import com.typinggame.backendSpr.Strategy.SkillEffectFactory;
import com.typinggame.backendSpr.Strategy.SkillEffectStrategy;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BattleService {
	private final UserService userService;
    private final StageRepository stageRepository;
    private final UserRepository userRepository;
    private final SkillEffectFactory skillEffectFactory;
    private final Random random = new Random();
    
    
    /**
     * バトルの初期化　ユーザー情報、ステージ情報を取得
     */
    @Transactional(readOnly = true)
    public BattleStateDto startBattle(Long userId, Long stageId) {
        // ユーザーとステージの情報を取得
        User user = userService.getUserProfile(userId);
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new IllegalArgumentException("ステージが見つかりません。ID: " + stageId));
        
        // 初期リミットコストの計算（例: "3-4" という文字列をパースしてランダムに決定）
        int initialLimitCost = calculateInitialCost(stage.getLimitCostPool());

        // バトル状態の初期化
        BattleStateDto state = new BattleStateDto();
        state.setUserId(userId);
        state.setStageId(stageId);
        state.setEnemyName(stage.getEnemyName());
        state.setEnemyImagePath(stage.getImagePath());
        state.setEnemyDamageImagePath(stage.getDamageImagePath());
        
        state.setPlayerMaxHp(user.getCurrentHp());
        state.setPlayerCurrentHp(user.getCurrentHp()); // スタート時は満タン
        
        state.setEnemyMaxHp(stage.getEnemyHp());
        state.setEnemyCurrentHp(stage.getEnemyHp());
        
        state.setCurrentLimitCost(initialLimitCost);
        state.setRemainingCost(initialLimitCost); // スタート時は上限と同じ
        
        state.setTurnCount(1);
        state.setBattleFinished(false);
        state.setVictory(false);

        return state;
    }
        
    /**
     * 攻撃フェーズの処理（複数スキル発動とJUSTボーナス計算）
     */
    public BattleStateDto executeAttack(SkillCastRequestDto request, BattleStateDto currentState) {
        if(currentState.isBattleFinished()) {
            throw new IllegalStateException("このバトルは既に終了しています");
        }
        
        User user = userService.getUserProfile(request.getUserId());
        BattleContext context = new BattleContext(
                currentState.getPlayerCurrentHp(),
                currentState.getPlayerMaxHp(),
                currentState.getEnemyCurrentHp()
        );
        
        int totalCost = 0;
        
        // 複数スキルをループ処理
        for (Integer slotNumber : request.getSlotNumbers()) {
            UserDeck targetDeck = user.getUserDecks().stream()
                     .filter(deck -> deck.getSlotNumber() == slotNumber)
                     .findFirst()
                     .orElseThrow(() -> new IllegalArgumentException("指定されたスロットにスキルがセットされていません"));
            
            Skill skillToCast = targetDeck.getSkill();
            totalCost += skillToCast.getCost();
            
            EffectType effectTypeEnum = EffectType.fromString(skillToCast.getEffectType());
            SkillEffectStrategy strategy = skillEffectFactory.getStrategy(effectTypeEnum);
            strategy.apply(skillToCast, context);
        }
        
        // コスト消費（オーバーキャストを許容するため、そのまま引く）
        currentState.setRemainingCost(currentState.getRemainingCost() - totalCost);
        
        //  JUSTボーナス計算
        if (request.isJustBonus()) {
            int originalEnemyHp = currentState.getEnemyCurrentHp();
            int newEnemyHp = context.getEnemyCurrentHp();
            int rawDamage = originalEnemyHp - newEnemyHp;
            
            if (rawDamage > 0) {
                int bonusDamage = (int) (rawDamage * 0.5); // 1.5倍の追加ダメージ
                context.damageEnemy(bonusDamage);
                System.out.println("【JUST BONUS発動！】追加ダメージ: " + bonusDamage);
            }
        }
        
        currentState.setPlayerCurrentHp(context.getPlayerCurrentHp());
        currentState.setEnemyCurrentHp(context.getEnemyCurrentHp());
        
        // 勝敗判定（敵を倒したか）
        if(currentState.getEnemyCurrentHp() <= 0) {
            currentState.setEnemyCurrentHp(0);
            currentState.setBattleFinished(true);
            currentState.setVictory(true);
        }
        
        return currentState;
    }

    /**
     * 防衛フェーズの処理（ダメージカット、ターン進行、マナ回復）
     */
    public BattleStateDto executeDefense(DefenseRequestDto request) {
        BattleStateDto currentState = request.getCurrentState();
        
        if(currentState.isBattleFinished()) {
            throw new IllegalStateException("このバトルは既に終了しています");
        }
        
        Stage stage = stageRepository.findById(currentState.getStageId())
                .orElseThrow(() -> new IllegalArgumentException("ステージが見つかりません ID: " + currentState.getStageId()));
        
        // ダメージカット計算
        int intendedDamage = stage.getEnemyAttack();
        int damageCut = request.getDefenseScore() * 3; // スコア1につき3軽減 後々レベルアップでカット率が増加するように変更
        int finalDamage = Math.max(0, intendedDamage - damageCut);
        
        int newPlayerHp = Math.max(0, currentState.getPlayerCurrentHp() - finalDamage);
        currentState.setPlayerCurrentHp(newPlayerHp);
        
        // プレイヤーが倒れた場合
        if (currentState.getPlayerCurrentHp() <= 0) {
            currentState.setPlayerCurrentHp(0);
            currentState.setBattleFinished(true);
            currentState.setVictory(false);
        } else {
            // 生き残ったらターン進行とマナ回復
            currentState.setTurnCount(currentState.getTurnCount() + 1);
            
            int nextLimit = currentState.getCurrentLimitCost() + 1;
            if(nextLimit > 10) {
                nextLimit = 10;
            }
            currentState.setCurrentLimitCost(nextLimit);
            
            // 防衛スコアに応じた追加マナ回復
            int newRemainingCost = Math.min(nextLimit, currentState.getRemainingCost() + request.getDefenseScore());
            currentState.setRemainingCost(newRemainingCost);
        }
        
        return currentState;
    }
    
    /**
     * limit_cost_pool (例: "3-5") から、ランダムな初期コストを算出する補助メソッド
     */
    private int calculateInitialCost(String pool) {
        try {
            String[] parts = pool.split("-");
            int min = Integer.parseInt(parts[0]);
            int max = Integer.parseInt(parts[1]);
            return random.nextInt((max - min) + 1) + min;
        } catch (Exception e) {
            // パースに失敗した場合は安全のため最低値の 3 を返す
            return 3;
        }
    }
    
    /**
     * バトルの最終結果を受け取り、ログを保存し、勝利時は報酬を付与する
     * @param request 画面から送られてきたタイピング成績や勝敗結果
     * @return 報酬付与などで更新された最新のユーザー情報
     */
    @Transactional
    public User finishBattle(BattleResultRequestDto request) {
    	
    	//ユーザー、ステージ情報を取得
    	User user = userService.getUserProfile(request.getUserId());
    	Stage stage = stageRepository.findById(request.getStageId())
    			.orElseThrow(() -> new IllegalArgumentException("ステージが見つかりません　ID:" + request.getStageId()));
    	
    	//ログにデータを入れる
    	BattleLog log = new BattleLog();
    	log.setUser(user);
    	log.setStage(stage);
    	log.setIsVictory(request.getIsVictory());
    	log.setClearTurns(request.getClearTurns());
    	log.setTotalTypedChars(request.getTotalTypedChars());
    	log.setMissedChars(request.getMissedChars());
    	
    	//ユーザーのログ履歴に追加する
    	user.getBattleLogs().add(log);
    	
    	//勝利した場合の特別処理（報酬とクリア状況の更新）
    	if(request.getIsVictory()) {
    		user.setGold(user.getGold() + 50);
    		
    		//今までクリアした最高ステージより上だったら更新
    		if(user.getClearedStageId() < stage.getStageNumber()) {
    			user.setClearedStageId(stage.getStageNumber());
    		}
    		
    	}
    	
    	return userRepository.save(user);
    	
    }
    
}
