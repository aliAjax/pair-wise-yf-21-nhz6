import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { Carpet, ColorCard, Draft } from "./types";
import {
  defaultSteps,
  loadState,
  saveState,
  seedCards,
  seedCarpets,
  storageKeys,
  uid,
  ORIGINS,
} from "./store";
import Editor from "./components/Editor";
import CardPanel from "./components/CardPanel";

function nextCode(carpets: Carpet[]): string {
  const max = carpets.reduce((acc, c) => {
    const m = c.code.match(/(\d+)/);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `CAR-${String(max + 1).padStart(3, "0")}`;
}

function newCarpet(carpets: Carpet[]): Carpet {
  return {
    id: uid(),
    code: nextCode(carpets),
    origin: ORIGINS[0],
    era: "",
    knotDensity: "",
    material: "羊毛",
    dyeType: "植物染",
    zones: [],
    steps: defaultSteps(),
    beforeNote: "",
    afterNote: "",
    updatedAt: Date.now(),
  };
}

function App() {
  const [carpets, setCarpets] = useState<Carpet[]>(() =>
    loadState(storageKeys.KEY_CARPETS, seedCarpets)
  );
  const [cards, setCards] = useState<ColorCard[]>(() =>
    loadState(storageKeys.KEY_CARDS, seedCards)
  );
  const [draft, setDraft] = useState<Draft | null>(() =>
    loadState<Draft | null>(storageKeys.KEY_DRAFT, null)
  );
  const [originFilter, setOriginFilter] = useState("全部");

  // 关掉页面再回来，档案、色卡和未完成编辑都还在
  useEffect(() => saveState(storageKeys.KEY_CARPETS, carpets), [carpets]);
  useEffect(() => saveState(storageKeys.KEY_CARDS, cards), [cards]);
  useEffect(() => saveState(storageKeys.KEY_DRAFT, draft), [draft]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (draft.isNew) return true;
    const saved = carpets.find((c) => c.id === draft.carpet.id);
    return !saved || JSON.stringify(saved) !== JSON.stringify(draft.carpet);
  }, [draft, carpets]);

  const confirmLoseDraft = () =>
    !dirty || window.confirm("当前档案有未保存的修改，切换后将丢弃，是否继续？");

  const openCarpet = (carpet: Carpet) => {
    if (draft?.carpet.id === carpet.id) return;
    if (!confirmLoseDraft()) return;
    setDraft({ carpet: JSON.parse(JSON.stringify(carpet)) as Carpet, isNew: false });
  };

  const createCarpet = () => {
    if (!confirmLoseDraft()) return;
    setDraft({ carpet: newCarpet(carpets), isNew: true });
  };

  const saveDraft = () => {
    if (!draft) return;
    const saved: Carpet = { ...draft.carpet, updatedAt: Date.now() };
    setCarpets((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setDraft({ carpet: saved, isNew: false });
  };

  const discardDraft = () => {
    if (!dirty || window.confirm("确定放弃当前未保存的修改？")) setDraft(null);
  };

  const removeCarpet = (id: string) => {
    if (!window.confirm("确定删除这份档案？此操作不可恢复。")) return;
    setCarpets((prev) => prev.filter((c) => c.id !== id));
    if (draft?.carpet.id === id) setDraft(null);
  };

  const filtered = useMemo(
    () =>
      carpets
        .filter((c) => originFilter === "全部" || c.origin === originFilter)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [carpets, originFilter]
  );

  const pending = carpets.filter((c) => c.steps.some((s) => s.status !== 2)).length;
  const rate = carpets.length
    ? Math.round(
        (carpets.reduce(
          (acc, c) => acc + c.steps.filter((s) => s.status === 2).length / (c.steps.length || 1),
          0
        ) /
          carpets.length) *
          100
      )
    : 0;

  const metrics: Array<[string, string | number]> = [
    ["纹样档案", carpets.length],
    ["待修复", pending],
    ["色卡数量", cards.length],
    ["完工率", `${rate}%`],
  ];

  return (
    <main className="app">
      <section className="hero">
        <p>hxyfront-62009 · 手工地毯修复工作室</p>
        <h1>地毯修复纹样档案台</h1>
        <span>
          接毯后在此建档：登记产地、年代、结密度、材质与染色类型，在纹样图上标记破损区域并选用补线色卡，
          记录修复前后情况、推进工序进度。所有内容保存在本机，关掉页面再回来也不会丢。
        </span>
      </section>

      <section className="metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <aside className="panel archive-panel">
          <div className="heading">
            <div>
              <p>按产地筛选</p>
              <h2>档案列表</h2>
            </div>
            <button className="primary" onClick={createCarpet}>新建档案</button>
          </div>
          <div className="chips">
            {["全部", ...ORIGINS].map((o) => (
              <button
                key={o}
                className={originFilter === o ? "active" : ""}
                onClick={() => setOriginFilter(o)}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="archive-list">
            {filtered.length === 0 && <p className="empty">该产地暂无档案</p>}
            {filtered.map((c) => {
              const done = c.steps.filter((s) => s.status === 2).length;
              const active = draft?.carpet.id === c.id;
              return (
                <article
                  key={c.id}
                  className={active ? "active" : ""}
                  onClick={() => openCarpet(c)}
                >
                  <div className="archive-main">
                    <h3>{c.code} · {c.origin}</h3>
                    <p>
                      {c.era || "年代未定"} · {c.zones.length} 处破损 · 工序 {done}/{c.steps.length}
                    </p>
                  </div>
                  <button
                    className="danger"
                    title="删除档案"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCarpet(c.id);
                    }}
                  >
                    删
                  </button>
                </article>
              );
            })}
          </div>
        </aside>

        {draft ? (
          <Editor
            draft={draft}
            cards={cards}
            dirty={dirty}
            onChange={(carpet) => setDraft({ ...draft, carpet })}
            onSave={saveDraft}
            onDiscard={discardDraft}
          />
        ) : (
          <section className="panel editor-placeholder">
            <h2>未打开档案</h2>
            <p>从左侧列表选择一份档案开始修改，或点击「新建档案」接一条新毯。</p>
            <p className="section-hint">未保存的编辑会作为草稿保留，刷新或关闭页面后回来仍在。</p>
          </section>
        )}
      </section>

      <CardPanel cards={cards} onChange={setCards} />
    </main>
  );
}

export default App;
