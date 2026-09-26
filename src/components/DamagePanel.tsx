import type { ColorCard, DamageArea, ThreadSnapshot } from "../types";
import { today, uid } from "../storage";
import { Field, Panel } from "./ui";

const SEVERITIES: DamageArea["severity"][] = ["轻度", "中度", "重度"];

export function DamagePanel({
  damages,
  cards,
  onChange,
}: {
  damages: DamageArea[];
  cards: ColorCard[];
  onChange: (next: DamageArea[]) => void;
}) {
  function patch(id: string, patch: Partial<DamageArea>) {
    onChange(damages.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function add() {
    onChange([
      ...damages,
      {
        id: uid("dmg"),
        location: "",
        damageType: "边缘磨损",
        severity: "中度",
        amount: 0,
        note: "",
        thread: null,
      },
    ]);
  }

  function remove(id: string) {
    onChange(damages.filter((d) => d.id !== id));
  }

  /** 选配补线：把「当次色号」复制进破损区域，此后与色卡库脱钩 */
  function pickThread(damageId: string, cardId: string) {
    if (!cardId) {
      patch(damageId, { thread: null });
      return;
    }
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const snapshot: ThreadSnapshot = {
      cardId: card.id,
      code: card.code,
      name: card.name,
      hex: card.hex,
      stockAtUse: card.stock,
      pickedAt: today(),
    };
    patch(damageId, { thread: snapshot });
  }

  return (
    <Panel
      title="破损区域与补线选配"
      desc="选定补线后会留存当次色号快照；之后色卡改名或调整余量，不影响这里的历史记录。"
      actions={<button className="btn" onClick={add}>+ 添加破损区域</button>}
    >
      {damages.length === 0 ? <p className="empty">还没有登记破损区域。</p> : null}
      <div className="damage-list">
        {damages.map((d, i) => {
          const liveCard = d.thread ? cards.find((c) => c.id === d.thread!.cardId) : undefined;
          const cardGone = !!d.thread && !liveCard;
          const changed =
            d.thread &&
            liveCard &&
            (liveCard.name !== d.thread.name || liveCard.code !== d.thread.code);
          return (
            <article className="damage-card" key={d.id}>
              <header className="damage-head">
                <b>破损 {i + 1}</b>
                <button className="btn-link danger" onClick={() => remove(d.id)}>删除</button>
              </header>
              <div className="damage-grid">
                <Field label="部位">
                  <input
                    className="ctrl"
                    value={d.location}
                    placeholder="如 左侧毯边"
                    onChange={(e) => patch(d.id, { location: e.target.value })}
                  />
                </Field>
                <Field label="损伤类型">
                  <select
                    className="ctrl"
                    value={d.damageType}
                    onChange={(e) => patch(d.id, { damageType: e.target.value })}
                  >
                    {["边缘磨损", "纹样缺口", "破洞", "褪色", "毯穗缺失", "其他"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="严重程度">
                  <select
                    className="ctrl"
                    value={d.severity}
                    onChange={(e) =>
                      patch(d.id, { severity: e.target.value as DamageArea["severity"] })
                    }
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="预计用线（克）">
                  <input
                    className="ctrl"
                    type="number"
                    min={0}
                    value={d.amount}
                    onChange={(e) => patch(d.id, { amount: Number(e.target.value) || 0 })}
                  />
                </Field>
              </div>
              <Field label="备注">
                <input
                  className="ctrl"
                  value={d.note}
                  placeholder="损伤走向、加固方式等"
                  onChange={(e) => patch(d.id, { note: e.target.value })}
                />
              </Field>

              <div className="thread-row">
                <span className="fld-label">补线色卡</span>
                <select
                  className="ctrl"
                  value={d.thread?.cardId ?? ""}
                  onChange={(e) => pickThread(d.id, e.target.value)}
                >
                  <option value="">— 暂未选配 —</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name}（余量 {c.stock}g）
                    </option>
                  ))}
                  {cardGone ? <option value={d.thread!.cardId}>原卡已删除</option> : null}
                </select>
              </div>

              {d.thread ? (
                <div className={"snapshot" + (cardGone ? " gone" : "")}>
                  <span className="swatch" style={{ background: d.thread.hex }} />
                  <div className="snapshot-main">
                    <strong>
                      {d.thread.code} · {d.thread.name}
                    </strong>
                    <small>
                      当次色号快照 · 选配于 {d.thread.pickedAt} · 当时余量 {d.thread.stockAtUse}g
                    </small>
                    {cardGone ? (
                      <small className="warn">该色卡已从色卡库删除，历史选配仍保留。</small>
                    ) : changed ? (
                      <small className="warn">
                        色卡现已更名（现：{liveCard!.code} · {liveCard!.name}），本处仍按当次记录显示。
                      </small>
                    ) : liveCard && liveCard.stock !== d.thread.stockAtUse ? (
                      <small className="muted">
                        当前色卡余量 {liveCard.stock}g，与当次记录不同，不影响此处。
                      </small>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
