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
     * スキル発動処理（ターンの進行）
     * 画面からのリクエストを受け取り、現在のバトル状態にスキル効果を適用する。
     *
     * @param request 画面から送られてきた発動指示（誰が、どのスロットを使ったか）
     * @param currentState 現在のバトルの状態（前のターンが終わった時点でのHP等）
     * @return スキル発動後の新しいバトル状態
     */
    public BattleStateDto executeTurn(SkillCastRequestDto request, BattleStateDto currentState) {
    	if(currentState.isBattleFinished()) {
    		throw new IllegalStateException("このバトルは既に終了しています");
    	}
    	
    	// 今のステージ情報を取得
    	Stage stage = stageRepository.findById(currentState.getStageId())
                .orElseThrow(() -> new IllegalArgumentException("ステージが見つかりません ID: " + currentState.getStageId()));
    	
    	//ユーザー情報から発動するスキル情報を取得
    	User user = userService.getUserProfile(request.getUserId());
    	UserDeck targetDeck = user.getUserDecks().stream()
    			 .filter(deck -> deck.getSlotNumber() == request.getSlotNumber())
    			 .findFirst()
    			 .orElseThrow(() -> new IllegalArgumentException("指定されたスロットにスキルがセットされていません"));
    	
    	Skill skillToCast = targetDeck.getSkill();
    	
    	//コストチェック
    	if(currentState.getRemainingCost() < skillToCast.getCost()) {
    		throw new IllegalStateException("コストが足りません！");
    	}
    	
    	//コスト消費
    	currentState.setRemainingCost(currentState.getRemainingCost() - skillToCast.getCost());
    	
    	//strategyが計算しやすいようにデータを詰める
    	BattleContext context = new BattleContext(
    			currentState.getPlayerCurrentHp(),
    			currentState.getPlayerMaxHp(),
    			currentState.getEnemyCurrentHp()
    	);
    	
    	//factoryが（DamageStrategyを呼ぶ）計算を任せる
    	EffectType effectTypeEnum = EffectType.fromString(skillToCast.getEffectType());
    	SkillEffectStrategy strategy = skillEffectFactory.getStrategy(effectTypeEnum);
    	
    	strategy.apply(skillToCast, context);    	
    	
    	currentState.setPlayerCurrentHp(context.getPlayerCurrentHp());
    	currentState.setEnemyCurrentHp(context.getEnemyCurrentHp());
    	
    	//敵の反撃と勝敗判定ロジック
    	if(currentState.getEnemyCurrentHp() <= 0) {
            // 敵を倒した！（プレイヤーの勝利）
    		currentState.setEnemyCurrentHp(0);
    		currentState.setBattleFinished(true);
    		currentState.setVictory(true);
    	} else {
            // 敵が生き残っていたら反撃してくる！（一旦シンプルに固定で10ダメージ与えてくるとします）
            // ※もし Stage エンティティに enemyAttack があれば、それを引いてください！
            int newPlayerHp = currentState.getPlayerCurrentHp() - stage.getEnemyAttack();
            currentState.setPlayerCurrentHp(newPlayerHp);

            // 反撃の結果、プレイヤーが倒れた場合
            if (currentState.getPlayerCurrentHp() <= 0) {
                currentState.setPlayerCurrentHp(0);
                currentState.setBattleFinished(true);
                currentState.setVictory(false);
            } else {
            	currentState.setTurnCount(currentState.getTurnCount() + 1);
            	
            	int nextLimit = currentState.getCurrentLimitCost() + 1;
            	if(nextLimit > 10) {
            		nextLimit = 10;
            	}
            	
            	currentState.setCurrentLimitCost(nextLimit); 
            	currentState.setRemainingCost(nextLimit);            }
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
     * バトルの最終結果を受け取り、ログを保存し、勝利時は報酬を付与する。
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
