import type { ColorCard, RugArchive } from "./types";

const ARCHIVE_KEY = "rug-archive:archives:v1";
const CARD_KEY = "rug-archive:cards:v1";
const DRAFT_KEY = "rug-archive:drafts:v1";
const UI_KEY = "rug-archive:ui:v1";

export interface UiState {
  selectedId: string | null;
  originFilter: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  loadArchives: () => read<RugArchive[]>(ARCHIVE_KEY, seedArchives()),
  saveArchives: (v: RugArchive[]) => write(ARCHIVE_KEY, v),
  loadCards: () => read<ColorCard[]>(CARD_KEY, seedCards()),
  saveCards: (v: ColorCard[]) => write(CARD_KEY, v),
  loadDrafts: () => read<Record<string, RugArchive>>(DRAFT_KEY, {}),
  saveDrafts: (v: Record<string, RugArchive>) => write(DRAFT_KEY, v),
  loadUi: () => read<UiState>(UI_KEY, { selectedId: null, originFilter: "全部" }),
  saveUi: (v: UiState) => write(UI_KEY, v),
};

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 空白新档案（同时是「新建中」草稿的初始值） */
export function emptyArchive(): RugArchive {
  return {
    id: uid("rug"),
    code: "",
    origin: "波斯",
    era: "",
    knotDensity: "",
    material: "羊毛",
    dyeType: "植物染",
    condition: "",
    status: "待修复",
    receivedAt: today(),
    updatedAt: today(),
    damages: [],
    marks: [],
    logs: [],
    steps: defaultSteps(),
  };
}

export function defaultSteps() {
  return [
    { id: uid("stp"), name: "清洗除尘", status: "pending", note: "" },
    { id: uid("stp"), name: "纹样核对与配色", status: "pending", note: "" },
    { id: uid("stp"), name: "补线织造", status: "pending", note: "" },
    { id: uid("stp"), name: "毯边修整", status: "pending", note: "" },
    { id: uid("stp"), name: "复检归档", status: "pending", note: "" },
  ] as RugArchive["steps"];
}

/** 默认工序之外，师傅可自行加项 */

function seedCards(): ColorCard[] {
  return [
    { id: "card-ind03", code: "IND-03", name: "藏地靛蓝", hex: "#27408b", stock: 320 },
    { id: "card-mad07", code: "MAD-07", name: "茜草绯红", hex: "#a4303f", stock: 210 },
    { id: "card-saf12", code: "SAF-12", name: "藏红花黄", hex: "#d99a20", stock: 180 },
    { id: "card-wal05", code: "WAL-05", name: "核桃茶棕", hex: "#7c4a23", stock: 260 },
    { id: "card-ivy09", code: "IVY-09", name: "常青藤绿", hex: "#3f6b3a", stock: 150 },
    { id: "card-ivory", code: "IVO-01", name: "本白羊毛", hex: "#efe7d2", stock: 480 },
  ];
}

