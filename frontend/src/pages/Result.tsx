// src/pages/Result.tsx
import { useLocation, Link } from "react-router-dom";

export default function Result() {
  // バトル画面から送られてきたデータ（state）を受け取る
  const location = useLocation();
  const state = location.state || {};

  const isVictory = state.isVictory ?? false;
  const turns = state.turns || 0;
  const missCount = state.missCount || 0;
  
  // 勝利時は100G獲得（バックエンドの仕様に合わせる）
  const earnedGold = isVictory ? 100 : 0;

  return (
    <div style={{ 
      padding: "30px", 
      color: "white", 
      backgroundColor: "#000000", 
      minHeight: "100vh", 
      fontFamily: "'DotGothic16', monospace", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center" 
    }}>
      
      <h1 style={{ 
        fontSize: "4rem", 
        color: isVictory ? "#ffeb3b" : "#ff4b2b", 
        marginTop: "10vh",
        textShadow: `0 0 20px ${isVictory ? "rgba(255, 235, 59, 0.5)" : "rgba(255, 75, 43, 0.5)"}`
      }}>
        {isVictory ? "STAGE CLEAR!!" : "GAME OVER..."}
      </h1>

      <div style={{ 
        backgroundColor: "#1a1a2e", 
        border: "6px double #ffffff", 
        padding: "40px", 
        width: "100%",
        maxWidth: "500px", 
        margin: "40px 0", 
        borderRadius: "8px" 
      }}>
        <h2 style={{ textAlign: "center", borderBottom: "2px solid #555", paddingBottom: "15px", marginBottom: "20px" }}>
          BATTLE RESULT
        </h2>
        
        <div style={{ fontSize: "1.5rem", display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span>クリアターン</span>
          <span>{turns} ターン</span>
        </div>
        
        <div style={{ fontSize: "1.5rem", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <span>ミスタイプ数</span>
          <span>{missCount} 回</span>
        </div>
        
        <hr style={{ borderColor: "#555" }} />
        
        <div style={{ fontSize: "2rem", color: "#ffd700", display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <span>獲得ゴールド</span>
          <span>{earnedGold} G</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {isVictory && (
          <Link to="/stage-select" className="action-button" style={{ backgroundColor: "#0072ff", color: "#fff" }}>
            ステージセレクト
          </Link>
        )}
        <Link to="/home" className="action-button">
          街に戻る
        </Link>
      </div>

    </div>
  );
}