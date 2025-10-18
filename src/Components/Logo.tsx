import { cn } from "@/lib/utils";

const LogoIcon = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) => {

  const sizeMap = {
    xs: {
      outer: "size-8 rounded-[4px]",
      middle: "size-5 rounded-[3px]",
      core: "size-2.5 rounded-[2px]",
    },
    sm: {
      outer: "size-10 rounded-[5px]",
      middle: "size-6 rounded-[3.5px]",
      core: "size-3 rounded-[2.5px]",
    },
    md: {
      outer: "size-16 rounded-[6px]",
      middle: "size-10 rounded-[4px]",
      core: "size-5 rounded-[3px]",
    },
    lg: {
      outer: "size-24 rounded-[8px]",
      middle: "size-14 rounded-[5px]",
      core: "size-7 rounded-[4px]",
    },
    xl: {
      outer: "size-32 rounded-[10px]",
      middle: "size-20 rounded-[6px]",
      core: "size-10 rounded-[5px]",
    },
  }[size];

  return (
    <div className={cn("invert dark:invert-0", className)}>

      <div
        className={cn(
          "relative grid place-content-center",
          sizeMap.outer,
          "bg-[radial-gradient(circle_at_center,_#2a2a2a_0%,_#0d0d0d_70%,_#000000_100%)]",
          "shadow-[inset_0_3px_8px_rgba(255,255,255,0.06)]",
          "before:absolute before:size-full before:rounded-inherit before:bg-gradient-to-b before:to-transparent before:from-zinc-900/40"
        )}
      >

        <div
          className={cn(
            "grid place-content-center",
            sizeMap.middle,
            "bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f3f3f3_60%,_#e2e2e2_100%)]",
            "shadow-[inset_0_3px_4px_rgba(255,255,255,0.3),_0_4px_10px_rgba(0,0,0,0.3)]"
          )}
        >

          <div
            className={cn(
              "-rotate-12",
              sizeMap.core,
              "bg-[radial-gradient(circle_at_top,_#1a1a1a_0%,_#000000_100%)]",
              "dark:shadow-[0_4px_8px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(255,255,255,0.05)]"
            )}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LogoIcon;
