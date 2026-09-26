import { Carpet, ColorCard, ProcessStep } from "./types";

export const ORIGINS = ["波斯", "安纳托利亚", "高加索", "藏毯"];

export const DYE_TYPES = ["植物染", "矿物染", "化学染", "混合染"];

export const DAMAGE_TYPES = ["磨损", "破洞", "褪色", "虫蛀", "穗边脱落", "污渍"];

export const STEP_NAMES = ["登记检查", "清洗除尘", "补线织补", "染色配色", "整形定型", "质检入库"];

export const STEP_STATUS_LABELS = ["未开始", "进行中", "已完成"];

export function uid(): string {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultSteps(): ProcessStep[] {
  return STEP_NAMES.map((name) => ({ name, status: 0 as const }));
}

const KEY_CARPETS = "carpetDesk.carpets.v1";
const KEY_CARDS = "carpetDesk.cards.v1";
const KEY_DRAFT = "carpetDesk.draft.v1";

export const storageKeys = { KEY_CARPETS, KEY_CARDS, KEY_DRAFT };

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState(key: string, value: unknown): void {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // 存储不可用时静默失败，不影响页面使用
  }
}

export const seedCards: ColorCard[] = [
  { id: "card-indigo", name: "靛蓝补线", code: "IND-04", hex: "#1e3a8a", stock: 12 },
  { id: "card-madder", name: "茜草红", code: "MAD-07", hex: "#b45309", stock: 8 },
  { id: "card-wool", name: "羊毛本白", code: "WL-00", hex: "#e8e0cf", stock: 20 },
  { id: "card-walnut", name: "核桃茶褐", code: "WLN-2", hex: "#6b4f2a", stock: 5 },
  { id: "card-teal", name: "松石绿", code: "TQS-5", hex: "#0f766e", stock: 9 },
];

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const seedCarpets: Carpet[] = [
  {
    id: "carpet-092",
    code: "CAR-092",
    origin: "波斯",
    era: "约1960s",
    knotDensity: "42 结/英寸",
    material: "羊毛",
    dyeType: "植物染",
    zones: [
      {
        id: "zone-092-1",
        label: "下边缘磨损",
        x: 50,
        y: 88,
        damageType: "磨损",
        note: "边缘绒头磨平，需沿纹补线",
        repair: {
          cardId: "card-madder",
          cardName: "茜草红",
          cardCode: "MAD-07",
          cardHex: "#b45309",
          pickedAt: now - 6 * day,
        },
      },
    ],
    steps: [
      { name: "登记检查", status: 2 },
      { name: "清洗除尘", status: 2 },
      { name: "补线织补", status: 1 },
      { name: "染色配色", status: 0 },
      { name: "整形定型", status: 0 },
      { name: "质检入库", status: 0 },
    ],
    beforeNote: "毯面下边缘磨损明显，流苏松动，整体色泽尚可。",
    afterNote: "",
    updatedAt: now - 2 * day,
  },
  {
    id: "carpet-117",
    code: "CAR-117",
    origin: "安纳托利亚",
    era: "约1950s",
    knotDensity: "42 结/英寸",
    material: "羊毛",
    dyeType: "植物染",
    zones: [
      {
        id: "zone-117-1",
        label: "中心纹样缺口",
        x: 50,
        y: 50,
        damageType: "破洞",
        note: "奖章纹中心破洞约 3cm，先打底再补",
        repair: {
          cardId: "card-indigo",
          cardName: "靛蓝补线",
          cardCode: "IND-04",
          cardHex: "#1e3a8a",
          pickedAt: now - 3 * day,
        },
      },
      {
        id: "zone-117-2",
        label: "左上角虫蛀",
        x: 22,
        y: 18,
        damageType: "虫蛀",
        note: "",
        repair: null,
      },
    ],
    steps: [
      { name: "登记检查", status: 2 },
      { name: "清洗除尘", status: 1 },
      { name: "补线织补", status: 0 },
      { name: "染色配色", status: 0 },
      { name: "整形定型", status: 0 },
      { name: "质检入库", status: 0 },
    ],
    beforeNote: "中心奖章纹破洞，左上角有虫蛀点，需先除虫处理。",
    afterNote: "",
    updatedAt: now - day,
  },
  {
    id: "carpet-138",
    code: "CAR-138",
    origin: "藏毯",
    era: "约1970s",
    knotDensity: "36 结/英寸",
    material: "羊毛",
    dyeType: "矿物染",
    zones: [
      {
        id: "zone-138-1",
        label: "右侧局部褪色",
        x: 78,
        y: 42,
        damageType: "褪色",
        note: "需匹配靛蓝色卡做局部回染",
        repair: {
          cardId: "card-indigo",
          cardName: "靛蓝补线",
          cardCode: "IND-04",
          cardHex: "#1e3a8a",
          pickedAt: now - day,
        },
      },
    ],
    steps: [
      { name: "登记检查", status: 2 },
      { name: "清洗除尘", status: 2 },
      { name: "补线织补", status: 2 },
      { name: "染色配色", status: 2 },
      { name: "整形定型", status: 2 },
      { name: "质检入库", status: 2 },
    ],
    beforeNote: "右侧条状褪色，与周围色差明显。",
    afterNote: "局部回染后色差已不明显，自然光下过渡自然。",
    updatedAt: now - 4 * day,
  },
];
