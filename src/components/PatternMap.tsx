import { DamageZone } from "../types";

interface PatternMapProps {
  zones: DamageZone[];
  selectedId: string | null;
  onAdd: (x: number, y: number) => void;
  onSelect: (id: string) => void;
}

/** 纹样局部标记图：点击毯面添加破损标记，点击标记选中对应区域 */
function PatternMap({ zones, selectedId, onAdd, onSelect }: PatternMapProps) {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    onAdd(Math.min(97, Math.max(3, x)), Math.min(98, Math.max(2, y)));
  };

  return (
    <svg
      className="pattern-map"
      viewBox="0 0 300 400"
      role="img"
      aria-label="地毯纹样标记图，点击添加破损区域"
      onClick={handleClick}
    >
      {/* 毯面与外边框 */}
      <rect x="2" y="2" width="296" height="396" fill="#f3e9d7" />
      <rect x="8" y="8" width="284" height="384" fill="none" stroke="#7c2d12" strokeWidth="7" />
      <rect x="19" y="19" width="262" height="362" fill="none" stroke="#b45309" strokeWidth="2" />
      <rect x="30" y="30" width="240" height="340" fill="#f8f1e3" stroke="#0f766e" strokeWidth="3" />

      {/* 边框装饰菱形 */}
      {[70, 110, 150, 190, 230].map((cx) => (
        <g key={cx} fill="#7c2d12" opacity="0.5">
          <polygon points={`${cx},10 ${cx + 5},15 ${cx},20 ${cx - 5},15`} />
          <polygon points={`${cx},380 ${cx + 5},385 ${cx},390 ${cx - 5},385`} />
        </g>
      ))}

      {/* 四角纹样 */}
      <polygon points="30,30 95,30 30,95" fill="#0f766e" opacity="0.18" />
      <polygon points="270,30 205,30 270,95" fill="#0f766e" opacity="0.18" />
      <polygon points="30,370 95,370 30,305" fill="#0f766e" opacity="0.18" />
      <polygon points="270,370 205,370 270,305" fill="#0f766e" opacity="0.18" />

      {/* 中央奖章纹 */}
      <polygon points="150,105 235,200 150,295 65,200" fill="#7c2d12" opacity="0.14" stroke="#7c2d12" strokeWidth="2" />
      <ellipse cx="150" cy="200" rx="46" ry="72" fill="#0f766e" opacity="0.16" stroke="#0f766e" strokeWidth="2" />
      <polygon points="150,165 185,200 150,235 115,200" fill="#b45309" opacity="0.3" />
      <circle cx="150" cy="200" r="9" fill="#7c2d12" opacity="0.55" />

      {/* 上下小花纹 */}
      {[100, 150, 200].map((cx) => (
        <g key={cx} fill="#b45309" opacity="0.4">
          <polygon points={`${cx},60 ${cx + 8},68 ${cx},76 ${cx - 8},68`} />
          <polygon points={`${cx},324 ${cx + 8},332 ${cx},340 ${cx - 8},332`} />
        </g>
      ))}

      {/* 破损标记 */}
      {zones.map((zone, i) => {
        const cx = (zone.x / 100) * 300;
        const cy = (zone.y / 100) * 400;
        const selected = zone.id === selectedId;
        return (
          <g
            key={zone.id}
            className="zone-marker"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(zone.id);
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={selected ? 14 : 11}
              fill={zone.repair ? zone.repair.cardHex : "#dc2626"}
              stroke={selected ? "#172033" : "#ffffff"}
              strokeWidth={selected ? 3 : 2}
              opacity="0.95"
            />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default PatternMap;
