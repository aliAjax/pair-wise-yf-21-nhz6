import { ColorCard } from "../types";
import { uid } from "../store";

interface CardPanelProps {
  cards: ColorCard[];
  onChange: (cards: ColorCard[]) => void;
}

/** 材料色卡：名称、色号、余量可随时改；已选进破损区域的当次色号以快照保留，不受此处修改影响 */
function CardPanel({ cards, onChange }: CardPanelProps) {
  const patch = (id: string, part: Partial<ColorCard>) =>
    onChange(cards.map((c) => (c.id === id ? { ...c, ...part } : c)));

  const addCard = () =>
    onChange([
      ...cards,
      { id: uid(), name: "新色卡", code: `NEW-${cards.length + 1}`, hex: "#7c2d12", stock: 1 },
    ]);

  const removeCard = (id: string) => {
    if (!window.confirm("删除色卡后，已选用它的历史记录仍保留当次色号快照。确认删除？")) return;
    onChange(cards.filter((c) => c.id !== id));
  };

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>材料色卡</p>
          <h2>补线色卡库存</h2>
        </div>
        <button className="primary" onClick={addCard}>新增色卡</button>
      </div>
      <p className="section-hint">
        修改名称或余量只影响后续选用；破损区域里已登记的当次色号以快照保存，不会被改掉。
      </p>
      <div className="card-grid">
        {cards.map((card) => (
          <article key={card.id} className="color-card">
            <div className="swatch-row">
              <input
                type="color"
                value={card.hex}
                aria-label="色卡颜色"
                onChange={(e) => patch(card.id, { hex: e.target.value })}
              />
              <button className="danger" onClick={() => removeCard(card.id)}>删除</button>
            </div>
            <label>
              <span>名称</span>
              <input value={card.name} onChange={(e) => patch(card.id, { name: e.target.value })} />
            </label>
            <div className="card-row">
              <label>
                <span>色号</span>
                <input value={card.code} onChange={(e) => patch(card.id, { code: e.target.value })} />
              </label>
              <label>
                <span>余量（绞）</span>
                <input
                  type="number"
                  min={0}
                  value={card.stock}
                  onChange={(e) => patch(card.id, { stock: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CardPanel;
