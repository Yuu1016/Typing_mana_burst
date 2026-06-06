-- =============================================================
--  init.sql  ―  レトロタイピングRPG 初期データ投入スクリプト
--  対象DB : PostgreSQL 14+
--  実行方法: psql -U <user> -d <dbname> -f init.sql
-- =============================================================

-- -------------------------------------------------------
--  0. 既存テーブル削除（依存関係の逆順）
-- -------------------------------------------------------
DROP TABLE IF EXISTS t_battle_logs  CASCADE;
DROP TABLE IF EXISTS t_user_decks   CASCADE;
DROP TABLE IF EXISTS t_users        CASCADE;
DROP TABLE IF EXISTS m_stages       CASCADE;
DROP TABLE IF EXISTS m_skills       CASCADE;


-- =============================================================
--  1. DDL  ―  テーブル定義（外部キー依存順に作成）
-- =============================================================

-- ① スキル・カードマスタ
CREATE TABLE m_skills (
    skill_id             BIGSERIAL    PRIMARY KEY,
    skill_name           VARCHAR(100) NOT NULL UNIQUE,
    cost                 INT          NOT NULL CHECK (cost BETWEEN 1 AND 5),
    required_mana_type   VARCHAR(20)  NOT NULL,
    base_value           INT          NOT NULL,
    effect_type          VARCHAR(20)  NOT NULL,
    target_type          VARCHAR(20)  NOT NULL,
    description          TEXT
);

-- ② ステージマスタ
CREATE TABLE m_stages (
    id               BIGSERIAL    PRIMARY KEY,
    stage_number     INT          NOT NULL UNIQUE,
    stage_name       VARCHAR(100) NOT NULL,
    enemy_name       VARCHAR(100) NOT NULL,
    enemy_hp         INT          NOT NULL,
    enemy_attack     INT          NOT NULL,
    limit_cost_pool  VARCHAR(10)  NOT NULL
);

-- ③ ユーザーテーブル
CREATE TABLE t_users (
    id                BIGSERIAL    PRIMARY KEY,
    username          VARCHAR(50)  NOT NULL UNIQUE,
    current_hp        INT          NOT NULL DEFAULT 100,
    gold              INT          NOT NULL DEFAULT 0,
    cleared_stage_id  INT          NOT NULL DEFAULT 0
);

-- ④ ユーザーデッキテーブル
CREATE TABLE t_user_decks (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT    NOT NULL REFERENCES t_users(id)  ON DELETE CASCADE,
    skill_id     BIGINT    NOT NULL REFERENCES m_skills(skill_id) ON DELETE CASCADE,
    slot_number  INT       NOT NULL CHECK (slot_number BETWEEN 1 AND 5),
    CONSTRAINT uq_user_slot UNIQUE (user_id, slot_number)
);

