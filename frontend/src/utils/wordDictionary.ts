// src/utils/wordDictionary.ts

//後々、外部APIに変更予定

// コストごとの英単語リスト（各50個）
const wordsByCost: Record<number, string[]> = {
  // コスト1: 3文字（簡単な動物、自然、道具など）
  1: [
    "CAT", "DOG", "SUN", "RED", "SKY", "ICE", "BAT", "FOX", "OWL", "GEM",
    "ANT", "APE", "BUG", "COW", "DAY", "EYE", "FLY", "GOD", "HAT", "INK",
    "JOY", "KEY", "LIP", "MAP", "NUT", "OAK", "PIG", "RAT", "SEA", "TOY",
    "VAN", "WEB", "AXE", "BOW", "CAP", "EAR", "FOG", "GUM", "HIT", "ION",
    "JAM", "LOG", "MAN", "NET", "OIL", "PEN", "RIB", "SIN", "TEA", "ZOO",
    "METAMORPHOSIS",// 13文字（変身、変態）
    "DISINTEGRATION"// 14文字（崩壊、分解）
  ],

  // コスト2: 4文字（自然現象、物質、感情、装備など）
  2: [
    "FIRE", "WIND", "RAIN", "SNOW", "MOON", "STAR", "WAVE", "SAND", "IRON", "GOLD",
    "BEAR", "BIRD", "BONE", "BOOK", "CLAY", "COAL", "COLD", "DART", "DARK", "DEER",
    "DOOR", "DUST", "EVIL", "FACE", "FATE", "FEAR", "FISH", "FROG", "GATE", "GEAR",
    "HAIR", "HAND", "HEAD", "HEAL", "HEAT", "HOPE", "HORN", "KING", "LEAF", "LIFE",
    "LION", "LOVE", "MAGE", "MEAT", "MIND", "RING", "ROCK", "ROOT", "ROSE", "SOUL",
    "CRYSTALLIZATION",// 15文字（結晶化）
    "INVULNERABILITY" // 15文字（無敵、不死身）
  ],

  // コスト3: 5文字（魔法、武器、モンスター、少し複雑な概念など）
  3: [
    "WATER", "EARTH", "LIGHT", "NIGHT", "SWORD", "MAGIC", "STONE", "BLOOD", "SPELL", "ALIEN",
    "ANGEL", "APPLE", "ARMOR", "ARROW", "BEAST", "BLADE", "BRAIN", "BREAD", "BRICK", "CHAIN",
    "CHARM", "CLOCK", "CLOUD", "CROWN", "CURSE", "DEMON", "DREAM", "FAIRY", "FLAME", "FLESH",
    "GHOST", "GLASS", "GRASS", "HEART", "HORSE", "JEWEL", "METAL", "OCEAN", "PEACE", "PEARL",
    "PLANT", "POWER", "RIVER", "SCALE", "SKULL", "SLIME", "SNAKE", "STEEL", "THIEF", "TOWER",
    "PHANTASMAGORIA",// 14文字（走馬灯、幻影の連続）
    "TRANSCENDENTAL",// 14文字（超越的な）
    "MATERIALIZATION",// 15文字（具現化、物質化）
    "PERSONIFICATION",// 15文字（化身、擬人化）
    "HALLUCINOGENIC" // 14文字（幻覚を引き起こす）
  ],
  // コスト4: 6〜8文字（中級〜上級モンスター、装備、魔法、概念など）
  4: [
    "DRAGON", "KNIGHT", "CASTLE", "SHIELD", "SILVER", "FOREST", "SPIRIT", "SHADOW", "MONSTER", "CRYSTAL",
    "THUNDER", "DIAMOND", "MIRACLE", "VAMPIRE", "PHANTOM", "ULTIMATE", "WEAPON", "POTION", "SCROLL", "TEMPLE",
    "POISON", "BEETLE", "LEGEND", "HEROIC", "GALAXY", "DESERT", "ALCHEMY", "ANCIENT", "BLIZZARD", "CENTAUR",
    "CHIMERA", "COMPASS", "CYCLOPS", "DESTINY", "DUNGEON", "ECLIPSE", "ELEMENT", "EMERALD", "EMPEROR", "ENCHANT",
    "GLACIER", "GRIFFIN", "HARMONY", "ILLUSION", "INFERNO", "KINGDOM", "OBSIDIAN", "PALADIN", "SAMURAI", "WARRIOR",
    "INTERDIMENSIONAL", // 16文字（異次元の）
    "EXTRATERRESTRIAL", // 16文字（地球外生命体）
    "OMNIPOTENTIALITY", // 16文字（全能性）
    "INDISTINGUISHABLE",// 17文字（見分けがつかない）
    "ELECTROLUMINESCENCE", // 19文字（電界発光：雷魔法のトラップなどに）
  ],

  // コスト5: 9〜11文字（最上位クラス、壮大な魔法、神話の生物、領域など）
  5: [
    "ADVENTURE", "ALCHEMIST", "ARCHANGEL", "ASSASSINATE", "BARBARIAN", "BLOODHOUND", "CATACLYSM", "CELESTIAL", "COMMANDER", "CONQUEROR",
    "CORRUPTION", "DESTRUCTION", "DISCOVERY", "ELEMENTAL", "ENCHANTMENT", "EXCALIBUR", "EXECUTIONER", "EXPERIENCE", "FORBIDDEN", "GLADIATOR",
    "GRAVEYARD", "HELLHOUND", "IMMORTALITY", "INQUISITOR", "INVINCIBLE", "JUGGERNAUT", "KNOWLEDGE", "LABYRINTH", "LEVIATHAN", "LIGHTNING",
    "MAELSTROM", "MERCENARY", "METEORITE", "MOONLIGHT", "NECROMANCER", "NIGHTMARE", "OMNIPOTENT", "PENTAGRAM", "PROVIDENCE", "PURGATORY",
    "REBELLION", "RESURRECT", "REVOLUTION", "SANCTUARY", "SORCERESS", "STARLIGHT", "SUPERNOVA", "UNDERWORLD", "VENGEANCE", "YGGDRASIL",
    "BLOODTHIRSTINESS", // 16文字（残虐性、流血を好むこと）
    "CATASTROPHICALLY", // 16文字（壊滅的に、悲惨なことに）
    "UNPREDICTABILITY", // 16文字（予測不可能）
    "SUPERCALIFRAGILISTICEXPIALIDOCIOUS", // 34文字（メリー・ポピンズの魔法の言葉）
    "PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS" // 45文字（辞書に載っている最も長いとされる英単語：超微視的珪酸塩火山塵肺疾患）

  ]
};

/**
 * 指定されたコストに応じた英単語をランダムに1つ返す関数
 */
export function getRandomWord(cost: number): string {
  // 辞書にない高コストが指定された場合は、一番高いコストのリスト（今回は5）を使う
  const availableCosts = Object.keys(wordsByCost).map(Number);
  const maxCost = Math.max(...availableCosts);
  const targetCost = wordsByCost[cost] ? cost : maxCost;

  const wordList = wordsByCost[targetCost];
  const randomIndex = Math.floor(Math.random() * wordList.length);
  
  return wordList[randomIndex];
}