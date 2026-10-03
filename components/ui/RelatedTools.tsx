import Link from "next/link";

export function RelatedTools({
  tools,
}: {
  tools: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="rounded-[12px] border border-border bg-surface p-3.5 transition-colors hover:border-blue/30 hover:bg-surface-soft md:p-5"
        >
          <div className="heading-card">{tool.label}</div>
          <p className="support-copy mt-1.5">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}
