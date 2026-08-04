interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  light?: boolean;
}

export default function SectionHeading({ eyebrow, heading, subheading, light = false }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <span className={`label-mono mb-3 inline-block text-xs font-semibold ${light ? 'text-brand-orange' : 'text-brand-orange'}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${light ? 'text-white' : 'text-brand-navy'}`}>
        {heading}
      </h2>
      {subheading && (
        <p className={`mt-3 text-base sm:text-lg ${light ? 'text-white/70' : 'text-brand-navy/60'}`}>
          {subheading}
        </p>
      )}
    </div>
  );
}
