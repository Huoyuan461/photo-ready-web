export type AppTab = "today" | "import" | "settings";

export type MealSlot = "早餐" | "午餐" | "晚餐" | "夜宵";

export type RestrictionId =
  | "vegetarian"
  | "vegan"
  | "glutenFree"
  | "dairyFree"
  | "nutFree";

export type CuisineId =
  | "sichuan"
  | "cantonese"
  | "japanese"
  | "italian"
  | "mexican"
  | "indian"
  | "thai"
  | "korean"
  | "american";

export type TasteId = "spicy" | "greasy" | "sweet";

export interface DishCandidate {
  id: string;
  dishName: string;
  merchantName: string;
  cuisineId: CuisineId;
  cuisineName: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  mealSlots: MealSlot[];
  estimatedPrice: string;
  estimatedEta: string;
  confidence: number;
  rating: number;
  summary: string;
  reasonTags: string[];
  palette: [string, string, string];
  accent: string;
  visual: "poke" | "pasta" | "burger" | "noodles" | "salad" | "rice";
  calories: number;
  imageLabel: string;
}

export const mealSlots: MealSlot[] = ["早餐", "午餐", "晚餐", "夜宵"];

export const dietaryOptions: Array<{
  id: RestrictionId;
  label: string;
  icon: string;
}> = [
  { id: "vegetarian", label: "素食 (Vegetarian)", icon: "🥬" },
  { id: "vegan", label: "纯素 (Vegan)", icon: "🌱" },
  { id: "glutenFree", label: "无麸质 (Gluten-Free)", icon: "🌾" },
  { id: "dairyFree", label: "无乳制品 (Dairy-Free)", icon: "🥛" },
  { id: "nutFree", label: "无坚果 (Nut-Free)", icon: "🥜" },
];

export const cuisineOptions: Array<{
  id: CuisineId;
  label: string;
}> = [
  { id: "sichuan", label: "川菜" },
  { id: "cantonese", label: "粤菜" },
  { id: "japanese", label: "日料" },
  { id: "italian", label: "意大利" },
  { id: "mexican", label: "墨西哥" },
  { id: "indian", label: "印度" },
  { id: "thai", label: "泰式" },
  { id: "korean", label: "韩式" },
  { id: "american", label: "美式" },
];

export const tasteOptions: Array<{
  id: TasteId;
  label: string;
  minLabel: string;
  maxLabel: string;
}> = [
  { id: "spicy", label: "辣度", minLabel: "微辣", maxLabel: "特辣" },
  { id: "greasy", label: "油腻", minLabel: "清淡", maxLabel: "重口" },
  { id: "sweet", label: "甜度", minLabel: "不甜", maxLabel: "很甜" },
];

export const quickMealFilters: Array<{
  id: MealSlot;
  label: string;
  icon: string;
}> = [
  { id: "早餐", label: "早餐", icon: "☀️" },
  { id: "午餐", label: "午餐", icon: "🥗" },
  { id: "晚餐", label: "晚餐", icon: "🌙" },
  { id: "夜宵", label: "夜宵", icon: "🍜" },
];

export const defaultPreferenceState = {
  restrictions: {
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    nutFree: true,
  } satisfies Record<RestrictionId, boolean>,
  cuisines: {
    sichuan: true,
    cantonese: true,
    japanese: true,
    italian: false,
    mexican: false,
    indian: false,
    thai: false,
    korean: false,
    american: false,
  } satisfies Record<CuisineId, boolean>,
  priceRange: {
    min: 25,
    max: 50,
  },
  tastes: {
    spicy: 32,
    greasy: 58,
    sweet: 72,
  } satisfies Record<TasteId, number>,
  mealSlot: "午餐" as MealSlot,
};

