import "./ToolRail.css";

export type ToolTab = "text" | "shape" | "button" | "upload" | "tools";

const iconProps = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

const TABS: { id: ToolTab; label: string; icon: JSX.Element }[] = [
  {
    id: "text",
    label: "Text",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    )
  },
  {
    id: "shape",
    label: "Shape",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="4" width="9" height="9" rx="1.5" />
        <circle cx="16.5" cy="16.5" r="4.5" />
      </svg>
    )
  },
  {
    id: "button",
    label: "Button",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="8" width="18" height="8" rx="4" />
      </svg>
    )
  },
  {
    id: "upload",
    label: "Upload",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 17l-6-5-4 3-3-2-4 3" />
      </svg>
    )
  },
  {
    id: "tools",
    label: "Tools",
    icon: (
      <svg {...iconProps}>
        <path d="M14.7 6.3a3 3 0 104 4L21 8l-3-3-2.3 2.3z" />
        <path d="M13 7l-8 8 2 2 8-8" />
      </svg>
    )
  }
];

type Props = {
  active: ToolTab;
  onChange: (tab: ToolTab) => void;
};

function ToolRail({ active, onChange }: Props) {
  return (
    <div className="tool-rail">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tool-rail-btn ${active === tab.id ? "tool-rail-btn-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ToolRail;