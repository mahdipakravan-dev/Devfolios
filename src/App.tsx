import { SidebarTrigger, useSidebar } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/AppSidebar";
import { GithubIcon, RefreshCcw } from "lucide-react";
import PortfolioComments from "@/Components/GiscusComments";
import { Button, buttonVariants } from "./Components/ui/button";
import { useCurrentPortfolio } from "./store/useCurrentPortfolio";
import { useRef } from "react";
import { Resizable } from "re-resizable";
import { cn } from "./lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedThemeToggler } from "@/Components/ThemeToggle";
import { usePortfoliosData } from "@/hooks/usePortfoliosData";

export default function App() {
  const { username } = useCurrentPortfolio();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { data: portfolios } = usePortfoliosData();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isCollapased = state === "collapsed";

  const portfolioLInk = portfolios?.find(
    (p) => p.username === username,
  )?.portfolioLink;

  const handleReload = () => {
    if (!iframeRef.current) return;
    console.log("Refreshed");
    iframeRef.current.src += "";
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 size-full bg-sidebar min-h-screen overflow-hidden   mx-auto scrollbar-h-px max-w-7xl ">
        {!isCollapased && (
          <AnimatePresence>
            <motion.div
              initial={{ width: "0%", height: "0px" }}
              animate={{ width: "100%", height: "16px" }}
              exit={{ width: "0%", height: "0px" }}
              className="max-sm:hidden"
              transition={{
                type: "spring",
              }}
            />
          </AnimatePresence>
        )}
        <div
          className={cn(
            "flex h-full flex-col items-center  rounded-tl-lg border-l bg-background",
            {
              "border-l-0": isCollapased || isMobile,
            },
          )}
        >
          <nav className="relative flex h-12 w-full items-center border-t border-b">
            <div className="flex h-full flex-1 items-center gap-2 pl-4">
              <SidebarTrigger
                className={cn({
                  hidden: !isCollapased && !isMobile,
                })}
              />
              <motion.button
                onClick={handleReload}
                className="group border-none p-2 outline-0"
                whileTap={{
                  rotate: [-25, -360, -25],
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1.0],
                  },
                }}
              >
                <RefreshCcw className="size-4" />
              </motion.button>

              <input
                className="flex-1 cursor-pointer rounded-full bg-input px-4 py-1 font-mono text-sm text-muted-foreground outline-none"
                type="text"
                readOnly
                value={portfolioLInk}
                onClick={(e) => {
                  const url = (e.target as HTMLInputElement).value;
                  window.open(url, "_blank");
                }}
              />
            </div>

            <div className="relative -top-1 h-10 w-32">
              <div
                className={cn(
                  "absolute left-4 z-10 -mt-1.5 inline-flex h-12 w-full items-center justify-center gap-0.5",
                  {
                    "relative left-0 -mt-0": isCollapased || isMobile,
                  },
                )}
              >
                <Button size="icon" variant={"ghost"} asChild>
                  <a href="https://github.com/NotStark/devfolios" target="_blank">
                    <GithubIcon className="!size-4" />
                  </a>
                </Button>

                <AnimatedThemeToggler
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                  )}
                />
              </div>
              <svg
                className={cn(
                  "pointer-events-none absolute z-5 h-full origin-top-left skew-x-32 transform-gpu overflow-visible transition-transform duration-300",
                  {
                    hidden: isCollapased || isMobile,
                  },
                )}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 128 32"
              >
                <line
                  className="stroke-sidebar"
                  strokeWidth="2px"
                  shapeRendering="optimizeQuality"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  x1="1"
                  y1="0"
                  x2="128"
                  y2="0"
                ></line>
                <path
                  className="fill-sidebar stroke-border"
                  shapeRendering="optimizeQuality"
                  strokeWidth="1px"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  vectorEffect="non-scaling-stroke"
                  d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
                ></path>
              </svg>
            </div>
          </nav>

          <div className="w-full   overflow-y-auto lg:scrollbar-thin">
            <div className="relative flex w-full h-screen items-center justify-center">
              <Resizable
                defaultSize={{ width: "100%", height: "100%" }}
                minWidth={300}
                maxWidth="100%"
                enable={{ left: true }}
                handleWrapperClass="transition-none"
              >
                <iframe
                  key={`${username}-${portfolioLInk}`}
                  ref={iframeRef}
                  src={portfolioLInk}
                  className="h-full w-full"
                  title="Portfolio Preview"
                  sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin allow-downloads"
                />
              </Resizable>
            </div>

            <div className="min-h-40 w-full border-t p-4">
              <PortfolioComments username={username} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