-- ⑤ バトルログテーブル
CREATE TABLE t_battle_logs (
    id                 BIGSERIAL    PRIMARY KEY,
    user_id            BIGINT       NOT NULL REFERENCES t_users(id)  ON DELETE CASCADE,
    stage_id           INT          NOT NULL REFERENCES m_stages(id) ON DELETE CASCADE,
    is_victory         BOOLEAN      NOT NULL DEFAULT FALSE,
    clear_turns        INT,
    total_typed_chars  INT          NOT NULL DEFAULT 0,
    missed_chars       INT          NOT NULL DEFAULT 0,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================
--  2. DML  ―  マスターデータ
-- =============================================================

-- -------------------------------------------------------
--  m_skills  （25件）
--  属性: FIRE / WATER / WIND / EARTH / LIGHT / DARK
--  効果: DAMAGE / HEAL / BUFF / DEBUFF
--  対象: ENEMY_SINGLE / ENEMY_ALL / PLAYER
-- -------------------------------------------------------
INSERT INTO m_skills
    (skill_name, cost, required_mana_type, base_value, effect_type, target_type, description)
VALUES
-- ── FIRE 系 ─────────────────────────────────────
('ファイアブラスト',      2, 'FIRE',  35, 'DAMAGE',  'ENEMY_SINGLE',
 '激しい炎を1体の敵にたたきつける。コスト軽めで使いやすい序盤の主力スキル。'),

('インフェルノ',          5, 'FIRE', 120, 'DAMAGE',  'ENEMY_ALL',
 '地獄の業火で全敵を焼き尽くす。最大コストを消費するが、殲滅力は圧倒的。'),

('フレイムランス',        3, 'FIRE',  55, 'DAMAGE',  'ENEMY_SINGLE',
 '炎の槍を敵の弱点に突き刺す。単体高火力のバランス型攻撃スキル。'),

('ヒートウェーブ',        4, 'FIRE',  70, 'DAMAGE',  'ENEMY_ALL',
 '熱波を解き放ち、全敵にダメージを与える。ボス戦前の雑魚掃除に最適。'),

('エンバーベール',        2, 'FIRE',  18, 'BUFF',    'PLAYER',
 '炎のオーラをまとい、次の攻撃の威力が1.5倍になる。短いチャージで使えるお得なバフ。'),

-- ── WATER 系 ─────────────────────────────────────
('アクアヒール',          1, 'WATER', 40, 'HEAL',    'PLAYER',
 '清らかな水の力でHPを回復する。コスト最小の回復スキル。ピンチの切り札として常備したい。'),

('ブリザードエッジ',      3, 'WATER', 50, 'DAMAGE',  'ENEMY_SINGLE',
 '氷刃を鋭く放つ。HITすると敵の攻撃力を1ターン低下させる追加効果あり。'),

('アイスストーム',        4, 'WATER', 65, 'DAMAGE',  'ENEMY_ALL',
 '猛吹雪を巻き起こし、全敵に氷ダメージ。行動順が遅めなのが玉にきず。'),

('ライフスプリング',      3, 'WATER', 70, 'HEAL',    'PLAYER',
 '大地の泉から聖水を引き出し、HPを大きく回復。中盤以降の回復スキルの要。'),

('フロストシールド',      2, 'WATER', 20, 'BUFF',    'PLAYER',
 '氷の盾を展開し、次に受けるダメージを20ポイント吸収する。'),

-- ── WIND 系 ─────────────────────────────────────
('ウィンドカッター',      1, 'WIND',  25, 'DAMAGE',  'ENEMY_SINGLE',
 '風の刃で素早く斬りつける。コスト最小で毎ターン使えるお手軽アタック。'),

('サイクロンブレード',    4, 'WIND',  80, 'DAMAGE',  'ENEMY_ALL',
 '巨大な竜巻を起こし、全敵を巻き込んで斬り刻む。範囲最大級の風スキル。'),

('スピードブースト',      2, 'WIND',  15, 'BUFF',    'PLAYER',
 '風をまとい、次ターンのタイピング時間制限が1.5倍に延長される。'),

('テンペスト',            5, 'WIND', 110, 'DAMAGE',  'ENEMY_ALL',
 '嵐の権化となり、敵全体に暴風ダメージ。連続使用で評価ランクがUPする秘密の仕様がある。'),

-- ── EARTH 系 ─────────────────────────────────────
('ロックバレット',        2, 'EARTH', 30, 'DAMAGE',  'ENEMY_SINGLE',
 '岩石の弾丸を高速で射出する。属性耐性を無視した物理ダメージ扱い。'),

('グランドシェイク',      4, 'EARTH', 75, 'DAMAGE',  'ENEMY_ALL',
 '大地を揺るがし、全敵に地震ダメージ。飛行系の敵には効果が半減する。'),

('ストーンウォール',      3, 'EARTH', 30, 'BUFF',    'PLAYER',
 '岩壁を展開して防御力を強化。2ターンの間、被ダメージを30%軽減する。'),

-- ── LIGHT 系 ─────────────────────────────────────
('ホーリーアロー',        2, 'LIGHT', 40, 'DAMAGE',  'ENEMY_SINGLE',
 '聖なる矢でアンデッド系の敵に特効ダメージ。通常時でも安定した威力を発揮する。'),

('ライトニングボルト',    3, 'LIGHT', 60, 'DAMAGE',  'ENEMY_SINGLE',
 '天から稲妻を落とす。クリティカル率が高く、急所に当たると威力が2倍になる。'),

('ディバインレイ',        5, 'LIGHT',130, 'DAMAGE',  'ENEMY_SINGLE',
 '神の光を集束して放つ究極の単体攻撃。チャージ時間は長いが、全スキル中最高の単体火力を誇る。'),

('リザレクション',        4, 'LIGHT', 80, 'HEAL',    'PLAYER',
 '復活の光でHPを大幅回復。さらに次ターン防御力がアップする二重効果スキル。'),

-- ── DARK 系 ─────────────────────────────────────
('ダークブレス',          3, 'DARK',  55, 'DAMAGE',  'ENEMY_SINGLE',
 '闇の息吹を相手に吹きかける。HITした敵はHPが毎ターン5ずつ減少する毒効果あり。'),

('シャドウバースト',      5, 'DARK', 100, 'DAMAGE',  'ENEMY_ALL',
 '闇エネルギーを爆発させ、全敵に暗黒ダメージ。LIGHT属性スキルのカウンター的存在。'),

('カースウィスパー',      2, 'DARK',  20, 'DEBUFF',  'ENEMY_SINGLE',
 '呪いの言葉を刻みつけ、対象の攻撃力を2ターン半減させる。ボスの猛攻を凌ぐデバフ要員。'),

('ソウルドレイン',        4, 'DARK',  60, 'DAMAGE',  'ENEMY_SINGLE',
 '敵の魂から力を奪い取る。与えたダメージの30%分だけプレイヤーのHPが回復するドレイン効果付き。');


-- -------------------------------------------------------
--  m_stages  （13ステージ）
--  stage1〜4 : 序盤  limit_cost_pool='3-4'
--  stage5〜8 : 中盤  limit_cost_pool='3-5'
--  stage9〜13: 終盤  limit_cost_pool='4-5'
-- -------------------------------------------------------
INSERT INTO m_stages
    (stage_number, stage_name, enemy_name, enemy_hp, enemy_attack, limit_cost_pool)
VALUES
(1,  '緑の草原',          'スライム',          80,   8,  '3-4'),
(2,  '枯れ木の森',        'ゴブリン',         130,  14,  '3-4'),
(3,  '砂漠の迷路',        'サンドワーム',      200,  20,  '3-4'),
(4,  '溶岩の洞窟',        'ファイアリザード',  290,  28,  '3-4'),
(5,  '嵐の山脈',          'ストーンゴーレム',  400,  38,  '3-5'),
(6,  '呪われた沼地',      'ヴェノムトード',    520,  48,  '3-5'),
(7,  '氷の神殿',          'フロストナイト',    660,  58,  '3-5'),
(8,  '砂漠の王宮',        'ファラオの亡霊',    820,  70,  '3-5'),
(9,  '天空の要塞',        'グリフォン',        980,  84,  '4-5'),
(10, '暗黒の遺跡',        'シャドウデーモン', 1200, 100,  '4-5'),
(11, '深淵の城',          'ドラゴン',         1500, 120,  '4-5'),
(12, '魔王城の大広間',    '魔王の右腕・ゼロス',1900, 145,  '4-5'),
(13, '魔王城・玉座の間',  '魔王ダークロード',  2500, 180,  '4-5');


-- =============================================================
--  3. DML  ―  ユーザーデータ
-- =============================================================

-- -------------------------------------------------------
--  t_users  （3名）
-- -------------------------------------------------------
INSERT INTO t_users (username, current_hp, gold, cleared_stage_id)
VALUES
('typing_hero', 100,   100,  0),   -- id=1 初心者
('mana_master', 150,  2500,  5),   -- id=2 中級者
('burst_god',   300, 99999, 10);   -- id=3 最強デバッグ用


-- -------------------------------------------------------
--  t_user_decks  （各ユーザー スロット1〜5 = 計15行）
--
--  skill_id 対応表（上記INSERTの挿入順）
--    1  ファイアブラスト   cost2 FIRE   DAMAGE
--    2  インフェルノ       cost5 FIRE   DAMAGE  ALL
--    3  フレイムランス     cost3 FIRE   DAMAGE
--    4  ヒートウェーブ     cost4 FIRE   DAMAGE  ALL
--    5  エンバーベール     cost2 FIRE   BUFF
--    6  アクアヒール       cost1 WATER  HEAL
--    7  ブリザードエッジ   cost3 WATER  DAMAGE
--    8  アイスストーム     cost4 WATER  DAMAGE  ALL
--    9  ライフスプリング   cost3 WATER  HEAL
--   10  フロストシールド   cost2 WATER  BUFF
--   11  ウィンドカッター   cost1 WIND   DAMAGE
--   12  サイクロンブレード cost4 WIND   DAMAGE  ALL
--   13  スピードブースト   cost2 WIND   BUFF
--   14  テンペスト         cost5 WIND   DAMAGE  ALL
--   15  ロックバレット     cost2 EARTH  DAMAGE
--   16  グランドシェイク   cost4 EARTH  DAMAGE  ALL
--   17  ストーンウォール   cost3 EARTH  BUFF
--   18  ホーリーアロー     cost2 LIGHT  DAMAGE
--   19  ライトニングボルト cost3 LIGHT  DAMAGE
--   20  ディバインレイ     cost5 LIGHT  DAMAGE
--   21  リザレクション     cost4 LIGHT  HEAL
--   22  ダークブレス       cost3 DARK   DAMAGE
--   23  シャドウバースト   cost5 DARK   DAMAGE  ALL
--   24  カースウィスパー   cost2 DARK   DEBUFF
--   25  ソウルドレイン     cost4 DARK   DAMAGE
-- -------------------------------------------------------

-- ─── ユーザー1: typing_hero（初心者）
--   序盤向けの低コストスキルでデッキを構成
INSERT INTO t_user_decks (user_id, skill_id, slot_number) VALUES
(1,  6, 1),   -- slot1: アクアヒール       (cost1 HEAL)
(1,  1, 2),   -- slot2: ファイアブラスト   (cost2 DAMAGE)
(1, 11, 3),   -- slot3: ウィンドカッター   (cost1 DAMAGE)
(1, 15, 4),   -- slot4: ロックバレット     (cost2 DAMAGE)
(1, 18, 5);   -- slot5: ホーリーアロー     (cost2 DAMAGE)

-- ─── ユーザー2: mana_master（中級者）
--   中コスト帯を軸に回復・バフを交えたバランスデッキ
INSERT INTO t_user_decks (user_id, skill_id, slot_number) VALUES
(2,  9, 1),   -- slot1: ライフスプリング   (cost3 HEAL)
(2,  7, 2),   -- slot2: ブリザードエッジ   (cost3 DAMAGE)
(2, 19, 3),   -- slot3: ライトニングボルト (cost3 DAMAGE)
(2, 24, 4),   -- slot4: カースウィスパー   (cost2 DEBUFF)
(2, 17, 5);   -- slot5: ストーンウォール   (cost3 BUFF)

-- ─── ユーザー3: burst_god（最強デバッグ用）
--   全コスト5の最高火力スキルで全体殲滅特化デッキ
INSERT INTO t_user_decks (user_id, skill_id, slot_number) VALUES
(3,  2, 1),   -- slot1: インフェルノ       (cost5 FIRE   ALL)
(3, 14, 2),   -- slot2: テンペスト         (cost5 WIND   ALL)
(3, 20, 3),   -- slot3: ディバインレイ     (cost5 LIGHT  SINGLE)
(3, 23, 4),   -- slot4: シャドウバースト   (cost5 DARK   ALL)
(3, 21, 5);   -- slot5: リザレクション     (cost4 LIGHT  HEAL)


-- =============================================================
--  4. DML  ―  バトルログ（参照・デバッグ用サンプルデータ）
-- =============================================================

-- typing_hero のプレイ履歴（ステージ1のみ挑戦、1勝1敗）
INSERT INTO t_battle_logs
    (user_id, stage_id, is_victory, clear_turns, total_typed_chars, missed_chars, created_at)
VALUES
(1, 1, FALSE, NULL, 42,  9, NOW() - INTERVAL '2 days'),
(1, 1, TRUE,     8, 87, 14, NOW() - INTERVAL '1 day');

-- mana_master のプレイ履歴（ステージ1〜5をクリア済み）
INSERT INTO t_battle_logs
    (user_id, stage_id, is_victory, clear_turns, total_typed_chars, missed_chars, created_at)
VALUES
(2, 1, TRUE,  5,  78,  3, NOW() - INTERVAL '10 days'),
(2, 2, TRUE,  7, 104,  8, NOW() - INTERVAL '9 days'),
(2, 3, TRUE,  9, 132, 12, NOW() - INTERVAL '8 days'),
(2, 4, TRUE, 11, 165, 17, NOW() - INTERVAL '7 days'),
(2, 5, TRUE, 13, 210, 21, NOW() - INTERVAL '6 days');

-- burst_god のプレイ履歴（ステージ1〜10を怒涛のクリア）
INSERT INTO t_battle_logs
    (user_id, stage_id, is_victory, clear_turns, total_typed_chars, missed_chars, created_at)
VALUES
(3,  1, TRUE,  3,  55,  0, NOW() - INTERVAL '30 days'),
(3,  2, TRUE,  3,  62,  0, NOW() - INTERVAL '29 days'),
(3,  3, TRUE,  4,  80,  1, NOW() - INTERVAL '28 days'),
(3,  4, TRUE,  4,  88,  0, NOW() - INTERVAL '27 days'),
(3,  5, TRUE,  5,  97,  2, NOW() - INTERVAL '26 days'),
(3,  6, TRUE,  5, 110,  1, NOW() - INTERVAL '25 days'),
(3,  7, TRUE,  6, 128,  3, NOW() - INTERVAL '24 days'),
(3,  8, TRUE,  6, 139,  2, NOW() - INTERVAL '23 days'),
(3,  9, TRUE,  7, 155,  4, NOW() - INTERVAL '22 days'),
(3, 10, TRUE,  8, 178,  5, NOW() - INTERVAL '21 days');


-- =============================================================
--  5. 確認用クエリ（コメントアウト済み）
-- =============================================================

-- SELECT 'スキル数: ' || COUNT(*) FROM m_skills;
-- SELECT 'ステージ数: ' || COUNT(*) FROM m_stages;
-- SELECT 'ユーザー数: ' || COUNT(*) FROM t_users;
-- SELECT 'デッキ行数: ' || COUNT(*) FROM t_user_decks;
-- SELECT 'バトルログ数: ' || COUNT(*) FROM t_battle_logs;

-- -- ユーザーごとのデッキ内容（スキル名付き）
-- SELECT
--     u.username,
--     d.slot_number,
--     s.skill_name,
--     s.cost,
--     s.effect_type,
--     s.required_mana_type
-- FROM t_user_decks d
-- JOIN t_users   u ON d.user_id  = u.id
-- JOIN m_skills  s ON d.skill_id = s.skill_id
-- ORDER BY u.id, d.slot_number;