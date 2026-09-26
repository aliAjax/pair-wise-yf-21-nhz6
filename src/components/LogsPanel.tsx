import type { RepairLog } from "../types";
import { today, uid } from "../storage";
import { Panel } from "./ui";

const PHASES: { value: RepairLog["phase"]; label: string }[] = [
  { value: "before", label: "修复前" },
  { value: "during", label: "修复中" },
  { value: "after", label: "修复后" },
];

export function LogsPanel({
  logs,
  onChange,
}: {
  logs: RepairLog[];
  onChange: (next: RepairLog[]) => void;
}) {
  function patch(id: string, p: Partial<RepairLog>) {
    onChange(logs.map((l) => (l.id === id ? { ...l, ...p } : l)));
  }

  function add(phase: RepairLog["phase"]) {
    onChange([
      ...logs,
      { id: uid("log"), phase, date: today(), title: "", detail: "" },
    ]);
  }

  function remove(id: string) {
    onChange(logs.filter((l) => l.id !== id));
  }

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const before = sorted.filter((l) => l.phase === "before");
  const during = sorted.filter((l) => l.phase === "during");
  const after = sorted.filter((l) => l.phase === "after");

  return (
    <Panel
      title="修复前后记录"
      desc="按时间记录修复前、修复中、修复后的状态与处置。"
      actions={
        <div className="btn-group">
          <button className="btn" onClick={() => add("before")}>+ 修复前</button>
          <button className="btn" onClick={() => add("during")}>+ 修复中</button>
          <button className="btn" onClick={() => add("after")}>+ 修复后</button>
        </div>
      }
    >
      <div className="log-columns">
        {PHASES.map(({ value, label }) => {
          const items = value === "before" ? before : value === "during" ? during : after;
          return (
            <div className="log-col" key={value}>
              <h3 className={`log-title phase-${value}`}>{label}</h3>
              {items.length === 0 ? <p className="empty small">暂无记录</p> : null}
              {items.map((l) => (
                <article className="log-item" key={l.id}>
                  <div className="log-item-head">
                    <input
                      className="ctrl date"
                      type="date"
                      value={l.date}
                      onChange={(e) => patch(l.id, { date: e.target.value })}
                    />
                    <button className="btn-link danger" onClick={() => remove(l.id)}>
                      删除
                    </button>
                  </div>
                  <input
                    className="ctrl"
                    placeholder="标题，如 接毯登记"
                    value={l.title}
                    onChange={(e) => patch(l.id, { title: e.target.value })}
                  />
                  <textarea
                    className="ctrl area"
                    rows={3}
                    placeholder="详细记录"
                    value={l.detail}
                    onChange={(e) => patch(l.id, { detail: e.target.value })}
                  />
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
