import type { ReactNode } from "react";

/** 表单字段外壳：标题 + 控件 */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="fld">
      <span className="fld-label">
        {label}
        {hint ? <em className="fld-hint">{hint}</em> : null}
      </span>
      {children}
    </label>
  );
}

export function Panel({
  title,
  desc,
  actions,
  children,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {desc ? <p className="panel-desc">{desc}</p> : null}
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export const inputCls = "ctrl";
