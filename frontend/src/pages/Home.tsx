// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";
import "../pagesCss/Home.css"; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 💡 テスト用にID:1のユーザーを取得
    api.getUserProfile(1)
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("ユーザー情報の取得に失敗しました", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="home-container">Loading...</div>;
  if (!user) return <div className="home-container">ユーザー情報の読み込みに失敗しました。</div>;

  return (
    <div className="home-container">
      <h2 className="home-title">ホーム（拠点）</h2>
      
      {/* ユーザーステータス */}
      <div className="status-card">
        <p>
          <span className="status-label">👤 プレイヤー</span>
          <span className="status-value">{user.username}</span>
        </p>
        <p>
          <span className="status-label">💰 ゴールド</span>
          <span className="status-value status-gold">{user.gold} G</span>
        </p>
        <p>
          <span className="status-label">❤️ 最大HP</span>
          <span className="status-value status-hp">{user.currentHp}</span>
        </p>
        <p style={{ fontSize: "0.9em", marginTop: "15px", textAlign: "right" }}>
          <span className="status-label">🏆 最高クリア:</span>
          <span className="status-value">Stage {user.clearedStageId}</span>
        </p>
      </div>
      
      {/* メニューボタン */}
      <div className="menu-buttons">
        <Link to="/battle" className="menu-button button-battle">ダンジョンに挑む</Link>
        <Link to="/deck" className="menu-button">魔法書を開く (編成)</Link>
        <Link to="/upgrade" className="menu-button">魔力を強化する (工房)</Link>
      </div>
      
      <Link to="/" className="back-link">タイトルへ戻る</Link>
    </div>
  );
}