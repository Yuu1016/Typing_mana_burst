// src/pages/Battle.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";
import { useTyping } from "../hooks/useTyping";
import { getRandomWord } from "../utils/wordDictionary";
import "../pagesCss/Battle.css";
import "../pagesCss/BattleEffects.css"; 
import "../pagesCss/BattleComponents.css";

type BattlePhase = "SELECT" | "ATTACK_TYPING" | "DEFENSE_TYPING";

// 💡 メッセージの種類を定義
type MessageType = "info" | "success" | "danger";

export default function Battle() {
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

  // 💡 【追加】画面に表示するメッセージの管理
  const [battleMessage, setBattleMessage] = useState<{ text: string; type: MessageType } | null>(null);

  const [currentWord, setCurrentWord] = useState("");
  const { typed, untyped, missCount, isCompleted, resetTyping } = useTyping(currentWord);

  const MAX_MISS_LIMIT = 10;

  useEffect(() => {
    const STAGE_ID = 1;
    api.startBattle(1, STAGE_ID)
      .then((data) => {
        setBattleState(data);
        return api.getUserProfile(1);
      })
      .then((userData) => {
        setUserDecks(userData.userDecks.sort((a: any, b: any) => a.slotNumber - b.slotNumber));
        setIsLoading(false);
      })
      .catch((err) => console.error("バトル初期化エラー", err));
  }, []);

  // 💡 【追加】メッセージを表示し、3秒後に自動で消す関数
  const showMessage = (text: string, type: MessageType = "info") => {
    setBattleMessage({ text, type });
    // cssのアニメーション（3s）に合わせて消す
    setTimeout(() => {
      setBattleMessage(null);
    }, 3000); 
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

  useEffect(() => {
    if (phase === "DEFENSE_TYPING" && isCompleted) {
      setDefenseScore((prev) => prev + 1);
      const defenseWords = ["BLOCK", "GUARD", "SHIELD", "CHARGE", "BARRIER", "REFLECT"];
      const nextWord = defenseWords[Math.floor(Math.random() * defenseWords.length)];
      setCurrentWord(nextWord);
      resetTyping(nextWord);
    }
  }, [isCompleted, phase]);

  const handleChantFailure = (message: string) => {
    showMessage(message, "danger"); // 💡 alertから変更
    
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
    setMaxTime(5000);
    setTimeLeft(5000);
  };

  useEffect(() => {
    if (phase === "ATTACK_TYPING" && missCount >= MAX_MISS_LIMIT) {
      handleChantFailure("詠唱崩壊... 敵のターンへ移行します！");
    }
  }, [missCount, phase]);

  useEffect(() => {
    if (timeLeft === 0 && maxTime > 0) {
      if (phase === "ATTACK_TYPING") {
        handleChantFailure("TIME UP... 詠唱失敗！");
      } 
      else if (phase === "DEFENSE_TYPING") {
        setPhase("SELECT");
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

              if (damageTaken > 0) {
                setPlayerTakingDamage(true);
                setTimeout(() => setPlayerTakingDamage(false), 500);
              } else if (defenseScore > 0 && damageTaken === 0) {
                showMessage("PERFECT GUARD!! 攻撃を完全に防いだ！", "success"); // 💡 alertから変更
              }

              setBattleState(finalState);
              setPendingState(null);
              setSelectedDecks([]);
              setCurrentWord("");
              resetTyping("");

              if (finalState.playerCurrentHp <= 0) {
                showMessage("GAME OVER...", "danger"); // 💡 alertから変更
                setTimeout(() => {
                  window.location.href = "/home";
                }, 2000); // メッセージを見せるために少し待ってから遷移
              }
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
  const justBonus = battleState && (totalSelectedCost === battleState.currentLimitCost && totalSelectedCost > 0);

  const handleStartChanting = () => {
    if (selectedDecks.length === 0) return;

    let newWord = "";
    let timeLimit = 0;
    const isOvercast = selectedDecks.length === 1 && totalSelectedCost > battleState.remainingCost;

    if (isOvercast) {
      newWord = getRandomWord(selectedDecks[0].skill.cost) + " " + getRandomWord(selectedDecks[0].skill.cost);
      timeLimit = 5000 + (selectedDecks[0].skill.cost * 1000); 
    } else {
      newWord = selectedDecks.map(d => getRandomWord(d.skill.cost)).join(" ");
      timeLimit = 3000 + (totalSelectedCost * 1500);
    }

    setCurrentWord(newWord);
    resetTyping(newWord);
    setMaxTime(timeLimit);
    setTimeLeft(timeLimit);
    setPhase("ATTACK_TYPING");
  };

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

      const updatedState = await api.executeAttack(requestData);

      if (justBonus && updatedState.enemyCurrentHp < battleState.enemyCurrentHp) {
        showMessage("JUST BONUS!! ダメージ1.5倍！", "success"); // 💡 alertから変更
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

      if (!updatedState.battleFinished) {
        setTimeout(() => {
          setPendingState(updatedState); 
          setPhase("DEFENSE_TYPING");
          setDefenseScore(0);
          const firstWord = "SYSTEM DEFENSE";
          setCurrentWord(firstWord);
          resetTyping(firstWord);
          setMaxTime(5000);
          setTimeLeft(5000);
        }, 1000); 
        
      } else {
        setTimeout(async () => {
          setBattleState(updatedState);
          if (updatedState.victory) {
            showMessage("VICTORY!! 敵を倒した！", "success"); // 💡 alertから変更
            try {
              await api.finishBattle({ userId: 1, stageId: 1, isVictory: true, clearTurns: updatedState.turnCount, totalTypedChars: 100, missedChars: 5 });
            } catch (e) { console.error(e); }
            setTimeout(() => window.location.href = "/home", 2500); // 勝利の余韻
          } else {
            showMessage("GAME OVER...", "danger"); // 💡 alertから変更
            setTimeout(() => window.location.href = "/home", 2500);
          }
        }, 1000);
      }
      
    } catch (error: any) {
      console.error("Cast Error:", error);
      // バックエンドから送られてきたエラー理由を画面に表示
      showMessage(error.message || "魔法の発動に失敗しました", "danger");
    }
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

      {/* 💡 【追加】トーストメッセージエリア */}
      {battleMessage && (
        <div className={`battle-message-toast ${battleMessage.type}`}>
          {battleMessage.text}
        </div>
      )}

      <div className="visual-area">
        <div className={`character player ${playerTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>Player</h3>
          <div className="hp-bar-bg"><div className="hp-bar-fill player-hp" style={{ width: `${(battleState.playerCurrentHp / battleState.playerMaxHp) * 100}%` }}></div></div>
          <p>HP: {battleState.playerCurrentHp} / {battleState.playerMaxHp}</p>
        </div>

        <div className={`character enemy ${enemyTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>{battleState.enemyName}</h3>
          <div className="hp-bar-bg"><div className="hp-bar-fill enemy-hp" style={{ width: `${(battleState.enemyCurrentHp / battleState.enemyMaxHp) * 100}%` }}></div></div>
          <p>HP: {battleState.enemyCurrentHp} / {battleState.enemyMaxHp}</p>
        </div>
      </div>

      {phase !== "SELECT" && maxTime > 0 && (
        <div className="timer-container">
          <div className="timer-text">
            {phase === "ATTACK_TYPING" ? "CASTING TIME" : `DEFENSE TIME - MANA CHARGE x${defenseScore}`} : {(timeLeft / 1000).toFixed(1)}s
          </div>
          <div className="timer-bar-bg">
            <div className="timer-bar-fill" style={{ width: `${(timeLeft / maxTime) * 100}%`, background: phase === "DEFENSE_TYPING" ? "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)" : undefined }}></div>
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
        
        <div className="word-display">
          {phase === "SELECT" ? (
            <div>
              <h1 style={{ color: "#9a8c98", fontSize: "1.8rem", letterSpacing: "5px" }}>SELECT MAGIC...</h1>
              <p style={{ color: "#ffeb3b" }}>Selected Cost: {totalSelectedCost}</p>
            </div>
          ) : (
            <h1>
              <span style={{ color: phase === "DEFENSE_TYPING" ? "#0072ff" : "#555" }}>{typed}</span>
              <span style={{ color: "#fff" }}>{untyped}</span>
            </h1>
          )}
          
          <p style={{ color: missCount >= 7 && phase === "ATTACK_TYPING" ? "#ff4b2b" : "inherit", fontWeight: "bold" }}>
            Miss: {missCount} {phase === "ATTACK_TYPING" && `/ ${MAX_MISS_LIMIT}`}
          </p>
        </div>
      </div>

      <div className="hand-area">
        <div className="cards">
          {userDecks.map((deck) => {
            const selectIndex = selectedDecks.findIndex(d => d.id === deck.id);
            const isSelected = selectIndex !== -1;
            const canSelect = isSelected || selectedDecks.length === 0 || (totalSelectedCost + deck.skill.cost <= battleState.remainingCost);

            return (
              <div 
                key={deck.id} 
                className="card" 
                style={{
                  position: "relative",
                  borderColor: isSelected ? "#ffeb3b" : (!canSelect ? "#555" : "#9a8c98"),
                  transform: isSelected ? "translateY(-10px)" : "none",
                  boxShadow: isSelected ? "0 0 15px rgba(255, 235, 59, 0.5)" : "none",
                  opacity: !canSelect && !isSelected ? 0.4 : 1,
                  cursor: phase === "SELECT" && canSelect ? "pointer" : "not-allowed",
                  transition: "all 0.2s"
                }}
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