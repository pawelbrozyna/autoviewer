import Link from "next/link";

export function RelatedTools({
  tools,
}: {
  tools: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="rounded-[12px] border border-border bg-surface p-5 transition-colors hover:border-blue/30 hover:bg-surface-soft"
        >
          <div className="heading-card">{tool.label}</div>
          <p className="support-copy mt-1.5">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}
