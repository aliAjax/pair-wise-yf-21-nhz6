import { useRef, useState } from "react";
import type { PatternMark } from "../types";
import { uid } from "../storage";
import { Panel } from "./ui";

/**
 * 纹样局部标记图：在样板上点击落点，记录局部纹样名称与说明。
 * 坐标按百分比存储，面板缩放不影响点位。
 */
export function PatternBoard({
  marks,
  onChange,
}: {
  marks: PatternMark[];
  onChange: (next: PatternMark[]) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  function placeMark(e: React.MouseEvent<HTMLDivElement>) {
    const rect = boardRef.current!.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
    const mark: PatternMark = {
      id: uid("mk"),
      x: Math.min(98, Math.max(2, x)),
      y: Math.min(97, Math.max(3, y)),
      label: "",
      note: "",
    };
    onChange([...marks, mark]);
    setActiveId(mark.id);
  }

  function patch(id: string, p: Partial<PatternMark>) {
    onChange(marks.map((m) => (m.id === id ? { ...m, ...p } : m)));
  }

  function remove(id: string) {
    onChange(marks.filter((m) => m.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <Panel
      title="纹样局部标记"
      desc="在纹样板上点击落点，记录局部纹样名称与损伤说明；点击已有标记可编辑或删除。"
    >
      <div
        ref={boardRef}
        className="pattern-board"
        onClick={placeMark}
      >
        <div className="pattern-grid" />
        <span className="pattern-hint">点击任意位置添加纹样标记</span>
        {marks.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={"mark-dot" + (activeId === m.id ? " active" : "")}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            title={m.label || `标记 ${i + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(activeId === m.id ? null : m.id);
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mark-list">
        {marks.length === 0 ? (
          <p className="empty">还没有纹样标记，在上方样板点击添加。</p>
        ) : (
          marks.map((m, i) => (
            <div
              key={m.id}
              className={"mark-row" + (activeId === m.id ? " active" : "")}
              onClick={() => setActiveId(m.id)}
            >
              <b className="mark-index">{i + 1}</b>
              <div className="mark-fields">
                <input
                  className="ctrl"
                  placeholder="纹样名称，如 中心葵纹"
                  value={m.label}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => patch(m.id, { label: e.target.value })}
                />
                <input
                  className="ctrl"
                  placeholder="局部说明（走向、损伤、配色参照…）"
                  value={m.note}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => patch(m.id, { note: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn-link danger"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(m.id);
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
