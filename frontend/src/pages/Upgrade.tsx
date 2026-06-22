import { Link } from "react-router-dom";

export default function Upgrade() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>強化・工房画面</h2>
      <p>ゴールドを使ってHPを強化します。</p>
      <Link to="/home">ホームに戻る</Link>
    </div>
  );
}