import "./ToolRail.css";

export type ToolTab = "text" | "shape" | "button" | "animation" | "effects" | "transition";

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
    id: "animation",
    label: "Animation",
    icon: (
      <svg {...iconProps}>
        <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
        <path d="M12 8v4l3 2" />
      </svg>
    )
  },
  {
    id: "effects",
    label: "Effects",
    icon: (
      <svg {...iconProps}>
        <path d="M4 20l3-9 9-3-3 9-9 3z" />
        <path d="M15 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
      </svg>
    )
  },
  {
    id: "transition",
    label: "Transition",
    icon: (
      <svg {...iconProps}>
        <path d="M5 12h14M13 6l6 6-6 6" />
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
