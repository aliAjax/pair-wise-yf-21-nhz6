import { useState } from "react";
import { Carpet, ColorCard, DamageZone, Draft } from "../types";
import { DAMAGE_TYPES, DYE_TYPES, ORIGINS, STEP_STATUS_LABELS, uid } from "../store";
import PatternMap from "./PatternMap";

interface EditorProps {
  draft: Draft;
  cards: ColorCard[];
  dirty: boolean;
  onChange: (carpet: Carpet) => void;
  onSave: () => void;
  onDiscard: () => void;
}

/** 当前地毯的编辑台：基础信息、纹样标记、修复前后记录、工序进度 */
function Editor({ draft, cards, dirty, onChange, onSave, onDiscard }: EditorProps) {
  const carpet = draft.carpet;
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const patch = (part: Partial<Carpet>) => onChange({ ...carpet, ...part });

  const patchZone = (id: string, part: Partial<DamageZone>) =>
    patch({ zones: carpet.zones.map((z) => (z.id === id ? { ...z, ...part } : z)) });

  const addZone = (x: number, y: number) => {
    const zone: DamageZone = {
      id: uid(),
      label: `破损区域 ${carpet.zones.length + 1}`,
      x,
      y,
      damageType: DAMAGE_TYPES[0],
      note: "",
      repair: null,
    };
    patch({ zones: [...carpet.zones, zone] });
    setSelectedZoneId(zone.id);
  };

  const removeZone = (id: string) => {
    patch({ zones: carpet.zones.filter((z) => z.id !== id) });
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  /** 选用色卡时记录当次快照，之后改色卡不影响这里 */
  const pickCard = (zoneId: string, cardId: string) => {
    if (!cardId) {
      patchZone(zoneId, { repair: null });
      return;
    }
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    patchZone(zoneId, {
      repair: {
        cardId: card.id,
        cardName: card.name,
        cardCode: card.code,
        cardHex: card.hex,
        pickedAt: Date.now(),
      },
    });
  };

  const cycleStep = (index: number) => {
    const steps = carpet.steps.map((s, i) =>
      i === index ? { ...s, status: (((s.status + 1) % 3) as 0 | 1 | 2) } : s
    );
    patch({ steps });
  };

  const doneCount = carpet.steps.filter((s) => s.status === 2).length;
  const progress = carpet.steps.length ? Math.round((doneCount / carpet.steps.length) * 100) : 0;

  return (
    <section className="panel editor">
      <div className="heading">
        <div>
          <p>{draft.isNew ? "新档案（未保存）" : `档案 ${carpet.code}`}{dirty ? " · 有未保存修改" : ""}</p>
          <h2>{carpet.origin || "未填写产地"} · {carpet.era || "年代未定"}</h2>
        </div>
        <div className="heading-actions">
          <button className="primary" onClick={onSave}>保存档案</button>
          <button onClick={onDiscard}>放弃修改</button>
        </div>
      </div>

      <div className="field-grid">
        <label>
          <span>档案编号</span>
          <input value={carpet.code} onChange={(e) => patch({ code: e.target.value })} />
        </label>
        <label>
          <span>地毯产地</span>
          <select value={carpet.origin} onChange={(e) => patch({ origin: e.target.value })}>
            {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>
          <span>年代</span>
          <input value={carpet.era} placeholder="如：约1960s" onChange={(e) => patch({ era: e.target.value })} />
        </label>
        <label>
          <span>结密度</span>
          <input value={carpet.knotDensity} placeholder="如：42 结/英寸" onChange={(e) => patch({ knotDensity: e.target.value })} />
        </label>
        <label>
          <span>材质</span>
          <input value={carpet.material} placeholder="如：羊毛 / 丝毛混纺" onChange={(e) => patch({ material: e.target.value })} />
        </label>
        <label>
          <span>染色类型</span>
          <select value={carpet.dyeType} onChange={(e) => patch({ dyeType: e.target.value })}>
            {DYE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="editor-section">
        <h3>纹样局部标记</h3>
        <p className="section-hint">点击毯面添加破损标记；选中标记后在下方登记损伤与补线色卡。</p>
        <div className="pattern-layout">
          <PatternMap
            zones={carpet.zones}
            selectedId={selectedZoneId}
            onAdd={addZone}
            onSelect={setSelectedZoneId}
          />
          <div className="zone-list">
            {carpet.zones.length === 0 && <p className="empty">尚未标记破损区域</p>}
            {carpet.zones.map((zone, i) => {
              const currentCard = zone.repair ? cards.find((c) => c.id === zone.repair!.cardId) : undefined;
              const changed =
                currentCard &&
                zone.repair &&
                (currentCard.name !== zone.repair.cardName || currentCard.code !== zone.repair.cardCode);
              return (
                <article
                  key={zone.id}
                  className={`zone ${zone.id === selectedZoneId ? "selected" : ""}`}
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  <div className="zone-head">
                    <b>#{i + 1}</b>
                    <input
                      value={zone.label}
                      onChange={(e) => patchZone(zone.id, { label: e.target.value })}
                    />
                    <button className="danger" onClick={() => removeZone(zone.id)}>删除</button>
                  </div>
                  <div className="zone-grid">
                    <label>
                      <span>损伤类型</span>
                      <select
                        value={zone.damageType}
                        onChange={(e) => patchZone(zone.id, { damageType: e.target.value })}
                      >
                        {DAMAGE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>补线色卡</span>
                      <select
                        value={zone.repair?.cardId ?? ""}
                        onChange={(e) => pickCard(zone.id, e.target.value)}
                      >
                        <option value="">未选择</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} · {c.code}（余 {c.stock}）</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {zone.repair && (
                    <div className="snapshot">
                      <i style={{ background: zone.repair.cardHex }} />
                      <span>当次色号：{zone.repair.cardName} · {zone.repair.cardCode}</span>
                      <time>{new Date(zone.repair.pickedAt).toLocaleString("zh-CN")}</time>
                      {!currentCard && <em>原色卡已删除，记录保留当次快照</em>}
                      {changed && currentCard && (
                        <em>色卡现为「{currentCard.name} · {currentCard.code}」，此处历史记录不变</em>
                      )}
                    </div>
                  )}
                  <label>
                    <span>修复备注</span>
                    <input
                      value={zone.note}
                      placeholder="如：先打底再补，注意绒向"
                      onChange={(e) => patchZone(zone.id, { note: e.target.value })}
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="editor-section">
        <h3>修复前后记录</h3>
        <div className="before-after">
          <label>
            <span>修复前</span>
            <textarea
              rows={3}
              value={carpet.beforeNote}
              placeholder="接毯时的破损、色泽、气味等情况"
              onChange={(e) => patch({ beforeNote: e.target.value })}
            />
          </label>
          <label>
            <span>修复后</span>
            <textarea
              rows={3}
              value={carpet.afterNote}
              placeholder="完工后的效果与遗留事项"
              onChange={(e) => patch({ afterNote: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="editor-section">
        <h3>工序进度 <small>{doneCount}/{carpet.steps.length} 已完成 · {progress}%</small></h3>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="steps">
          {carpet.steps.map((step, i) => (
            <button
              key={step.name}
              className={`step status-${step.status}`}
              title="点击切换：未开始 → 进行中 → 已完成"
              onClick={() => cycleStep(i)}
            >
              <span>{step.name}</span>
              <em>{STEP_STATUS_LABELS[step.status]}</em>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Editor;
