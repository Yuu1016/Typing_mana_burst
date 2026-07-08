// src/pages/Upgrade.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";

type UpgradeType = "HP" | "DEFENSE" | "TIME" | "MANA";

export default function Upgrade() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // ユーザー情報の取得（仮でID:1としています）
    api.getUserProfile(1)
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("ユーザー情報の取得に失敗", err);
        setIsLoading(false);
      });
  }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpgrade = async (type: UpgradeType, cost: number) => {
    if (user.gold < cost) {
      showMessage("ゴールドが足りません！", "error");
      return;
    }

    try {
      // 💡 先ほど作ったバックエンドのAPIを呼び出す！
      const updatedUser = await api.upgradeStatus(user.id, type);
      setUser(updatedUser);
      showMessage(`${type} を強化しました！`, "success");
    } catch (error) {
      showMessage("強化に失敗しました", "error");
    }
  };

  if (isLoading) return <div style={{ color: "white", padding: "20px" }}>Loading 工房...</div>;
  if (!user) return <div style={{ color: "white", padding: "20px" }}>ユーザー情報の読み込みに失敗しました。</div>;

  // 各強化項目のコスト計算（バックエンドと同じ式）
  const costHp = 50 + (user.upgradeHpLevel * 50);
  const costDefense = 100 + (user.upgradeDefenseLevel * 80);
  const costTime = 150 + (user.upgradeTimeLevel * 100);
  const costMana = 200 + (user.upgradeManaLevel * 150);

  return (
    <div style={{ padding: "30px", color: "white", backgroundColor: "#1a1a2e", minHeight: "100vh", fontFamily: "'DotGothic16', monospace" }}>
      <h2>🔨 マナ工房（アップグレード）</h2>
      <Link to="/home" style={{ color: "#9a8c98", textDecoration: "none", fontSize: "1.2rem" }}>← 街に戻る</Link>
      
      <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#000", border: "2px solid #ffd700", display: "inline-block", borderRadius: "5px" }}>
        <h3 style={{ margin: 0, color: "#ffd700" }}>所持ゴールド: {user.gold} G</h3>
      </div>

      {message && (
        <div style={{ 
          padding: "10px 20px", 
          backgroundColor: message.type === "success" ? "#4caf50" : "#ff4b2b",
          color: "white", 
          marginBottom: "20px", 
          borderRadius: "5px",
          display: "inline-block"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "600px" }}>
        
        {/* HP強化 */}
        <div className="upgrade-card" style={cardStyle}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "#4caf50" }}>最大HPアップ (Lv.{user.upgradeHpLevel})</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>基本HPを増やし、打たれ強くなる。<br/>現在の最大HP: {user.calculatedMaxHp}</p>
          </div>
          <button 
            onClick={() => handleUpgrade("HP", costHp)}
            disabled={user.gold < costHp}
            style={{ ...btnStyle, opacity: user.gold < costHp ? 0.5 : 1 }}
          >
            強化 ({costHp} G)
          </button>
        </div>

        {/* 防衛力強化 */}
        <div className="upgrade-card" style={cardStyle}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "#2196f3" }}>シールド強化 (Lv.{user.upgradeDefenseLevel})</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>防衛ワード成功時のダメージカット量が増加。<br/>現在のカット量: 1ワードにつき -{user.defenseCutRate}</p>
          </div>
          <button 
            onClick={() => handleUpgrade("DEFENSE", costDefense)}
            disabled={user.gold < costDefense}
            style={{ ...btnStyle, opacity: user.gold < costDefense ? 0.5 : 1 }}
          >
            強化 ({costDefense} G)
          </button>
        </div>

        {/* タイム強化 */}
        <div className="upgrade-card" style={cardStyle}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "#ff9800" }}>精神加速 (Lv.{user.upgradeTimeLevel})</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>詠唱および防衛フェーズのタイマーを延長。<br/>現在の延長ボーナス: +{(user.timeBonusMs / 1000).toFixed(1)} 秒</p>
          </div>
          <button 
            onClick={() => handleUpgrade("TIME", costTime)}
            disabled={user.gold < costTime}
            style={{ ...btnStyle, opacity: user.gold < costTime ? 0.5 : 1 }}
          >
            強化 ({costTime} G)
          </button>
        </div>

        {/* マナ回復強化 */}
        <div className="upgrade-card" style={cardStyle}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "#9c27b0" }}>マナ吸収 (Lv.{user.upgradeManaLevel})</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>ターン開始時のマナ自然回復量が増加。<br/>現在の追加回復: +{user.manaRecoveryBonus}</p>
          </div>
          <button 
            onClick={() => handleUpgrade("MANA", costMana)}
            disabled={user.gold < costMana}
            style={{ ...btnStyle, opacity: user.gold < costMana ? 0.5 : 1 }}
          >
            強化 ({costMana} G)
          </button>
        </div>

      </div>
    </div>
  );
}

// 簡単なインラインスタイル
const cardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#000",
  border: "2px solid #555",
  padding: "15px 20px",
  borderRadius: "8px",
};

const btnStyle: React.CSSProperties = {
  backgroundColor: "#ffeb3b",
  color: "#000",
  border: "none",
  padding: "10px 15px",
  fontWeight: "bold",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "inherit"
};