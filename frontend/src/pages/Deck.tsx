// src/pages/Deck.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";

export default function Deck() {
  const [user, setUser] = useState<any>(null);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 画面を開いた時にデータを取得
  useEffect(() => {
    // 1. ローカルストレージから全スキル（マスタデータ）を取得
    const masterDataStr = localStorage.getItem("game_master_data");
    if (masterDataStr) {
      setAllSkills(JSON.parse(masterDataStr).skills);
    }

    // 2. バックエンドからユーザー情報（現在のデッキ含む）を取得
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

  // 💡 スキルを入れ替える処理（APIを叩く）
  const handleSwapSkill = async (slotNumber: number, newSkillId: number) => {
    try {
      // APIを叩いてバックエンドを更新！
      const updatedUser = await api.updateDeckSlot(1, slotNumber, newSkillId);
      // 成功したら、画面のユーザー情報も最新に書き換える
      setUser(updatedUser);
      alert(`スロット ${slotNumber} のスキルを入れ替えました！`);
    } catch (error) {
      alert("スキルの入れ替えに失敗しました。");
    }
  };

  if (isLoading) return <div>Loading Deck...</div>;
  if (!user) return <div>Failed to load user.</div>;

  return (
    <div style={{ padding: "20px", color: "white", backgroundColor: "#1a1a2e", minHeight: "100vh" }}>
      <h2>📖 魔法書（デッキ編成）</h2>
      <Link to="/home" style={{ color: "#9a8c98" }}>← ホームに戻る</Link>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* 左側：所持している全スキル一覧 */}
        <div style={{ flex: 1, backgroundColor: "#22223b", padding: "10px", borderRadius: "8px" }}>
          <h3>所持スキル一覧</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {allSkills.map((skill) => (
              <div key={skill.skillId} style={{ border: "1px solid #4a4e69", padding: "10px", borderRadius: "5px", width: "120px" }}>
                <div>{skill.skillName}</div>
                <div style={{ color: "#ffeb3b" }}>Cost: {skill.cost}</div>
                <div style={{ fontSize: "0.8em", color: "#ccc" }}>{skill.effectType}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：現在のデッキ（スロット1〜5） */}
        <div style={{ flex: 1, backgroundColor: "#22223b", padding: "10px", borderRadius: "8px" }}>
          <h3>現在のデッキ</h3>
          {user.userDecks.sort((a: any, b: any) => a.slotNumber - b.slotNumber).map((deck: any) => (
            <div key={deck.id} style={{ border: "1px solid #4caf50", padding: "10px", margin: "10px 0", borderRadius: "5px" }}>
              <h4>Slot {deck.slotNumber} : {deck.skill.skillName} (Cost {deck.skill.cost})</h4>
              
              {/* テスト用の簡易入れ替えボタン（本来はドラッグ＆ドロップなどで実装） */}
              <div style={{ marginTop: "10px" }}>
                <span>入れ替え: </span>
                <select 
                  onChange={(e) => handleSwapSkill(deck.slotNumber, Number(e.target.value))}
                  value={deck.skill.skillId}
                >
                  {allSkills.map(s => (
                    <option key={s.skillId} value={s.skillId}>{s.skillName}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}