function seedArchives(): RugArchive[] {
  const now = today();
  return [
    {
      id: "rug-092",
      code: "CAR-092",
      origin: "波斯",
      era: "约1960s",
      knotDensity: "36 结/平方英寸",
      material: "羊毛",
      dyeType: "植物染",
      condition: "左侧毯边磨损，边穗缺失约 12cm",
      status: "修复中",
      receivedAt: "2026-09-12",
      updatedAt: now,
      damages: [
        {
          id: "dmg-092-1",
          location: "左侧毯边",
          damageType: "边缘磨损",
          severity: "中度",
          amount: 40,
          note: "磨损沿边连续，需先加固基布。",
          thread: {
            cardId: "card-wal05",
            code: "WAL-05",
            name: "核桃茶棕",
            hex: "#7c4a23",
            stockAtUse: 280,
            pickedAt: "2026-09-13",
          },
        },
      ],
      marks: [
        { id: "mk-092-1", x: 18, y: 50, label: "藤蔓边饰", note: "磨损段，补线走向顺藤蔓。" },
        { id: "mk-092-2", x: 52, y: 46, label: "中心葵纹", note: "完好，作为配色参照。" },
      ],
      logs: [
        {
          id: "log-092-1",
          phase: "before",
          date: "2026-09-12",
          title: "接毯登记",
          detail: "左侧毯边磨损起毛，边穗缺 12cm，中心纹样完好。",
        },
        {
          id: "log-092-2",
          phase: "during",
          date: "2026-09-15",
          title: "基布加固",
          detail: "磨损段背面加衬亚麻基布，已完成 6cm。",
        },
      ],
      steps: [
        { id: "stp-092-1", name: "清洗除尘", status: "done", note: "2026-09-12 完成" },
        { id: "stp-092-2", name: "纹样核对与配色", status: "done", note: "配 WAL-05" },
        { id: "stp-092-3", name: "补线织造", status: "doing", note: "进行中 6/12cm" },
        { id: "stp-092-4", name: "毯边修整", status: "pending", note: "" },
        { id: "stp-092-5", name: "复检归档", status: "pending", note: "" },
      ],
    },
    {
      id: "rug-117",
      code: "CAR-117",
      origin: "安纳托利亚",
      era: "约1980s",
      knotDensity: "42 结/平方英寸",
      material: "羊毛",
      dyeType: "植物染",
      condition: "中心纹样有一处缺口，约 3cm",
      status: "待修复",
      receivedAt: "2026-09-20",
      updatedAt: now,
      damages: [
        {
          id: "dmg-117-1",
          location: "中心纹样右下",
          damageType: "纹样缺口",
          severity: "轻度",
          amount: 12,
          note: "缺口边缘整齐，疑为虫蛀。",
          thread: null,
        },
      ],
      marks: [
        { id: "mk-117-1", x: 62, y: 58, label: "缺口处", note: "双角纹交汇处，缺 3cm。" },
      ],
      logs: [
        {
          id: "log-117-1",
          phase: "before",
          date: "2026-09-20",
          title: "接毯登记",
          detail: "中心双角纹交汇缺口，其余品相良好。",
        },
      ],
      steps: defaultStepsFor("117"),
    },
    {
      id: "rug-138",
      code: "CAR-138",
      origin: "藏毯",
      era: "年代不详",
      knotDensity: "30 结/平方英寸",
      material: "羊毛",
      dyeType: "天然矿物染",
      condition: "上部局部褪色，需匹配靛蓝色线",
      status: "待修复",
      receivedAt: "2026-09-23",
      updatedAt: now,
      damages: [
        {
          id: "dmg-138-1",
          location: "上部蓝色地纹",
          damageType: "褪色",
          severity: "中度",
          amount: 25,
          note: "日晒褪色，与下方原色过渡需渐变处理。",
          thread: null,
        },
      ],
      marks: [
        { id: "mk-138-1", x: 50, y: 22, label: "褪色区", note: "上沿褪色明显。" },
        { id: "mk-138-2", x: 50, y: 70, label: "原色参照", note: "取此处比对靛蓝。" },
      ],
      logs: [
        {
          id: "log-138-1",
          phase: "before",
          date: "2026-09-23",
          title: "接毯登记",
          detail: "上部蓝地褪色，待配色后定修复方案。",
        },
      ],
      steps: defaultStepsFor("138"),
    },
  ];
}

function defaultStepsFor(suffix: string): RugArchive["steps"] {
  return [
    { id: `stp-${suffix}-1`, name: "清洗除尘", status: "pending", note: "" },
    { id: `stp-${suffix}-2`, name: "纹样核对与配色", status: "pending", note: "" },
    { id: `stp-${suffix}-3`, name: "补线织造", status: "pending", note: "" },
    { id: `stp-${suffix}-4`, name: "毯边修整", status: "pending", note: "" },
    { id: `stp-${suffix}-5`, name: "复检归档", status: "pending", note: "" },
  ];
}
