// src/pages/StageSelect.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../API/apiClient";

export default function StageSelect() {
  const [stages, setStages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ステージ一覧とユーザー情報を同時に取得する
    Promise.all([
      api.getAllMasterData(),
      api.getUserProfile(1) // 仮でユーザーIDを1としています
    ])
      .then(([masterData, userData]) => {
        // ステージ番号順に並び替えてセット
        const sortedStages = masterData.stages.sort((a: any, b: any) => a.stageNumber - b.stageNumber);
        setStages(sortedStages);
        setUser(userData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("データ取得エラー", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div style={{ color: "white", padding: "20px" }}>Loading Stages...</div>;
  if (!user || stages.length === 0) return <div style={{ color: "white", padding: "20px" }}>データの読み込みに失敗しました。</div>;

  // プレイヤーが次に進む最新のステージ番号
  const nextStageNumber = user.clearedStageId + 1;

  return (
    <div style={{ padding: "30px", color: "white", backgroundColor: "#1a1a2e", minHeight: "100vh", fontFamily: "'DotGothic16', monospace" }}>
      <h2>🗺️ ダンジョン選択</h2>
      <Link to="/home" style={{ color: "#9a8c98", textDecoration: "none", fontSize: "1.2rem" }}>← 街に戻る</Link>
      
      <p style={{ marginTop: "20px", color: "#ccc" }}>
        現在のクリア進行度: ステージ {user.clearedStageId} まで踏破
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "600px", marginTop: "20px" }}>
        {stages.map((stage) => {
          // ステータスの判定
          const isCleared = stage.stageNumber <= user.clearedStageId;
          const isNext = stage.stageNumber === nextStageNumber;
          const isLocked = stage.stageNumber > nextStageNumber;

          // 状態に合わせた見た目の切り替え
          let borderColor = "#555";
          let bgColor = "#000";
          let statusText = "🔒 LOCKED";
          let statusColor = "#555";

          if (isCleared) {
            borderColor = "#4caf50"; // クリア済みは緑
            statusText = "CLEAR!";
            statusColor = "#4caf50";
          } else if (isNext) {
            borderColor = "#ffeb3b"; // 次のステージは黄色で強調
            bgColor = "#1a1a00";
            statusText = "NEW!";
            statusColor = "#ffeb3b";
          }

          return (
            <div 
              key={stage.id} 
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                padding: "15px 20px",
                borderRadius: "8px",
                opacity: isLocked ? 0.6 : 1, // ロック中は少し暗くする
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "transform 0.1s"
              }}
              // クリックした時の処理（ロックされていなければ、そのステージのバトルへ飛ぶ)
              onClick={() => {
                if (!isLocked) {
                  // まだBattle.tsx側が未対応ですが、とりあえず /battle/3 のようなURLに飛ばす準備
                  navigate(`/battle/${stage.id}`);
                }
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0", color: isLocked ? "#777" : "#fff" }}>
                  Stage {stage.stageNumber} : {stage.stageName}
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>
                  {isLocked ? "？？？" : `出現モンスター: ${stage.enemyName}`}
                </p>
              </div>
              
              <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: statusColor }}>
                {statusText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}