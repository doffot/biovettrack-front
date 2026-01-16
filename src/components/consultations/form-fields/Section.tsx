interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section>
      {title && (
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}