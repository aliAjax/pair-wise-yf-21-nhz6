import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import type { ColorCard, Drafts, RugArchive } from "./types";
import { emptyArchive, storage, today } from "./storage";
import { ArchiveList } from "./components/ArchiveList";
import { ColorLibrary } from "./components/ColorLibrary";
import { DamagePanel } from "./components/DamagePanel";
import { LogsPanel } from "./components/LogsPanel";
import { PatternBoard } from "./components/PatternBoard";
import { StepsPanel } from "./components/StepsPanel";
import { Field, Panel } from "./components/ui";

const NEW_KEY = "new";
const KNOWN_ORIGINS = ["波斯", "安纳托利亚", "高加索", "藏毯", "土耳其", "土库曼"];
const STATUSES: RugArchive["status"][] = ["待修复", "修复中", "已完工"];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function App() {
  const [archives, setArchives] = useState<RugArchive[]>(() => storage.loadArchives());
  const [cards, setCards] = useState<ColorCard[]>(() => storage.loadCards());
  const [drafts, setDrafts] = useState<Drafts>(() => storage.loadDrafts());
  const [ui, setUi] = useState(() => storage.loadUi());
  const [savedFlash, setSavedFlash] = useState(false);

  // 档案、色卡、未完成编辑、列表选择全部落盘——关掉页面再回来还在
  useEffect(() => storage.saveArchives(archives), [archives]);
  useEffect(() => storage.saveCards(cards), [cards]);
  useEffect(() => storage.saveDrafts(drafts), [drafts]);
  useEffect(() => storage.saveUi(ui), [ui]);

  const selectedId = ui.selectedId;
  const isNew = selectedId === NEW_KEY;
  const savedArchive = useMemo(
    () => (selectedId && !isNew ? archives.find((a) => a.id === selectedId) ?? null : null),
    [selectedId, isNew, archives]
  );

  // 当前正在编辑的档案：有草稿用草稿，否则从已存档案拷一份；新建用 "new" 草稿
  const draft: RugArchive | null = useMemo(() => {
    if (!selectedId) return null;
    if (isNew) return drafts[NEW_KEY] ?? null;
    return drafts[selectedId] ?? (savedArchive ? clone(savedArchive) : null);
  }, [selectedId, isNew, drafts, savedArchive]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (isNew) return true;
    return savedArchive ? JSON.stringify(draft) !== JSON.stringify(savedArchive) : false;
  }, [draft, isNew, savedArchive]);

  const origins = useMemo(() => {
    const set = new Set<string>(KNOWN_ORIGINS);
    archives.forEach((a) => a.origin && set.add(a.origin));
    return [...set];
  }, [archives]);

  function updateDraft(patch: Partial<RugArchive>) {
    if (!selectedId || !draft) return;
    const next = { ...draft, ...patch };
    setDrafts((d) => ({ ...d, [selectedId]: next }));
  }

  function selectArchive(id: string | null) {
    setUi((u) => ({ ...u, selectedId: id }));
  }

  function startNew() {
    if (!drafts[NEW_KEY]) {
      setDrafts((d) => ({ ...d, [NEW_KEY]: emptyArchive() }));
    }
    selectArchive(NEW_KEY);
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.code.trim()) {
      alert("请先填写档案编号（如 CAR-145）再保存。");
      return;
    }
    const stamped = { ...clone(draft), updatedAt: today() };
    if (isNew) {
      setArchives((list) => [...list, stamped]);
      setDrafts((d) => {
        const next = { ...d };
        delete next[NEW_KEY];
        return next;
      });
      selectArchive(stamped.id);
    } else {
      setArchives((list) => list.map((a) => (a.id === stamped.id ? stamped : a)));
      setDrafts((d) => {
        const next = { ...d };
        delete next[stamped.id];
        return next;
      });
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  }

  function discardDraft() {
    if (!selectedId) return;
    if (isNew) {
      setDrafts((d) => {
        const next = { ...d };
        delete next[NEW_KEY];
        return next;
      });
      selectArchive(null);
    } else {
      setDrafts((d) => {
        const next = { ...d };
        delete next[selectedId];
        return next;
      });
    }
  }

  // 指标
  const waiting = archives.filter((a) => a.status === "待修复").length;
  const totalCards = cards.length;
  const finishRate = archives.length
    ? Math.round((archives.filter((a) => a.status === "已完工").length / archives.length) * 100)
    : 0;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="kicker">手工地毯修复工作室 · 日常档案台</p>
          <h1>纹样与修复档案</h1>
        </div>
        <div className="topbar-actions">
          {savedFlash ? <span className="flash">已保存 ✓</span> : null}
          <button className="btn primary lg" onClick={startNew}>+ 新档案</button>
        </div>
      </header>

      <section className="metrics">
        <article><small>档案总数</small><strong>{archives.length}</strong></article>
        <article><small>待修复</small><strong>{waiting}</strong></article>
        <article><small>色卡数量</small><strong>{totalCards}</strong></article>
        <article><small>完工率</small><strong>{finishRate}%</strong></article>
      </section>

      <div className="layout">
        <ArchiveList
          archives={archives}
          origins={origins}
          filter={ui.originFilter}
          onFilter={(o) => setUi((u) => ({ ...u, originFilter: o }))}
          selectedId={selectedId}
          draftFor={(id) => !!drafts[id]}
          newDraft={drafts[NEW_KEY] ?? null}
          onSelect={selectArchive}
        />

        <div className="workspace">
          {!draft ? (
            <Panel title="工作台" desc="从左侧列表选择一份档案打开修改，或点击右上角「新档案」接毯登记。">
              <div className="placeholder">
                <div className="placeholder-mark">毯</div>
                <p>纹样局部标记、修复前后记录、补线色卡、工序进度<br />都会跟着当前选中的地毯显示。</p>
                <button className="btn primary" onClick={startNew}>登记新接的地毯</button>
              </div>
            </Panel>
          ) : (
            <>
              {dirty ? (
                <div className="dirty-banner">
                  {isNew ? "新档案尚未保存" : "有未保存的修改"}
                  <span>——内容已暂存在本机，关掉页面再回来仍可继续编辑。</span>
                </div>
              ) : null}

              <Panel
                title={isNew ? "新接地毯登记" : `档案 ${draft.code || "（未编号）"}`}
                desc="基本信息随当前地毯保存"
                actions={
                  <div className="btn-group">
                    <button className="btn" onClick={discardDraft}>
                      {isNew ? "放弃新建" : "撤销修改"}
                    </button>
                    <button className="btn primary" onClick={saveDraft}>
                      {isNew ? "保存新档案" : "保存修改"}
                    </button>
                  </div>
                }
              >
                <div className="field-grid">
                  <Field label="档案编号">
                    <input
                      className="ctrl"
                      value={draft.code}
                      placeholder="如 CAR-145"
                      onChange={(e) => updateDraft({ code: e.target.value })}
                    />
                  </Field>
                  <Field label="地毯产地">
                    <input
                      className="ctrl"
                      list="origin-list"
                      value={draft.origin}
                      onChange={(e) => updateDraft({ origin: e.target.value })}
                    />
                    <datalist id="origin-list">
                      {origins.map((o) => (
                        <option key={o} value={o} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="年代">
                    <input
                      className="ctrl"
                      value={draft.era}
                      placeholder="如 约1970s"
                      onChange={(e) => updateDraft({ era: e.target.value })}
                    />
                  </Field>
                  <Field label="结密度">
                    <input
                      className="ctrl"
                      value={draft.knotDensity}
                      placeholder="如 36 结/平方英寸"
                      onChange={(e) => updateDraft({ knotDensity: e.target.value })}
                    />
                  </Field>
                  <Field label="材质">
                    <input
                      className="ctrl"
                      value={draft.material}
                      placeholder="羊毛 / 丝 / 棉"
                      onChange={(e) => updateDraft({ material: e.target.value })}
                    />
                  </Field>
                  <Field label="染色类型">
                    <input
                      className="ctrl"
                      value={draft.dyeType}
                      placeholder="植物染 / 化学染 / 矿物染"
                      onChange={(e) => updateDraft({ dyeType: e.target.value })}
                    />
                  </Field>
                  <Field label="档案状态">
                    <select
                      className="ctrl"
                      value={draft.status}
                      onChange={(e) =>
                        updateDraft({ status: e.target.value as RugArchive["status"] })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="接毯日期">
                    <input
                      className="ctrl"
                      type="date"
                      value={draft.receivedAt}
                      onChange={(e) => updateDraft({ receivedAt: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="品相概述">
                  <textarea
                    className="ctrl area"
                    rows={2}
                    value={draft.condition}
                    placeholder="接毯时的整体品相描述"
                    onChange={(e) => updateDraft({ condition: e.target.value })}
                  />
                </Field>
              </Panel>

              <PatternBoard
                marks={draft.marks}
                onChange={(marks) => updateDraft({ marks })}
              />

              <DamagePanel
                damages={draft.damages}
                cards={cards}
                onChange={(damages) => updateDraft({ damages })}
              />

              <LogsPanel logs={draft.logs} onChange={(logs) => updateDraft({ logs })} />

              <StepsPanel steps={draft.steps} onChange={(steps) => updateDraft({ steps })} />

              <div className="save-bar">
                <button className="btn" onClick={discardDraft}>
                  {isNew ? "放弃新建" : "撤销未保存修改"}
                </button>
                <button className="btn primary lg" onClick={saveDraft}>
                  {isNew ? "保存新档案" : "保存修改"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ColorLibrary cards={cards} onChange={setCards} />

      <footer className="foot">
        数据保存在本机浏览器（localStorage）：档案、色卡与未完成编辑，刷新或关闭页面后仍在。
      </footer>
    </main>
  );
}

export default App;
