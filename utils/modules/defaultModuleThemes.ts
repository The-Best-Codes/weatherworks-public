export interface ThemeClasses {
  card: string;
  cardHex: string;
  text: string;
  textHex: string;
  label: string;
  labelHex: string;
  tabsList: string;
  tabsListHex: string;
  tabsTrigger: string;
  tabsTriggerHex: string;
  tabsTriggerActive: string;
  tabsTriggerActiveHex: string;
  skeleton: string;
  skeletonHex: string;
}

export const themes: Record<string, ThemeClasses> = {
  defaultLight: {
    card: "bg-white",
    cardHex: "#fff",
    text: "text-gray-900",
    textHex: "#111827",
    label: "text-gray-500",
    labelHex: "#6b7280",
    tabsList: "bg-gray-100",
    tabsListHex: "#f3f4f6",
    tabsTrigger: "data-[state=active]:bg-white",
    tabsTriggerHex: "#fff",
    tabsTriggerActive: "data-[state=active]:text-gray-900",
    tabsTriggerActiveHex: "#111827",
    skeleton: "bg-gray-200",
    skeletonHex: "#e5e7eb",
  },
  defaultDark: {
    card: "bg-gray-800 border-none",
    cardHex: "#1f2937",
    text: "text-white",
    textHex: "#fff",
    label: "text-gray-400",
    labelHex: "#9ca3af",
    tabsList: "bg-gray-700",
    tabsListHex: "#374151",
    tabsTrigger: "data-[state=active]:bg-gray-600",
    tabsTriggerHex: "#4b5563",
    tabsTriggerActive: "data-[state=active]:text-white",
    tabsTriggerActiveHex: "#fff",
    skeleton: "bg-gray-600",
    skeletonHex: "#4b5563",
  },
  opaqueLight: {
    card: "bg-white bg-opacity-70 border-none",
    cardHex: "#ffffffb3",
    text: "text-gray-900",
    textHex: "#111827",
    label: "text-gray-600",
    labelHex: "#6b7280",
    tabsList: "bg-gray-100/70",
    tabsListHex: "#f3f4f6b3",
    tabsTrigger: "data-[state=active]:bg-white/70",
    tabsTriggerHex: "#fff",
    tabsTriggerActive: "data-[state=active]:text-gray-900",
    tabsTriggerActiveHex: "#111827",
    skeleton: "bg-gray-200/70",
    skeletonHex: "#e5e7ebb3",
  },
  opaqueDark: {
    card: "bg-gray-800 bg-opacity-70 border-none",
    cardHex: "#1f2937b3",
    text: "text-white",
    textHex: "#fff",
    label: "text-gray-300",
    labelHex: "#9ca3af",
    tabsList: "bg-gray-700/70",
    tabsListHex: "#374151b3",
    tabsTrigger: "data-[state=active]:bg-gray-600/70",
    tabsTriggerHex: "#4b5563b3",
    tabsTriggerActive: "data-[state=active]:text-white",
    tabsTriggerActiveHex: "#fff",
    skeleton: "bg-gray-600/70",
    skeletonHex: "#4b5563b3",
  },
  blurLight: {
    card: "bg-white bg-opacity-70 backdrop-blur-sm border-none",
    cardHex: "#ffffffb3",
    text: "text-gray-900",
    textHex: "#111827",
    label: "text-gray-600",
    labelHex: "#6b7280",
    tabsList: "bg-gray-100/70",
    tabsListHex: "#f3f4f6b3",
    tabsTrigger: "data-[state=active]:bg-white/70",
    tabsTriggerHex: "#fff",
    tabsTriggerActive: "data-[state=active]:text-gray-900",
    tabsTriggerActiveHex: "#111827",
    skeleton: "bg-gray-200/70",
    skeletonHex: "#e5e7ebb3",
  },
  blurDark: {
    card: "bg-gray-800 bg-opacity-70 border-none backdrop-blur-sm",
    cardHex: "#1f2937b3",
    text: "text-white",
    textHex: "#fff",
    label: "text-gray-300",
    labelHex: "#9ca3af",
    tabsList: "bg-gray-700/70",
    tabsListHex: "#374151b3",
    tabsTrigger: "data-[state=active]:bg-gray-600/70",
    tabsTriggerHex: "#4b5563b3",
    tabsTriggerActive: "data-[state=active]:text-white",
    tabsTriggerActiveHex: "#fff",
    skeleton: "bg-gray-500/70",
    skeletonHex: "#6b7280b3",
  },
};
