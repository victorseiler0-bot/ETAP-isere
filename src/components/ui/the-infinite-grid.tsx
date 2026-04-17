import React, { useRef } from "react";
import { cn } from "../../lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";

export const InfiniteGrid = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % 40);
    gridOffsetY.set((currentY + speedY) % 40);
  });

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full flex flex-col items-center justify-center overflow-hidden bg-white",
        className
      )}
    >
      {/* Base Grid Layer with top fade-in and very subtle global blur */}
      <div className="absolute inset-0 z-0 opacity-[0.03] [mask-image:linear-gradient(to_bottom,transparent,black_300px)] blur-[0.5px]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>

      {/* Reveal Grid Layer with top fade-in, mouse interaction and soft blur */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_300px)] blur-[1px]"
        style={{ 
          maskImage: useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, black, transparent), linear-gradient(to bottom, transparent, black 300px)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, black, transparent), linear-gradient(to bottom, transparent, black 300px)`
        }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      {/* Background Decorative Blobs for depth and blur */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-50/20 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pointer-events-auto">{children}</div>
    </section>
  );
};

const GridPattern = ({ offsetX, offsetY }: { offsetX: any; offsetY: any }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <motion.pattern
          id="grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-900"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};