export const dishCandidates: DishCandidate[] = [
  {
    id: "ocean-poke",
    dishName: "Ocean Fresh Poke Bowl",
    merchantName: "Blue Ocean Bistro",
    cuisineId: "japanese",
    cuisineName: "日式轻食",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐"],
    estimatedPrice: "¥42 - ¥56",
    estimatedEta: "18-25 min",
    confidence: 96,
    rating: 4.8,
    summary: "高蛋白、清爽，和你最近的轻负担午餐偏好最接近。",
    reasonTags: ["稳妥复购", "低油", "高匹配"],
    palette: ["#0f172a", "#1d4ed8", "#f59e0b"],
    accent: "#ff642f",
    visual: "poke",
    calories: 530,
    imageLabel: "Poke Bowl",
  },
  {
    id: "truffle-pasta",
    dishName: "Creamy Truffle Pasta",
    merchantName: "North Table Kitchen",
    cuisineId: "italian",
    cuisineName: "意式融合",
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐"],
    estimatedPrice: "¥38 - ¥54",
    estimatedEta: "20-28 min",
    confidence: 88,
    rating: 4.6,
    summary: "和你的奶香、质感型口味相近，适合换一换但不跳太远。",
    reasonTags: ["相近替代", "质感浓郁", "中等预算"],
    palette: ["#1f2937", "#7c3aed", "#f97316"],
    accent: "#f97316",
    visual: "pasta",
    calories: 680,
    imageLabel: "Truffle Pasta",
  },
  {
    id: "avocado-burger",
    dishName: "Classic Avocado Burger",
    merchantName: "West Coast Grill",
    cuisineId: "american",
    cuisineName: "美式经典",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐", "夜宵"],
    estimatedPrice: "¥34 - ¥49",
    estimatedEta: "16-22 min",
    confidence: 85,
    rating: 4.5,
    summary: "适合今天想吃更饱一点的路线，重复度低，满足感高。",
    reasonTags: ["低重复探索", "饱腹", "口感丰富"],
    palette: ["#24180f", "#f59e0b", "#ef4444"],
    accent: "#ef7f43",
    visual: "burger",
    calories: 740,
    imageLabel: "Avocado Burger",
  },
  {
    id: "sichuan-noodles",
    dishName: "Chili Sesame Noodles",
    merchantName: "Spice Lane",
    cuisineId: "sichuan",
    cuisineName: "川式面食",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐", "夜宵"],
    estimatedPrice: "¥28 - ¥42",
    estimatedEta: "14-20 min",
    confidence: 92,
    rating: 4.7,
    summary: "如果今天想要更明显的香辣感，这道会比主流复购更提神。",
    reasonTags: ["口味变化", "中等辣", "高响应"],
    palette: ["#3b1d17", "#f43f5e", "#fb923c"],
    accent: "#ff572f",
    visual: "noodles",
    calories: 610,
    imageLabel: "Chili Noodles",
  },
  {
    id: "thai-salad",
    dishName: "Thai Mango Salad",
    merchantName: "Green Citrus",
    cuisineId: "thai",
    cuisineName: "泰式轻食",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐"],
    estimatedPrice: "¥31 - ¥46",
    estimatedEta: "12-18 min",
    confidence: 80,
    rating: 4.4,
    summary: "更清爽、甜酸平衡，适合控制油腻但又不想太素。",
    reasonTags: ["清爽探索", "低油", "轻甜酸"],
    palette: ["#134e4a", "#22c55e", "#f59e0b"],
    accent: "#22c55e",
    visual: "salad",
    calories: 410,
    imageLabel: "Thai Salad",
  },
  {
    id: "salmon-rice",
    dishName: "Miso Salmon Rice",
    merchantName: "Harbor Rice Bar",
    cuisineId: "japanese",
    cuisineName: "日式定食",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    mealSlots: ["午餐", "晚餐"],
    estimatedPrice: "¥45 - ¥62",
    estimatedEta: "19-26 min",
    confidence: 90,
    rating: 4.8,
    summary: "更稳的日式蛋白选择，适合重复率不高但依旧想吃舒服的日子。",
    reasonTags: ["稳妥复购", "高蛋白", "平衡口味"],
    palette: ["#0f172a", "#14b8a6", "#f97316"],
    accent: "#f97316",
    visual: "rice",
    calories: 560,
    imageLabel: "Salmon Rice",
  },
];

export const supportPlatforms = ["美团外卖", "饿了么", "截图导入", "通知解析"];

export const settingsSections = {
  account: [
    { label: "账户与安全", value: "" },
    { label: "支付方式", value: "" },
    { label: "收货地址", value: "" },
  ],
  preferences: [
    { label: "通知设置", value: "" },
    { label: "深色模式", value: "" },
    { label: "语言", value: "简体中文" },
  ],
  data: [
    { label: "用餐统计", value: "" },
    { label: "成就徽章", value: "" },
    { label: "AI推荐准确率", value: "87%" },
  ],
  help: [
    { label: "帮助中心", value: "" },
    { label: "反馈建议", value: "" },
    { label: "评分应用", value: "" },
  ],
  about: [
    { label: "关于 MealMind", value: "" },
    { label: "隐私政策", value: "" },
    { label: "用户协议", value: "" },
  ],
};

export function createDailyDigest(date: Date) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    weekday: weekdays[date.getDay()],
    month: monthNames[date.getMonth()],
    day: date.getDate(),
    year: date.getFullYear(),
  };
}
