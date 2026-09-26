export interface ColorCard {
  id: string;
  name: string; // 色卡名称
  code: string; // 色号
  hex: string; // 颜色
  stock: number; // 余量（绞）
}

/** 破损区域选用色卡时的历史快照：之后改色卡名称/余量都不会影响它 */
export interface RepairSnapshot {
  cardId: string;
  cardName: string;
  cardCode: string;
  cardHex: string;
  pickedAt: number;
}

export interface DamageZone {
  id: string;
  label: string;
  x: number; // 纹样图上的横向百分比 0-100
  y: number; // 纹样图上的纵向百分比 0-100
  damageType: string;
  note: string;
  repair: RepairSnapshot | null;
}

export type StepStatus = 0 | 1 | 2; // 未开始 / 进行中 / 已完成

export interface ProcessStep {
  name: string;
  status: StepStatus;
}

export interface Carpet {
  id: string;
  code: string; // 档案编号
  origin: string; // 产地
  era: string; // 年代
  knotDensity: string; // 结密度
  material: string; // 材质
  dyeType: string; // 染色类型
  zones: DamageZone[];
  steps: ProcessStep[];
  beforeNote: string; // 修复前记录
  afterNote: string; // 修复后记录
  updatedAt: number;
}

/** 编辑器里的草稿（含未保存的修改），刷新/关闭页面后仍在 */
export interface Draft {
  carpet: Carpet;
  isNew: boolean;
}
