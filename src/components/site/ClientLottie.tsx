import { useEffect, useRef } from "react";

interface LottieAnimationProps {
  animationData: unknown;
  className?: string;
  loop?: boolean;
}

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (opts: {
        container: HTMLElement;
        renderer: string;
        loop: boolean;
        autoplay: boolean;
        animationData: unknown;
      }) => { destroy: () => void };
    };
  }
}

function ensureLottie(): Promise<typeof window.lottie> {
  if (window.lottie) return Promise.resolve(window.lottie);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.0/lottie.min.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.lottie));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.0/lottie.min.js";
    script.onload = () => resolve(window.lottie);
    document.head.appendChild(script);
  });
}

export function LottieAnimation({ animationData, className, loop = true }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    ensureLottie().then((lottie) => {
      if (destroyed || !containerRef.current) return;
      animRef.current = lottie!.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop,
        autoplay: true,
        animationData,
      });
    });
    return () => {
      destroyed = true;
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [animationData, loop]);

  return <div ref={containerRef} className={className} />;
}
