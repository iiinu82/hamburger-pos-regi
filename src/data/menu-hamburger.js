// ハンバーガーショップのメニューデータ（初期データ）

// ハンバーガー共通オプション
const commonBurgerOptionsS = [
  {
    groupId: "patty",
    groupName: "パティ",
    type: "single",
    choices: [
      { label: "通常", price: 0 },
      { label: "倍", price: 100 },
    ],
  },
];
const commonBurgerOptionsL = [
  {
    groupId: "patty",
    groupName: "パティ",
    type: "single",
    choices: [
      { label: "通常", price: 0 },
      { label: "倍", price: 200 },
    ],
  },
];

// ナゲットのソース
const nuggetSauceOptions = [
  {
    groupId: "nugget_sauce",
    groupName: "ソース",
    type: "multiple",
    choices: [
      { label: "バーベキュー", price: 0 },
      { label: "マスタード", price: 0 },
      { label: "チリソース", price: 0 },
    ],
  },
];

// ドリンクのサイズ
const drinkSizeOptions = [
  {
    groupId: "drink_size",
    groupName: "サイズ",
    type: "single",
    choices: [
      { label: "S", price: 0 },
      { label: "M", price: 50 },
      { label: "L", price: 100 },
    ],
  },
];

// コーヒーのオプション
const coffeeOptions = [
  {
    groupId: "coffee_additions",
    groupName: "砂糖・ミルク",
    type: "multiple",
    choices: [
      { label: "砂糖", price: 0 },
      { label: "ガムシロップ", price: 0 },
      { label: "ミルク", price: 0 },
    ],
  },
];

export const initialMenus = [
  // --- ハンバーガー ---
  {
    id: "hamburger",
    name: "ハンバーガー",
    buttonLabel: "ハン",
    price: 190,
    category: "burger",
    options: commonBurgerOptionsS,
  },
  {
    id: "cheeseburger",
    name: "チーズバーガー",
    buttonLabel: "チー",
    price: 220,
    category: "burger",
    options: commonBurgerOptionsS,
  },
  {
    id: "teriyaki_burger",
    name: "テリヤキバーガー",
    buttonLabel: "テリ",
    price: 350,
    category: "burger",
    options: commonBurgerOptionsS,
  },
  {
    id: "fish_burger",
    name: "フィッシュバーガー",
    buttonLabel: "フィ",
    price: 370,
    category: "burger",
    options: commonBurgerOptionsS,
  },
  {
    id: "chicken_burger",
    name: "チキンバーガー",
    buttonLabel: "チキ",
    price: 460,
    category: "burger",
    options: commonBurgerOptionsS,
  },
  {
    id: "double_hamburger",
    name: "ダブルハンバーガー",
    buttonLabel: "Wハ",
    price: 350,
    category: "burger",
    options: commonBurgerOptionsL,
  },
  {
    id: "double_cheese_hamburger",
    name: "ダブルチーズバーガー",
    buttonLabel: "Wチ",
    price: 400,
    category: "burger",
    options: commonBurgerOptionsL,
  },
  {
    id: "big_hamburger",
    name: "ビッグバーガー",
    buttonLabel: "B",
    price: 500,
    category: "burger",
    options: commonBurgerOptionsL,
  },

  // --- ポテト ---
  {
    id: "potato_s",
    name: "ポテト S",
    buttonLabel: "ポS",
    price: 220,
    category: "side",
    options: [],
  },
  {
    id: "potato_m",
    name: "ポテト M",
    buttonLabel: "ポM",
    price: 350,
    category: "side",
    options: [],
  },
  {
    id: "potato_l",
    name: "ポテト L",
    buttonLabel: "ポL",
    price: 400,
    category: "side",
    options: [],
  },

  // --- ナゲット ---
  {
    id: "nuggets",
    name: "チキンナゲット",
    buttonLabel: "ナゲ",
    price: 300,
    category: "side",
    options: [
      {
        groupId: "nugget_count",
        groupName: "個数",
        type: "single",
        choices: [
          { label: "5個", price: 0 },
          { label: "8個", price: 150 },
          { label: "15個", price: 400 },
        ],
      },
      ...nuggetSauceOptions,
    ],
  },

  // --- ドリンク ---
  {
    id: "cola",
    name: "コーラ",
    buttonLabel: "コー",
    price: 150,
    category: "drink",
    options: drinkSizeOptions,
  },
  {
    id: "fanta",
    name: "ファンタ",
    buttonLabel: "ファ",
    price: 150,
    category: "drink",
    options: drinkSizeOptions,
  },
  {
    id: "orange_juice",
    name: "オレンジジュース",
    buttonLabel: "オレ",
    price: 180,
    category: "drink",
    options: drinkSizeOptions,
  },
  {
    id: "tya",
    name: "爽健美茶",
    buttonLabel: "爽健",
    price: 180,
    category: "drink",
    options: drinkSizeOptions,
  },
  {
    id: "kuro-tya",
    name: "黒烏龍茶",
    buttonLabel: "黒烏",
    price: 340,
    category: "drink",
    options: [],
  },
  {
    id: "coffee_hot",
    name: "ホットコーヒー",
    buttonLabel: "Hコ",
    price: 150,
    category: "drink",
    options: [...coffeeOptions, ...drinkSizeOptions],
  },
  {
    id: "coffee_ice",
    name: "アイスコーヒー",
    buttonLabel: "Iコ",
    price: 150,
    category: "drink",
    options: [...coffeeOptions, ...drinkSizeOptions],
  },
  {
    id: "milk",
    name: "牛乳",
    buttonLabel: "牛乳",
    price: 180,
    category: "drink",
    options: [],
  },
];
