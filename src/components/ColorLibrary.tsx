import { useState } from "react";
import type { ColorCard } from "../types";
import { uid } from "../storage";
import { Panel } from "./ui";

/**
 * 材料色卡库：全工作室共享。
 * 注意：这里改名 / 改余量只影响色卡本身；破损区域里已选定的是当次快照，不会被回改。
 */
export function ColorLibrary({
  cards,
  onChange,
}: {
  cards: ColorCard[];
  onChange: (next: ColorCard[]) => void;
}) {
  const [open, setOpen] = useState(true);

  function patch(id: string, p: Partial<ColorCard>) {
    onChange(cards.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }

  function add() {
    onChange([
      ...cards,
      { id: uid("card"), code: "", name: "新色线", hex: "#8c8c8c", stock: 0 },
    ]);
  }

  function remove(id: string) {
    onChange(cards.filter((c) => c.id !== id));
  }

  return (
    <Panel
      title="材料色卡库"
      desc="维护工作室色线的色号、名称与余量。改名或余量不影响已保存到破损区域的当次色号。"
      actions={
        <div className="btn-group">
          <button className="btn" onClick={() => setOpen((v) => !v)}>
            {open ? "收起" : "展开"}
          </button>
          <button className="btn primary" onClick={add}>+ 新增色卡</button>
        </div>
      }
    >
      {open ? (
        <div className="card-grid">
          {cards.map((c) => (
            <article className="color-card" key={c.id}>
              <label className="color-swatch-edit">
                <span className="swatch big" style={{ background: c.hex }} />
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => patch(c.id, { hex: e.target.value })}
                  title="点击改颜色"
                />
              </label>
              <div className="color-fields">
                <input
                  className="ctrl"
                  value={c.code}
                  placeholder="色号，如 IND-03"
                  onChange={(e) => patch(c.id, { code: e.target.value })}
                />
                <input
                  className="ctrl"
                  value={c.name}
                  placeholder="色名"
                  onChange={(e) => patch(c.id, { name: e.target.value })}
                />
                <label className="stock-line">
                  余量
                  <input
                    className="ctrl"
                    type="number"
                    min={0}
                    value={c.stock}
                    onChange={(e) => patch(c.id, { stock: Number(e.target.value) || 0 })}
                  />
                  克
                </label>
                <button className="btn-link danger" onClick={() => remove(c.id)}>
                  删除色卡
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card-strip">
          {cards.map((c) => (
            <span className="strip-chip" key={c.id} title={`${c.code} · ${c.name} · ${c.stock}g`}>
              <i style={{ background: c.hex }} />
              {c.code}
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}
