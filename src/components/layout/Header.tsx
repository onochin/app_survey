type HeaderIconName = "book" | "pencil" | "chart" | "settings";

interface HeaderIconProps {
  readonly name: HeaderIconName;
}

function HeaderIcon({ name }: HeaderIconProps) {
  if (name === "book") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v16H7.5A3.5 3.5 0 0 0 4 21.5v-16Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v16h3.5a3.5 3.5 0 0 1 3.5 3.5v-16Z" />
      </svg>
    );
  }

  if (name === "pencil") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z" />
        <path d="m13.8 6.7 3.5 3.5" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 20V10M12 20V4M19 20v-7" />
        <path d="M2.5 20.5h19" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function SurveyLabMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      viewBox="0 0 48 48"
    >
      <path className="brand-tripod" d="M24 24 12 45M24 24l12 21M24 24v21" />
      <path className="brand-tripod-accent" d="m20 33-4 12M28 33l4 12" />
      <rect className="brand-device" x="16" y="7" width="16" height="18" rx="3" />
      <circle className="brand-lens" cx="24" cy="15" r="4" />
      <path className="brand-handle" d="M20 7V3h8v4" />
    </svg>
  );
}

const modes = [
  { label: "学習モード", icon: "book", selected: true },
  { label: "演習", icon: "pencil", selected: false },
  { label: "進捗", icon: "chart", selected: false },
  { label: "設定", icon: "settings", selected: false },
] as const satisfies readonly {
  readonly label: string;
  readonly icon: HeaderIconName;
  readonly selected: boolean;
}[];

function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <SurveyLabMark />
        <div className="brand-copy">
          <span className="brand-name">測量理解ラボ</span>
          <span className="brand-subtitle">
            測量を見て、操作して、計算して理解する
          </span>
        </div>
      </div>

      <nav className="header-modes" aria-label="表示モード">
        {modes.map((mode) => (
          <span
            aria-current={mode.selected ? "page" : undefined}
            aria-disabled={!mode.selected}
            className={`header-mode ${mode.selected ? "is-selected" : ""}`}
            key={mode.label}
            title={mode.selected ? mode.label : `${mode.label}（今後実装予定）`}
          >
            <HeaderIcon name={mode.icon} />
            <span>{mode.label}</span>
          </span>
        ))}
      </nav>
    </header>
  );
}

export default Header;
