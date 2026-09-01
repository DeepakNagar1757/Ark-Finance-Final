import { useEffect, useRef } from "react";
import lottie from "lottie-web";

interface LottieAnimationProps {
  animationData: unknown;
  className?: string;
  loop?: boolean;
}

export function LottieAnimation({ animationData, className, loop = true }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<lottie.AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay: true,
      animationData,
    });
    return () => {
      animRef.current?.destroy();
    };
  }, [animationData, loop]);

  return <div ref={containerRef} className={className} />;
}
