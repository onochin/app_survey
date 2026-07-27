type SidebarIconName =
  | "home"
  | "book"
  | "traverse"
  | "level"
  | "satellite"
  | "globe"
  | "terrain"
  | "camera"
  | "points"
  | "tools"
  | "law";

interface SidebarIconProps {
  readonly name: SidebarIconName;
}

function SidebarIcon({ name }: SidebarIconProps) {
  if (name === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m3 11 9-8 9 8" />
        <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 4.5A3.5 3.5 0 0 1 7.5 1H11v17H7.5A3.5 3.5 0 0 0 4 21.5v-17ZM20 4.5A3.5 3.5 0 0 0 16.5 1H13v17h3.5a3.5 3.5 0 0 1 3.5 3.5v-17Z" />
      </svg>
    );
  }

  if (name === "traverse") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m5 6 6-3 8 5-2 10-9 2-5-7 2-7Z" />
        <circle cx="5" cy="6" r="1.7" />
        <circle cx="11" cy="3" r="1.7" />
        <circle cx="19" cy="8" r="1.7" />
        <circle cx="17" cy="18" r="1.7" />
        <circle cx="8" cy="20" r="1.7" />
        <circle cx="3" cy="13" r="1.7" />
      </svg>
    );
  }

  if (name === "level") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 7h10l2 4H5l2-4ZM12 11v10M12 13l-5 8M12 13l5 8" />
        <circle cx="12" cy="5" r="2" />
      </svg>
    );
  }

  if (name === "satellite") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9 15 6-6M7 17l-4 4M17 7l4-4" />
        <rect x="8.5" y="8.5" width="7" height="7" rx="1" transform="rotate(45 12 12)" />
        <path d="m4 8 4-4 3 3-4 4M13 17l4-4 3 3-4 4" />
      </svg>
    );
  }

  if (name === "globe") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18" />
      </svg>
    );
  }

  if (name === "terrain") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m2 20 6-11 4 6 3-4 7 9H2Z" />
        <path d="m6.5 12 1.5 1 1.3-.8" />
      </svg>
    );
  }

  if (name === "camera") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v10H2V9a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }

  if (name === "points") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="6" cy="6" r="2" />
        <circle cx="17" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="17" r="1.5" />
        <circle cx="18" cy="18" r="2" />
        <path d="m7.5 7.5 2.5 2.7M14 10.5l2-4M10 14l-3.5 2M14 14l2.5 2.5" />
      </svg>
    );
  }

  if (name === "tools") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14 6a5 5 0 0 0-7-4l3 3-3 3-3-3a5 5 0 0 0 6 7l9 9 3-3-9-9A5 5 0 0 0 14 6Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3v18M5 6h14M7 6l-4 8h8L7 6ZM17 6l-4 8h8l-4-8ZM7 21h10" />
    </svg>
  );
}

const navigationItems = [
  { label: "ホーム", icon: "home", selected: false },
  { label: "測量の基礎", icon: "book", selected: false },
  { label: "多角測量", icon: "traverse", selected: true },
  { label: "水準測量", icon: "level", selected: false },
  { label: "GNSS / Drogger", icon: "satellite", selected: false },
  { label: "座標系", icon: "globe", selected: false },
  { label: "地形測量", icon: "terrain", selected: false },
  { label: "写真測量", icon: "camera", selected: false },
  { label: "3次元点群", icon: "points", selected: false },
  { label: "応用測量", icon: "tools", selected: false },
  { label: "法規・試験対策", icon: "law", selected: false },
] as const satisfies readonly {
  readonly label: string;
  readonly icon: SidebarIconName;
  readonly selected: boolean;
}[];

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav aria-label="教材メニュー">
        <ul className="sidebar-navigation">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <span
                aria-current={item.selected ? "page" : undefined}
                aria-disabled={!item.selected}
                className={`sidebar-link ${item.selected ? "is-selected" : ""}`}
                title={
                  item.selected
                    ? `${item.label}（選択中）`
                    : `${item.label}（今後実装予定）`
                }
              >
                <SidebarIcon name={item.icon} />
                <span>{item.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <section className="progress-card" aria-labelledby="progress-title">
        <div className="progress-heading">
          <h2 id="progress-title">学習進捗</h2>
          <strong>42%</strong>
        </div>
        <div
          aria-label="学習進捗 42%"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={42}
          className="progress-track"
          role="progressbar"
        >
          <span />
        </div>
        <p>
          次の目標
          <strong>水準測量の理解</strong>
        </p>
        <span className="progress-detail">
          4 / 10 テーマ完了
          <span aria-hidden="true">→</span>
        </span>
      </section>
    </aside>
  );
}

export default Sidebar;
