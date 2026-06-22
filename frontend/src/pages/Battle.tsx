// src/pages/Battle.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";
import { useTyping } from "../hooks/useTyping";
import { getRandomWord } from "../utils/wordDictionary";
import "../pagesCss/Battle.css";

type BattlePhase = "SELECT" | "ATTACK_TYPING" | "DEFENSE_TYPING";

export default function Battle() {
  const [battleState, setBattleState] = useState<any>(null);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<any>(null);

  const [phase, setPhase] = useState<BattlePhase>("SELECT");
  const [timeLeft, setTimeLeft] = useState(0); 
  const [maxTime, setMaxTime] = useState(0);   

  const [pendingState, setPendingState] = useState<any>(null);
  const [defenseScore, setDefenseScore] = useState(0);

  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [enemyTakingDamage, setEnemyTakingDamage] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);

  const [currentWord, setCurrentWord] = useState("");
  const { typed, untyped, missCount, isCompleted, resetTyping } = useTyping(currentWord);

  const MAX_MISS_LIMIT = 10; // 💡 ミス許容回数

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

  // タイマーダウン処理
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

  // 防衛フェーズ中のスコア加算
  useEffect(() => {
    if (phase === "DEFENSE_TYPING" && isCompleted) {
      setDefenseScore((prev) => prev + 1);
      
      const defenseWords = ["BLOCK", "GUARD", "SHIELD", "CHARGE", "BARRIER", "REFLECT"];
      const nextWord = defenseWords[Math.floor(Math.random() * defenseWords.length)];
      setCurrentWord(nextWord);
      resetTyping(nextWord);
    }
  }, [isCompleted, phase]);

  // タイポ（ミス）制限ペナルティの監視
  useEffect(() => {
    if (phase === "ATTACK_TYPING" && missCount >= MAX_MISS_LIMIT) {
      alert("MISS LIMIT EXCEEDED!! 集中力が切れ、詠唱が崩壊した！");
      setPhase("SELECT");
      setSelectedDeck(null);
      setCurrentWord("");
      resetTyping("");
      setMaxTime(0);
      setTimeLeft(0);
    }
  }, [missCount, phase]);

  // 時間切れの処理とダメージ計算
  useEffect(() => {
    if (timeLeft === 0 && maxTime > 0) {
      if (phase === "ATTACK_TYPING") {
        alert("TIME UP... 詠唱に失敗した！");
        setPhase("SELECT");
        setSelectedDeck(null);
        setCurrentWord("");
        resetTyping("");
        setMaxTime(0);
      } 
      else if (phase === "DEFENSE_TYPING") {
        setPhase("SELECT");
        setMaxTime(0);

        if (pendingState) {
          // 💡 【追加】ダメージカット（ガード）ロジック
          // バックエンドが想定した本来のダメージ量
          const intendedDamage = battleState.playerCurrentHp - pendingState.playerCurrentHp;
          
          // 防御スコア1につき、3ダメージカット！
          const damageCut = defenseScore * 3;
          let finalDamage = Math.max(0, intendedDamage - damageCut);
          
          const finalPlayerHp = battleState.playerCurrentHp - finalDamage;

          // アニメーションと演出
          if (finalDamage > 0) {
            setPlayerTakingDamage(true);
            setTimeout(() => setPlayerTakingDamage(false), 500);
          } else if (intendedDamage > 0) {
            // ダメージを完全に0に抑え込んだ場合
            alert(`PERFECT GUARD!! 防御力で敵の攻撃(${intendedDamage}Dmg)を完全に弾き返した！`);
          }

          // マナ回復ボーナス
          const finalRemainingCost = Math.min(
            pendingState.currentLimitCost, 
            pendingState.remainingCost + defenseScore
          );

          setBattleState({
            ...pendingState,
            playerCurrentHp: finalPlayerHp, // 計算し直したHPで上書き
            remainingCost: finalRemainingCost
          });

          setPendingState(null);
          setSelectedDeck(null);
          setCurrentWord("");
          resetTyping("");
        }
      }
    }
  }, [timeLeft, maxTime, phase, pendingState, battleState, defenseScore]);


  const handleCastSkill = async () => {
    if (!isCompleted || !selectedDeck || phase !== "ATTACK_TYPING") return;

    try {
      setTimeLeft(0);
      setMaxTime(0);

      setIsCasting(true);
      setTimeout(() => setIsCasting(false), 400);

      const requestData = {
        action: { userId: 1, slotNumber: selectedDeck.slotNumber },
        currentState: battleState
      };

      const updatedState = await api.castSkillDirect(requestData);

      setBattleState({
        ...battleState,
        enemyCurrentHp: updatedState.enemyCurrentHp,
        remainingCost: battleState.remainingCost - selectedDeck.skill.cost
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

          setMaxTime(10000);
          setTimeLeft(10000);
        }, 1000); 
        
      } else {
        setTimeout(async () => {
          setBattleState(updatedState);
          if (updatedState.victory) {
            alert("VICTORY!! 敵を倒した！");
            try {
              await api.finishBattle({
                userId: 1, stageId: 1, isVictory: true,
                clearTurns: updatedState.turnCount,
                totalTypedChars: 100, missedChars: 5
              });
            } catch (e) { console.error(e); }
            window.location.href = "/home"; 
          } else {
            alert("GAME OVER...");
            window.location.href = "/home";
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error("Cast Error:", error);
      alert("魔法の発動に失敗しました");
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

      {/* ===== 上部：ビジュアル＆ステータスエリア ===== */}
      <div className="visual-area">
        <div className={`character player ${playerTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>Player</h3>
          <div className="hp-bar-bg">
            <div className="hp-bar-fill player-hp" style={{ width: `${(battleState.playerCurrentHp / battleState.playerMaxHp) * 100}%` }}></div>
          </div>
          <p>HP: {battleState.playerCurrentHp} / {battleState.playerMaxHp}</p>
        </div>

        <div className={`character enemy ${enemyTakingDamage ? "shake-effect damage-flash" : ""}`}>
          <h3>{battleState.enemyName}</h3>
          <div className="hp-bar-bg">
            <div className="hp-bar-fill enemy-hp" style={{ width: `${(battleState.enemyCurrentHp / battleState.enemyMaxHp) * 100}%` }}></div>
          </div>
          <p>HP: {battleState.enemyCurrentHp} / {battleState.enemyMaxHp}</p>
        </div>
      </div>

      {/* タイマーゲージ＆防衛スコア */}
      {phase !== "SELECT" && maxTime > 0 && (
        <div className="timer-container">
          <div className="timer-text">
            {phase === "ATTACK_TYPING" ? "CASTING TIME" : `DEFENSE TIME - MANA CHARGE x${defenseScore}`} 
            : {(timeLeft / 1000).toFixed(1)}s
          </div>
          <div className="timer-bar-bg">
            <div 
              className="timer-bar-fill" 
              style={{ 
                width: `${(timeLeft / maxTime) * 100}%`,
                background: phase === "DEFENSE_TYPING" ? "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)" : undefined
              }}
            ></div>
          </div>
        </div>
      )}

      {/* ===== 中央：タイピングエリア ===== */}
      <div className="typing-area">
        <div className="cost-display">
          <h2>REMAIN MANA: <span style={{ color: "#ffeb3b" }}>{battleState.remainingCost}</span> / <span className="limit-cost">{battleState.currentLimitCost}</span></h2>
        </div>
        
        <div className="word-display">
          {currentWord === "" ? (
            <h1 style={{ color: "#9a8c98", fontSize: "2rem", letterSpacing: "5px" }}>SELECT MAGIC...</h1>
          ) : (
            <h1>
              <span style={{ color: phase === "DEFENSE_TYPING" ? "#0072ff" : "#555" }}>{typed}</span>
              <span style={{ color: "#fff" }}>{untyped}</span>
            </h1>
          )}
          
          {/* 💡 ミス回数のUIを強化！制限が近づくと赤くなります */}
          <p style={{ color: missCount >= 7 && phase === "ATTACK_TYPING" ? "#ff4b2b" : "inherit", fontWeight: "bold" }}>
            Miss: {missCount} {phase === "ATTACK_TYPING" && `/ ${MAX_MISS_LIMIT}`}
          </p>
          
          {isCompleted && phase === "ATTACK_TYPING" && <p style={{ color: "#4caf50", fontWeight: "bold" }}>TYPING CLEAR!!</p>}
        </div>
      </div>

      {/* ===== 下部：手札エリア ===== */}
      <div className="hand-area">
        <div className="cards">
          {userDecks.map((deck) => {
            const isSelected = selectedDeck?.id === deck.id;
            const isLackCost = battleState.remainingCost < deck.skill.cost;

            return (
              <div 
                key={deck.id} 
                className="card" 
                style={{
                  borderColor: isSelected ? "#ffeb3b" : (isLackCost ? "#ff4b2b" : "#9a8c98"),
                  transform: isSelected ? "translateY(-10px)" : "none",
                  boxShadow: isSelected ? "0 0 15px rgba(255, 235, 59, 0.5)" : (isLackCost ? "0 0 10px rgba(255, 75, 43, 0.3)" : "none"),
                  cursor: phase === "SELECT" ? "pointer" : "not-allowed",
                  transition: "all 0.2s"
                }}
                onClick={() => {
                  if (phase === "SELECT") {
                    setSelectedDeck(deck);
                    let newWord = "";
                    let timeLimit = 0;

                    if (isLackCost) {
                      newWord = getRandomWord(deck.skill.cost) + " " + getRandomWord(deck.skill.cost);
                      timeLimit = 5000 + (deck.skill.cost * 1000); 
                    } else {
                      newWord = getRandomWord(deck.skill.cost);
                      timeLimit = 3000 + (deck.skill.cost * 1500);
                    }

                    setCurrentWord(newWord);
                    resetTyping(newWord);
                    setMaxTime(timeLimit);
                    setTimeLeft(timeLimit);
                    setPhase("ATTACK_TYPING");
                  }
                }}
              >
                <div className="card-name" style={{ fontSize: "0.8em", textAlign: "center" }}>{deck.skill.skillName}</div>
                <div className="card-cost" style={{ marginTop: "10px", color: isLackCost ? "#ff4b2b" : "#fff" }}>
                  Cost: {deck.skill.cost} {isLackCost && <span style={{ fontSize: "0.7em" }}><br/>OVERCAST!</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="actions" style={{ marginTop: "20px" }}>
          <button 
            className="action-button cast-button" 
            disabled={!isCompleted || phase !== "ATTACK_TYPING"}
            onClick={handleCastSkill}
          >
            {isCompleted && phase === "ATTACK_TYPING" ? "CAST! (Click)" : "Select & Typing..."}
          </button>
        </div>
      </div>
    </div>
  );
}