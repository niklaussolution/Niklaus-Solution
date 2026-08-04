import { useEffect, useRef, useState, Children, cloneElement, isValidElement, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Give direct children a slight cascading delay instead of arriving as one flat block — a
   * quiet cascade across 3-4 cards reads as considered; leave off for single blocks of content. */
  stagger?: boolean;
  /** Animation utility class to apply once visible. Defaults to a plain fade-up. */
  animation?: string;
}

/**
 * Fades a section in on scroll. With `stagger`, direct children cascade in
 * with a small, consistent delay rather than all snapping in at once.
 */
export default function Reveal({ children, className = '', stagger = false, animation = 'animate-fade-in-up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (stagger) {
    return (
      <div ref={ref} className={className}>
        {Children.map(children, (child, i) => {
          if (!isValidElement(child)) return child;
          const props = child.props as { style?: React.CSSProperties; className?: string };
          return cloneElement(child, {
            style: { ...props.style, animationDelay: visible ? `${i * 90}ms` : undefined },
            className: `${props.className ?? ''} ${visible ? 'animate-fade-in-up' : 'opacity-0'}`,
          } as Partial<unknown>);
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={`${visible ? animation : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
