// src/components/consultations/form-fields/Section.tsx
interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}