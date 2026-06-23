const BASE_URL = "http://localhost:8080/api/v1";

/**
 * 汎用的なAPI呼び出し関数
 * @param endpoint 例: "/master-data" や "/users/1"
 * @param options fetchのオプション（メソッドやボディなど）
 */

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url =`${BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const margedOptions = { ...defaultOptions, ...options};

    try{
        const response = await fetch(url, margedOptions);

        if (!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

// --------------------------------------------------
// 各種APIを呼び出すための専用関数を定義していく
// --------------------------------------------------

export const api = {
  // 【マスタデータ取得】
  getMasterData: () => fetchApi("/master-data"),

  // 【ユーザー情報取得】
  getUserProfile: (userId: number) => fetchApi(`/users/${userId}`),

  // 【デッキの特定スロットのスキルを入れ替える】
  updateDeckSlot: (userId: number, slotNumber: number, newSkillId: number) =>
    fetchApi(`/users/${userId}/decks/${slotNumber}`, {
      method: "PUT",
      body: JSON.stringify({ newSkillId }),
    }),

  // 【バトル開始】
  startBattle: (userId: number, stageId: number) => 
    fetchApi("/battles/start", {
      method: "POST",
      body: JSON.stringify({ userId, stageId }),
    }),

  // 【スキル発動】
  castSkill: (userId: number, slotNumber: number, currentState: any) =>
    fetchApi("/battles/cast", {
      method: "POST",
      body: JSON.stringify({
        action: { userId, slotNumber },
        currentState: currentState,
      }),
    }),

  //攻撃フェーズ用（複数スキルとJUSTボーナスを一括送信）
  executeAttack: (requestBody: any) =>
    fetchApi("/battles/attack", {
      method: "POST",
      body: JSON.stringify(requestBody),
    }),

  //防衛フェーズ・詠唱失敗用（スコアを送信して結果を受け取る！）
  executeDefense: (requestBody: any) =>
    fetchApi("/battles/defense", {
      method: "POST",
      body: JSON.stringify(requestBody),
    }),

  // バトル終了後のリザルト送信
  finishBattle: (requestBody: any) =>
    fetchApi("/battles/result", {
      method: "POST",
      body: JSON.stringify(requestBody),
    }),
}

