import type { ProcessStep, StepStatus } from "../types";
import { uid } from "../storage";
import { Panel } from "./ui";

const FLOW: { value: StepStatus; label: string }[] = [
  { value: "pending", label: "待做" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "完成" },
];

export function StepsPanel({
  steps,
  onChange,
}: {
  steps: ProcessStep[];
  onChange: (next: ProcessStep[]) => void;
}) {
  function patch(id: string, p: Partial<ProcessStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  function cycle(id: string, status: StepStatus) {
    patch(id, { status });
  }

  function add() {
    onChange([...steps, { id: uid("stp"), name: "", status: "pending", note: "" }]);
  }

  function remove(id: string) {
    onChange(steps.filter((s) => s.id !== id));
  }

  const done = steps.filter((s) => s.status === "done").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  return (
    <Panel
      title="工序进度"
      desc={`已完成 ${done}/${steps.length} 道工序 · 完工率 ${pct}%`}
      actions={<button className="btn" onClick={add}>+ 添加工序</button>}
    >
      <div className="progress-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <ol className="step-list">
        {steps.map((s, i) => (
          <li key={s.id} className={`step-item st-${s.status}`}>
            <b className="step-index">{i + 1}</b>
            <div className="step-main">
              <input
                className="ctrl step-name"
                placeholder="工序名称"
                value={s.name}
                onChange={(e) => patch(s.id, { name: e.target.value })}
              />
              <input
                className="ctrl step-note"
                placeholder="备注（可填日期/进度）"
                value={s.note}
                onChange={(e) => patch(s.id, { note: e.target.value })}
              />
            </div>
            <div className="step-state">
              {FLOW.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={"state-btn" + (s.status === f.value ? " on " + f.value : "")}
                  onClick={() => cycle(s.id, f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn-link danger step-del" onClick={() => remove(s.id)}>
              删除
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
