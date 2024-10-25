import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import modulesData from "@/config/ww_modules.json";
import defaultSettings from "@/config/ww_defaults.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ModuleComponent = ({ module }: { module: any }) => {
  const Module = React.lazy(
    () => import(`@/components/modules/${module.path}`)
  );

  // Merge module props with default settings
  const moduleProps = { ...defaultSettings, ...module.component.props };

  return (
    <Suspense fallback={<Skeleton className="w-full h-40" />}>
      <Module {...moduleProps} />
    </Suspense>
  );
};

interface CompilerProps {
  themeName?:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
}

export default function Compile({ themeName }: CompilerProps) {
  // Apply default settings to each module
  const modulesWithDefaults = modulesData.modules.map((module) => ({
    ...module,
    component: {
      ...module.components.default,
      props: {
        ...defaultSettings,
        theme: themeName ? themeName : defaultSettings.theme,
        ...module.components.default.props,
      },
    },
  }));

  // Sort modules by position
  const allModules = modulesWithDefaults.sort(
    (a, b) => a.position - b.position
  );

  // Filter modules based on location
  const topModules = allModules.filter((module) => module.location === "top");
  const fitterModules = allModules.filter(
    (module) => module.location !== "top" && module.location !== "bottom"
  );
  const bottomModules = allModules.filter(
    (module) => module.location === "bottom"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderModules = (modules: any[]) => (
    <>
      {modules.map((module) => (
        <React.Fragment key={module.meta.name}>
          {module.enabled && (
            <div
              style={{
                width: module.lineBreak ? "100%" : undefined,
              }}
            >
              <ModuleComponent module={module} />
            </div>
          )}
          {module.lineBreak && module.enabled && (
            <div style={{ width: "100%", clear: "both" }}></div>
          )}
        </React.Fragment>
      ))}
    </>
  );

  return (
    <>
      <div>{renderModules(topModules)}</div>
      <div
        id="modulesHeightFitter"
        className="w-full flex flex-row flex-wrap gap-4 items-center justify-center p-4 mx-auto"
        style={{ maxWidth: "1480px" }}
      >
        {renderModules(fitterModules)}
      </div>
      <div>{renderModules(bottomModules)}</div>
    </>
  );
}
