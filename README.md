# Typing_mana_burst

「タイピング」×「魔法詠唱」×「RPG」を融合させた、フルスタックタイピングバトルゲームです。
単なるタイピング練習にとどまらない、戦略的なデッキ構築と緊張感ある詠唱バトルをReactとSpring Bootで実装しました。

![バトル画面イメージ](images/battle-screenshot.png)

---

## 使用技術

### Frontend
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen?logo=springboot)
![Java](https://img.shields.io/badge/Java-21-red?logo=openjdk)
![Hibernate](https://img.shields.io/badge/Hibernate-ORM-gray)

### Infrastructure / Tools
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Git](https://img.shields.io/badge/Git-Managed-f05032?logo=git)

---

## 主な機能

* **リアルタイム・タイピング詠唱システム**: 制限時間内にタイピングを成功させ、魔法を発動。
* **戦略的デッキビルド**: 魔法スキルをスロットにセットし、マナ（コスト）管理をしながら戦うバトルロジック。
* **JUSTボーナス**: コスト上限とピッタリ合わせた魔法構築による、ダメージ1.5倍の増幅機能。
* **防衛フェーズ**: 詠唱失敗やターン終了時の敵の攻撃に対し、タイピング成功数に応じたダメージカット処理。
* **進行型ステージ**: 敵を倒すことでステージが解放されるプログレッション機能。

---

## こだわりのポイント

### 技術面
* **堅牢なトランザクション管理**: `Spring Boot` の `@Transactional` を駆使し、複雑なバトルロジック（攻撃・防御）におけるデータの整合性を担保。
* **クリーンなデータ設計**: `DTO` パターンを採用し、フロントエンドとバックエンド間で安全なデータ通信を実現。
* **例外処理の統一**: `@RestControllerAdvice` によるグローバル例外ハンドリングを実装し、エラー発生時のユーザー体験を向上。
* **非同期処理の制御**: React側で `Promise` と `async/await` を活用し、UIのアニメーションとゲームの進行テンポを同期。

### デザイン面
* **王道RPGレトロUI**: `DotGothic16` フォントと二重線（ダブルボーダー）ウィンドウを採用し、往年のRPGのような重厚感を演出。
* **音ゲーライクなUX**: CSSアニメーションを制限時間と同期させ、「デッドライン（赤線）」に文字が吸い込まれる緊張感あるバトルUIを作成。
* **手触りの良いフィードバック**: 敵のダメージ時の赤色フラッシュや、被弾時の画面揺れ（シェイクエフェクト）など、高速タイピング時の視覚的・触覚的な気持ちよさを最大化する演出を実装。

---

## ローカルセットアップ・起動手順

GitHubからクローンし、Docker環境でビルド・起動が可能です。

```bash
# リポジトリをクローン
git clone [https://github.com/Yuu1016/Typing_mana_burst.git](https://github.com/Yuu1016/Typing_mana_burst.git)
cd Typing_mana_burst

# コンテナのビルドと起動
docker-compose up --build

#起動後、ブラウザで http://localhost:3000 にアクセスしてください。

##🔮 今後の展望
* **サウンド実装: 魔法発動時やタイピング時のSEを追加し、より没入感のある体験へアップデート。
* **スキルエディット機能: ユーザーが独自の魔法を作成できるシステム。

##🤝 開発者
#Yuu1016
#GitHub Profile

#このプロジェクトはReactとSpring Bootのフルスタック開発の学習および、UI/UXの追求を目的としています。
