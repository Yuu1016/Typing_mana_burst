// src/pages/Title.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../API/apiClient";

export default function Title() {
  const [isLoaded, setIsLoaded] = useState(false);

  // 画面が表示された時に1回だけ実行される
  useEffect(() => {
    // バックエンドからマスタデータを取得する
    api.getMasterData()
      .then((data) => {
        console.log("マスタデータ取得成功:", data);
        // TODO: 本当はここでContextやReduxなどのグローバル状態管理に保存しますが、
        // 今回はシンプルにローカルストレージに保存して使い回すことにします。
        localStorage.setItem("game_master_data", JSON.stringify(data));
        setIsLoaded(true); // 読み込み完了！
      })
      .catch((error) => {
        console.error("マスタデータの取得に失敗しました", error);
        // エラーでもとりあえず進めるようにしておく（開発用）
        setIsLoaded(true);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Typing Mana Burst</h1>
      <p>PRESS ANY KEY TO START</p>
      
      {/* マスタデータが読み込まれるまではボタンを押せないようにする */}
      {isLoaded ? (
        <Link to="/home">
          <button style={{ padding: "10px 30px", fontSize: "1.2rem" }}>START</button>
        </Link>
      ) : (
        <p>Loading Game Data...</p>
      )}
    </div>
  );
}