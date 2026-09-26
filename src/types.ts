// 手工地毯修复档案台的数据模型

/** 工序进度状态 */
export type StepStatus = "pending" | "doing" | "done";

/** 材料色卡（工作室共享的线材库） */
export interface ColorCard {
  id: string;
  /** 色号，如 IND-03 */
  code: string;
  /** 色名，如 藏地靛蓝 */
  name: string;
  hex: string;
  /** 余量（单位：克） */
  stock: number;
}

/**
 * 选色时写入破损区域的「当次色号快照」。
 * 这是历史记录：此后色卡改名、调整余量，均不回写快照。
 */
export interface ThreadSnapshot {
  cardId: string;
  code: string;
  name: string;
  hex: string;
  /** 选配时的余量，留档用 */
  stockAtUse: number;
  pickedAt: string;
}

/** 破损区域 + 补线选配 */
export interface DamageArea {
  id: string;
  /** 部位，如 左侧毯边 */
  location: string;
  /** 损伤类型，如 边缘磨损 / 纹样缺口 / 褪色 */
  damageType: string;
  severity: "轻度" | "中度" | "重度";
  /** 用线量（克） */
  amount: number;
  note: string;
  /** 已选配的补线快照；未选配时为 null */
  thread: ThreadSnapshot | null;
}

/** 纹样局部标记（在纹样板上打点） */
export interface PatternMark {
  id: string;
  /** 相对纹样板的百分比坐标 0~100 */
  x: number;
  y: number;
  /** 标记的纹样名称，如 中心葵纹 / 藤蔓纹 */
  label: string;
  note: string;
}

/** 修复前后记录 */
export interface RepairLog {
  id: string;
  /** 记录类型：修复前 / 修复中 / 修复后 */
  phase: "before" | "during" | "after";
  date: string;
  title: string;
  detail: string;
}

/** 工序进度条目 */
export interface ProcessStep {
  id: string;
  name: string;
  status: StepStatus;
  note: string;
}

/** 一份地毯档案 */
export interface RugArchive {
  id: string;
  /** 档案编号，如 CAR-092 */
  code: string;
  origin: string;
  era: string;
  knotDensity: string;
  material: string;
  dyeType: string;
  condition: string;
  status: "待修复" | "修复中" | "已完工";
  receivedAt: string;
  updatedAt: string;
  damages: DamageArea[];
  marks: PatternMark[];
  logs: RepairLog[];
  steps: ProcessStep[];
}

/** 未保存的编辑草稿：按档案 id 存放，新建中的固定用 "new" */
export type Drafts = Record<string, RugArchive>;
