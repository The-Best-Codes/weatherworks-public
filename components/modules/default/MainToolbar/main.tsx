"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { Loader2, AlertTriangle } from "lucide-react"; // Error icon

interface BottomToolbarProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    temperature: "C" | "F" | "K";
    pressure: "hPa" | "inHg" | "mmHg" | "mbar";
    speed: "m/s" | "km/h" | "mph" | "knots";
    distance: "mm" | "in" | "cm" | "m" | "km" | "mi" | "ft" | "yd";
    length: "mm" | "in" | "cm" | "m" | "km" | "mi" | "ft" | "yd";
  };
  autoHide?: boolean;
  location?: "tr" | "tl" | "br" | "bl";
  orientation?: "horizontal" | "vertical";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: any[];
}

const MainToolbar = React.memo(
  ({
    theme,
    units,
    autoHide = true,
    location = "br",
    orientation = "horizontal",
    plugins = [],
  }: BottomToolbarProps) => {
    const themeClasses: ThemeClasses = useMemo(() => themes[theme], [theme]);
    const [isVisible, setIsVisible] = useState(!autoHide);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [pluginErrors, setPluginErrors] = useState<boolean[]>([]);

    const showToolbar = useCallback(() => {
      if (autoHide) {
        setIsVisible(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    }, [autoHide]);

    const hideToolbar = useCallback(() => {
      if (autoHide) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }
    }, [autoHide]);

    useEffect(() => {
      if (!autoHide) {
        setIsVisible(true);
      }
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [autoHide]);

    const handleError = (index: number) => {
      setPluginErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = true;
        return updatedErrors;
      });
    };

    const renderPlugins = useMemo(() => {
      if (!plugins || plugins.length === 0) {
        return <p>No plugins available</p>;
      }

      return plugins.map((plugin, index) => {
        const { paths } = plugin;
        const ComponentPath = paths.find(
          (path: { key: string; val: string }) => path.key === "component"
        )?.val;
        const MainComponentKey = paths.find(
          (path: { key: string; val: string }) => path.key === "main"
        )?.val;
        const ExternalComponentKey = paths.find(
          (path: { key: string; val: string }) => path.key === "external"
        )?.val;
        const ProviderKey = paths.find(
          (path: { key: string; val: string }) => path.key === "provider"
        )?.val;
        const shouldProviderPassProps = paths.find(
          (path: { key: string; val: string }) => path.key === "provider"
        )?.passMainProps;
        let ProviderProps = {};
        if (shouldProviderPassProps) {
          const defaultProps = {
            theme,
            units,
          };
          const props = paths.find(
            (path: { key: string; val: string }) => path.key === "provider"
          )?.props;
          ProviderProps = { ...defaultProps, ...props };
        } else {
          ProviderProps = paths.find(
            (path: { key: string; val: string }) => path.key === "provider"
          )?.props;
        }

        if (!ComponentPath || !MainComponentKey || !ProviderKey) {
          console.error(
            `Invalid plugin configuration for plugin at index ${index}`
          );
          return <p key={index}>Invalid plugin configuration</p>;
        }

        const MainComponent = React.lazy(async () => {
          try {
            const importedModule = await import(`./plugins/${ComponentPath}`);
            if (!importedModule[MainComponentKey]) {
              throw new Error(
                `Main component ${MainComponentKey} not found in ${ComponentPath}`
              );
            }
            return { default: importedModule[MainComponentKey] };
          } catch (error) {
            console.error(error);
            handleError(index);
            return { default: () => <p>Error loading component</p> };
          }
        });

        const ExternalComponentToRender = ExternalComponentKey
          ? React.lazy(async () => {
              try {
                const importedModule = await import(
                  `./plugins/${ComponentPath}`
                );
                if (!importedModule[ExternalComponentKey]) {
                  throw new Error(
                    `External component ${ExternalComponentKey} not found in ${ComponentPath}`
                  );
                }
                return { default: importedModule[ExternalComponentKey] };
              } catch (error) {
                console.error(error);
                handleError(index);
                return {
                  default: () => <p>Error loading external component</p>,
                };
              }
            })
          : null;

        const ProviderComponent: React.FC<{ children: React.ReactNode }> =
          React.lazy(async () => {
            try {
              const importedModule = await import(`./plugins/${ComponentPath}`);
              if (!importedModule.default) {
                throw new Error(
                  `Provider component ${ProviderKey} not found in ${ComponentPath}`
                );
              }
              return { default: importedModule.default };
            } catch (error) {
              console.error(error);
              handleError(index);
              return { default: () => <p>Error loading provider</p> };
            }
          });

        const ExternalPortal = ({
          children,
        }: {
          children: React.ReactNode;
        }) => {
          if (typeof window === "undefined") return null;
          if (typeof document === "undefined") return null;
          const el = document.getElementById("external-plugin-container");
          if (!el) return null;
          return ReactDOM.createPortal(children, el);
        };

        return (
          <Suspense
            fallback={
              <div
                className={`${themeClasses.text} flex items-center justify-center`}
              >
                {pluginErrors[index] ? (
                  <AlertTriangle className="text-red-500" /> // Error icon
                ) : (
                  <Loader2 className="animate-spin" />
                )}
              </div>
            }
            key={index}
          >
            <ProviderComponent {...ProviderProps}>
              <CardContent className="p-0">
                <MainComponent />
              </CardContent>
              {ExternalComponentToRender && (
                <ExternalPortal>
                  <ExternalComponentToRender />
                </ExternalPortal>
              )}
            </ProviderComponent>
          </Suspense>
        );
      });
    }, [plugins, theme, themeClasses.text, units, pluginErrors]);

    const cardClassName = useMemo(() => {
      const locationClasses = {
        tr: "top-0 right-0",
        tl: "top-0 left-0",
        br: "bottom-0 right-0",
        bl: "bottom-0 left-0",
      };

      const orientationClasses =
        orientation === "horizontal" ? "flex-row" : "flex-col";

      return `fixed ${
        locationClasses[location]
      } flex ${orientationClasses} gap-2 m-2 w-fit h-fit p-2 z-40 transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${themeClasses.card}`;
    }, [isVisible, themeClasses.card, location, orientation]);

    return (
      <>
        <Card
          className={cardClassName}
          onMouseEnter={showToolbar}
          onMouseLeave={hideToolbar}
        >
          {renderPlugins}
        </Card>
        <div id="external-plugin-container" />
      </>
    );
  }
);

MainToolbar.displayName = "MainToolbar";

export default MainToolbar;
