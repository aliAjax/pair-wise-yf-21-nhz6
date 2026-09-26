import type { RugArchive } from "../types";

export function ArchiveList({
  archives,
  origins,
  filter,
  onFilter,
  selectedId,
  draftFor,
  newDraft,
  onSelect,
}: {
  archives: RugArchive[];
  origins: string[];
  filter: string;
  onFilter: (v: string) => void;
  selectedId: string | null;
  /** id -> 是否存在未保存草稿 */
  draftFor: (id: string) => boolean;
  /** 是否存在未保存的新档案草稿 */
  newDraft: RugArchive | null;
  onSelect: (id: string) => void;
}) {
  const list = archives.filter((a) => filter === "全部" || a.origin === filter);

  return (
    <aside className="panel archive-list">
      <div className="panel-head">
        <div>
          <h2>档案列表</h2>
          <p className="panel-desc">按产地筛选，点击打开修改</p>
        </div>
      </div>

      <div className="origin-filter">
        {["全部", ...origins].map((o) => (
          <button
            key={o}
            className={"chip" + (filter === o ? " on" : "")}
            onClick={() => onFilter(o)}
          >
            {o}
            <em>{o === "全部" ? archives.length : archives.filter((a) => a.origin === o).length}</em>
          </button>
        ))}
      </div>

      <div className="archive-rows">
        {newDraft ? (
          <button
            className={"archive-row new-draft" + (selectedId === "new" ? " on" : "")}
            onClick={() => onSelect("new")}
          >
            <div className="row-top">
              <b>{newDraft.code || "未命名新档案"}</b>
              <span className="status-tag st-待修复">未保存</span>
            </div>
            <div className="row-mid">{newDraft.origin} · 接毯登记中</div>
            <div className="row-sub">点击继续编辑，内容已暂存本机</div>
            <span className="dirty-dot">● 草稿</span>
          </button>
        ) : null}
        {list.length === 0 ? <p className="empty">该产地暂无档案。</p> : null}
        {list.map((a) => {
          const dirty = draftFor(a.id);
          return (
            <button
              key={a.id}
              className={"archive-row" + (selectedId === a.id ? " on" : "")}
              onClick={() => onSelect(a.id)}
            >
              <div className="row-top">
                <b>{a.code || "未编号"}</b>
                <span className={`status-tag st-${a.status}`}>{a.status}</span>
              </div>
              <div className="row-mid">
                {a.origin}
                {a.era ? ` · ${a.era}` : ""}
              </div>
              <div className="row-sub">
                {a.damages.length} 处破损 · {a.marks.length} 个纹样标记
              </div>
              {dirty ? <span className="dirty-dot" title="有未保存的修改">● 未保存</span> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
