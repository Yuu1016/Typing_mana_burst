// src/pages/Battle.tsx
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../API/apiClient";
import { useTyping } from "../hooks/useTyping";
import { getRandomWord } from "../utils/wordDictionary";
import { playSE } from "../utils/soundManager";
import "../pagesCss/Battle.css";
import "../pagesCss/BattleEffects.css"; 
import "../pagesCss/BattleComponents.css";

type BattlePhase = "SELECT" | "ATTACK_TYPING" | "DEFENSE_TYPING";
type MessageType = "info" | "success" | "danger";

export default function Battle() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const [battleState, setBattleState] = useState<any>(null);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDecks, setSelectedDecks] = useState<any[]>([]);
  const [phase, setPhase] = useState<BattlePhase>("SELECT");
  const [timeLeft, setTimeLeft] = useState(0); 
  const [maxTime, setMaxTime] = useState(0);   

  const [pendingState, setPendingState] = useState<any>(null);
  const [defenseScore, setDefenseScore] = useState(0);

  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [enemyTakingDamage, setEnemyTakingDamage] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);

  const [battleMessage, setBattleMessage] = useState<{ text: string; type: MessageType } | null>(null);

  const [currentWord, setCurrentWord] = useState("");
  const { typed, untyped, missCount, isCompleted, resetTyping } = useTyping(currentWord);
  const [flowSpeed, setFlowSpeed] = useState(3500);

  const MAX_MISS_LIMIT = 10;

  //バトル初期化、読み込み
  useEffect(() => {
    const currentStageId = Number(stageId) || 1;
    
    api.startBattle(1, currentStageId)
      .then((data) => {
        setBattleState(data);
        return api.getUserProfile(1);
      })
      .then((userData) => {
        setUserDecks(userData.userDecks.sort((a: any, b: any) => a.slotNumber - b.slotNumber));
        setIsLoading(false);
      })
      .catch((err) => console.error("バトル初期化エラー", err));
  }, [stageId]);

  // メッセージ表示を必ず3秒待つ
  const showMessage = (text: string, type: MessageType = "info") => {
    return new Promise<void>((resolve) => {
      setBattleMessage({ text, type });
      setTimeout(() => {
        setBattleMessage(null);
        resolve(); // 3秒経ったら「終わったよ！」と知らせる
      }, 3000); 
    });
  };


  useEffect(() => {
    if (phase === "SELECT" || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(timerId);
  }, [phase, timeLeft]);

  //アタックターン
  useEffect(() => {
    if (phase === "ATTACK_TYPING" && isCompleted) {
      handleCastSkill();
    }
  }, [isCompleted, phase]);

  //ディフェンスターン
  useEffect(() => {
    if (phase === "DEFENSE_TYPING" && isCompleted) {
      setDefenseScore((prev) => prev + 1);
      const defenseWords = ["BLOCK", "GUARD", "SHIELD", "CHARGE", "BARRIER", "REFLECT"];
      const nextWord = defenseWords[Math.floor(Math.random() * defenseWords.length)];
      setCurrentWord(nextWord);
      resetTyping(nextWord, true);
    }
  }, [isCompleted, phase]);

  // 詠唱失敗時も await でメッセージ終了を待つ
  const handleChantFailure = async (message: string) => {
    setTimeLeft(0);
    setMaxTime(0);
    
    // メッセージを待つ前に、タイピング文字を即座に消す
    setCurrentWord("");
    resetTyping("");

    // メッセージを表示して待機
    await showMessage(message, "danger"); 
    
    const simulatedPendingState = {
      ...battleState,
      remainingCost: battleState.remainingCost - totalSelectedCost,
    };

    setPendingState(simulatedPendingState);
    setPhase("DEFENSE_TYPING");
    setDefenseScore(0);
    const firstWord = "SYSTEM DEFENSE";
    setCurrentWord(firstWord);
    resetTyping(firstWord);
    setMaxTime(8000);
    setTimeLeft(8000);
    setFlowSpeed(2000);
  };

  // ミスオーバー（maxTime > 0 を条件に追加し、重複発動を防ぐ）
  useEffect(() => {
    if (phase === "ATTACK_TYPING" && missCount >= MAX_MISS_LIMIT && maxTime > 0) {
      handleChantFailure("詠唱崩壊... 敵のターンへ移行します！");
    }
  }, [missCount, phase, maxTime]);

  
 
  useEffect(() => {
     
    if (timeLeft === 0 && maxTime > 0) {
      if (phase === "ATTACK_TYPING") {
        handleChantFailure("TIME UP... 詠唱失敗！");
      } 
      
      else if (phase === "DEFENSE_TYPING") {
        setMaxTime(0);

        if (pendingState) {
          const runDefense = async () => {
            try {
              const requestData = {
                defenseScore: defenseScore,
                currentState: pendingState
              };
              
              const finalState = await api.executeDefense(requestData);
              const damageTaken = pendingState.playerCurrentHp - finalState.playerCurrentHp;
              
              // タイピング文字を消す
              setCurrentWord("");
              resetTyping("");

              //敵のダメージを受けるタイミングのメッセージ表示
              if (damageTaken > 0) {
                    setCurrentWord("");
                    resetTyping("");
                    setPlayerTakingDamage(true);
                    await showMessage(`敵の攻撃！ ${damageTaken} のダメージ！`, "danger");
                    playSE("/sounds/maou_se_battle18", 0.3);
                    setPlayerTakingDamage(false);
              } else if (defenseScore > 0 && damageTaken === 0) {
                    setCurrentWord("");
                    resetTyping("");
                    await showMessage("PERFECT GUARD!! 攻撃を完全に防いだ！", "success");
              }

                setPhase("SELECT"); // メッセージが消えてからSELECTに戻す
                setBattleState(finalState);
                setPendingState(null);
                setSelectedDecks([]);
                setCurrentWord("");
                resetTyping("");

              // 勝敗判定(敗北時)
              if (finalState.playerCurrentHp <= 0) {
                await showMessage("GAME OVER...", "danger");
                window.location.href = "/result" , { 
                  state: { isVictory: false, turns: finalState.turnCount, missCount: missCount } 
                };}
            } catch (error) {
              console.error("Defense API Error:", error);
            }
          };
          runDefense();
        }
      }
    }
  }, [timeLeft, maxTime, phase, pendingState, defenseScore]);


  const totalSelectedCost = selectedDecks.reduce((sum, d) => sum + d.skill.cost, 0);
  const justBonus = battleState && (totalSelectedCost === battleState.currentLimitCost &&
                                     totalSelectedCost > 0 );

  const handleStartChanting = () => {
    if (selectedDecks.length === 0) return;

    let newWord = "";
    let timeLimit = 0;
    const isOvercast = selectedDecks.length === 1 && totalSelectedCost > battleState.remainingCost;

    // タイピング時間の計算を修正して、オーバーキャスト時は1つのスキルのコストに基づく時間を設定する
    if (isOvercast) {
      newWord = getRandomWord(selectedDecks[0].skill.cost) + " " + getRandomWord(selectedDecks[0].skill.cost);
      timeLimit = 3000 + (selectedDecks[0].skill.cost * 1000); // 1つのスキルのコストに基づく時間
    } else {
      newWord = selectedDecks.map(d => getRandomWord(d.skill.cost)).join(" ");
      timeLimit = 3000 + (totalSelectedCost * 500); // 基本時間 + コストに応じた追加時間
    }

    setCurrentWord(newWord);
    resetTyping(newWord);
    setMaxTime(timeLimit);
    setTimeLeft(timeLimit);
    setPhase("ATTACK_TYPING");
  };


  //魔法使用時の処理
  const handleCastSkill = async () => {
    if (!isCompleted || selectedDecks.length === 0 || phase !== "ATTACK_TYPING") return;

    try {
      setTimeLeft(0);
      setMaxTime(0);
      setIsCasting(true);
      setTimeout(() => setIsCasting(false), 400);

      const slotNumbers = selectedDecks.map(d => d.slotNumber);

      const requestData = { 
        action: { 
          userId: 1, 
          slotNumbers: slotNumbers,
          justBonus: justBonus
        }, 
        currentState: battleState 
      };
      
      setCurrentWord("");
      resetTyping("");

      const updatedState = await api.executeAttack(requestData);
      playSE("/sounds/maou_se_8bit12", 0.3);

      // JUSTボーナス
      if (justBonus && updatedState.enemyCurrentHp < battleState.enemyCurrentHp) {
        await showMessage("JUST BONUS!! ダメージ1.5倍！", "success");

      }

      setBattleState({
        ...battleState,
        enemyCurrentHp: updatedState.enemyCurrentHp,
        remainingCost: updatedState.remainingCost
      });

      if (updatedState.enemyCurrentHp < battleState.enemyCurrentHp) {
        setEnemyTakingDamage(true);
        setTimeout(() => setEnemyTakingDamage(false), 500);
      }

      // 攻撃後の状態に応じて、次のフェーズを決定する
      if (!updatedState.battleFinished) {
        setTimeout(() => {
          setPendingState(updatedState); 
          setPhase("DEFENSE_TYPING");
          setDefenseScore(0);
          const firstWord = "SYSTEM DEFENSE";
          setCurrentWord(firstWord);
          resetTyping(firstWord);
          setMaxTime(8000);
          setTimeLeft(8000);
        }, 1000); 
        
      } else {
        setBattleState(updatedState);
        if (updatedState.victory) {

          setCurrentWord("");
          resetTyping("");

          await showMessage("VICTORY!! 敵を倒した！", "success"); 
          try {
            await api.finishBattle({ 
              userId: 1, 
              stageId: battleState.stageId, 
              isVictory: true, 
              clearTurns: updatedState.turnCount, 
              totalTypedChars: 100, 
              missedChars: missCount 
            });
            //リザルト画面へ遷移
            navigate("/result", { 
              state: { isVictory: true, turns: updatedState.turnCount, missCount: missCount } 
            });
          } catch (e) { console.error(e); }
        } else {
          await showMessage("GAME OVER...", "danger");
          //リザルト画面へ遷移
          navigate("/result", { 
            state: { isVictory: false, turns: updatedState.turnCount, missCount: missCount } 
          });
        }
      }
      
    } catch (error: any) {
      console.error("Cast Error:", error);
      showMessage(error.message || "魔法の発動に失敗しました", "danger");
    }
  };

  //マナチャージ（回復専念）の処理
  const handleManaCharge = async () => {
    // 選択していた魔法カードがあればキャンセルする
    setSelectedDecks([]);
    
    // 現在のタイピング状態をクリア
    setTimeLeft(0);
    setMaxTime(0);
    setCurrentWord("");
    resetTyping("");

    // メッセージを表示して少し待機
    await showMessage("MANA CHARGE!! 精神を集中する...", "info"); 

    // 攻撃していないので、コストは減らさずそのままの状態を引き継ぐ
    const simulatedPendingState = {
      ...battleState
    };

    setPendingState(simulatedPendingState);
    setPhase("DEFENSE_TYPING");
    setDefenseScore(0);
    
    // 最初の単語をセット
    const firstWord = "MANA CHARGE";
    setCurrentWord(firstWord);
    resetTyping(firstWord, true);
    
    // マナチャージボーナスとして、防衛時間を長め（10秒）にする
    setMaxTime(10000);
    setTimeLeft(10000);
    setFlowSpeed(3000); // 難易度に合わせてスピードを調整
  };

  if (isLoading) return <div className="battle-container">Loading Battle...</div>;
  if (!battleState) return <div className="battle-container">バトルの初期化に失敗しました。</div>;

  const isDefensePhase = phase === "DEFENSE_TYPING";

  return (
    <div className={`battle-container ${isCasting ? "cast-flash-effect" : ""} ${isDefensePhase ? "defense-phase-bg" : ""}`}>
      
      {!isBattleStarted && (
        <div className="battle-start-modal" onClick={() => setIsBattleStarted(true)}>
          <h1 className="battle-start-text">BATTLE START</h1>
          <p className="battle-click-text">Click to Start</p>
        </div>
      )}

      {/* ===== 上部：ビジュアルエリア ===== */}
      <div className="visual-area">
        <div className={`character player ${playerTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>Player</h3>
          <div className="hp-bar-bg"><div className="hp-bar-fill player-hp" style={{ width: `${(battleState.playerCurrentHp / battleState.playerMaxHp) * 100}%` }}></div></div>
          <p>HP: {battleState.playerCurrentHp} / {battleState.playerMaxHp}</p>
        </div>

        {/*エネミー側の表示 */}
        <div className={`character enemy ${enemyTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>{battleState.enemyName}</h3>
          
          {/*DBから送られてきた画像パスを使ってスライムを表示 */}
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={enemyTakingDamage ? battleState.enemyDamageImagePath : battleState.enemyImagePath} 
              alt={battleState.enemyName} 
              style={{ width: '120px', imageRendering: 'pixelated' }} 
            />
          </div>

          <div className="hp-bar-bg"><div className="hp-bar-fill enemy-hp" style={{ width: `${(battleState.enemyCurrentHp / battleState.enemyMaxHp) * 100}%` }}></div></div>
          <p>HP: {battleState.enemyCurrentHp} / {battleState.enemyMaxHp}</p>
        </div>
      </div>

      {/* ===== 中央：タイピングエリア ===== */}
      {phase !== "SELECT" && maxTime > 0 && (
        <div className="timer-container">
          <div className="timer-text">
            {phase === "ATTACK_TYPING" ? "CASTING TIME" : `DEFENSE TIME - MANA CHARGE x${defenseScore}`} : {(timeLeft / 1000).toFixed(1)}s
          </div>
          <div className="timer-bar-bg">
            <div className="timer-bar-fill" style={{ width: `${(timeLeft / maxTime) * 100}%`, background: phase === "DEFENSE_TYPING" ? "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)" : undefined }}></div>
          </div>
        </div>
      )}

      <div className="typing-area">
        <div className="cost-display">
          <h2>
            REMAIN MANA: <span style={{ color: "#ffeb3b" }}>{battleState.remainingCost}</span> / <span className="limit-cost">{battleState.currentLimitCost}</span>
            {justBonus && phase === "SELECT" && <span className="just-bonus-text">JUST!!</span>}
          </h2>
        </div>
        
        <div className="typing-lane">

          {phase === "SELECT" ? (
            <div className="static-word">
              <h1 style={{ fontSize: "1.8rem", letterSpacing: "5px" }}>SELECT MAGIC...</h1>
              <p style={{ color: "#000000" }}>Selected Cost: {totalSelectedCost}</p>
            </div>
          ) : (
            <div 
              key={currentWord} 
              className="flowing-word-container animate-flow"
              style={{ animationDuration: phase === "DEFENSE_TYPING" ? `${flowSpeed}ms` : `${maxTime * 0.7}ms`} }
            >
              <h1>
                <span className="typed-text" style={{ color: phase === "DEFENSE_TYPING" ? "#ffeb3b" : "#0072ff" }}>
                  {typed}
                </span>
                <span className="untyped-text">{untyped}</span>
              </h1>
            </div>
          )}
        </div>
        
        <p style={{ color: missCount >= 7 && phase === "ATTACK_TYPING" ? "#ff4b2b" : "inherit", fontWeight: "bold", marginTop: "10px" }}>
          Miss: {missCount} {phase === "ATTACK_TYPING" && `/ ${MAX_MISS_LIMIT}`}
        </p>
      </div>

      {/* ===== 下部：手札エリア ===== */}
      <div className="hand-area" style={{ position: "relative", overflow: "hidden" }}>

        {/*メッセージがある時だけ、モーダル表示*/}
        {battleMessage && (
          <div className="message-modal-overlay">
            <div className={`message-modal-content ${battleMessage.type}`}>
              {battleMessage.text}
            </div>
          </div>
        )}

        {/* 魔法カードの表示 */}
        <div className="cards">
          {/* マナチャージカード */}
          <div 
            className={`card mana-charge ${phase !== "SELECT" ? "disabled" : ""}`}
            onClick={() => {
              if (phase === "SELECT") handleManaCharge();
              if (justBonus && phase === "SELECT") playSE("/sounds/maou_se_8bit16.mp3", 0.3);
            }}
          >
            <div className="card-name" style={{ fontSize: "1rem", textAlign: "center", color: "#00ffff" }}>MANA CHARGE</div>
            <div className="card-cost" style={{ marginTop: "10px", color: "#00ffff" }}>Action</div>
          </div>

          {/* 魔法カード群 */}
          {userDecks.map((deck) => {
            const selectIndex = selectedDecks.findIndex(d => d.id === deck.id);
            const isSelected = selectIndex !== -1;
            const canSelect = isSelected || selectedDecks.length === 0 || (totalSelectedCost + deck.skill.cost <= battleState.remainingCost);

            // 状態に応じてクラス名を決定する
            let cardClass = "card selectable";
            if (isSelected) cardClass = "card selected";
            else if (!canSelect) cardClass = "card disabled";

            return (
              <div 
                key={deck.id} 
                className={cardClass}
                onClick={() => {
                  if (phase === "SELECT" && canSelect) {
                    if (isSelected) {
                      setSelectedDecks(prev => prev.filter(d => d.id !== deck.id));
                    } else {
                      setSelectedDecks(prev => [...prev, deck]);
                    }
                  }
                }}
              >
                {isSelected && <div className="selected-badge">{selectIndex + 1}</div>}
                <div className="card-name" style={{ fontSize: "0.8em", textAlign: "center" }}>{deck.skill.skillName}</div>
                <div className="card-cost" style={{ marginTop: "10px", color: "#fff" }}>Cost: {deck.skill.cost}</div>
              </div>
            );
          })}
        </div>

        <div className="actions" style={{ marginTop: "20px" }}>
          {phase === "SELECT" ? (
             <button 
               className="action-button cast-button" 
               disabled={selectedDecks.length === 0}
               onClick={handleStartChanting}
             >
               {selectedDecks.length > 0 ? "START CHANTING!" : "Select Cards..."}
             </button>
          ) : (
             <button 
               className="action-button cast-button" 
               disabled={!isCompleted || phase !== "ATTACK_TYPING"}
               onClick={handleCastSkill}
             >
               {isCompleted && phase === "ATTACK_TYPING" ? "CAST! (Click)" : "Typing..."}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}