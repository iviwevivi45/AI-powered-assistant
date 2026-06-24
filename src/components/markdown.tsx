// Minimal markdown renderer — supports headings, bold, lists, tables, paragraphs.
// Used for AI tool outputs. Not for untrusted content.
import { useMemo } from "react";

function escape(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

function inline(s: string) {
  let out = escape(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>');
  return out;
}

function renderTable(lines: string[]): string {
  const rows = lines.map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (rows.length < 2) return "";
  const head = rows[0];
  const body = rows.slice(2);
  return `<div class="overflow-x-auto my-3"><table class="w-full text-sm border-collapse">
    <thead><tr class="border-b border-border">${head.map((h) => `<th class="text-left py-2 px-2 font-medium">${inline(h)}</th>`).join("")}</tr></thead>
    <tbody>${body.map((r) => `<tr class="border-b border-border/50">${r.map((c) => `<td class="py-2 px-2 align-top">${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function render(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\|.+\|/.test(line) && /^\|[\s\-:|]+\|/.test(lines[i + 1] ?? "")) {
      const start = i;
      i += 2;
      while (i < lines.length && /^\|.+\|/.test(lines[i])) i++;
      out.push(renderTable(lines.slice(start, i)));
      continue;
    }
    if (/^###\s+/.test(line)) { out.push(`<h3 class="font-display font-semibold text-base mt-4 mb-1.5">${inline(line.replace(/^###\s+/, ""))}</h3>`); i++; continue; }
    if (/^##\s+/.test(line)) { out.push(`<h2 class="font-display font-semibold text-lg mt-5 mb-2 text-foreground">${inline(line.replace(/^##\s+/, ""))}</h2>`); i++; continue; }
    if (/^#\s+/.test(line)) { out.push(`<h1 class="font-display font-bold text-xl mt-5 mb-2">${inline(line.replace(/^#\s+/, ""))}</h1>`); i++; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li class="ml-5 list-disc marker:text-primary">${inline(lines[i].replace(/^\s*[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul class="my-2 space-y-1">${items.join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li class="ml-5 list-decimal marker:text-primary">${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ol class="my-2 space-y-1">${items.join("")}</ol>`);
      continue;
    }
    if (line.trim() === "") { out.push(""); i++; continue; }
    // paragraph (collapse consecutive non-empty)
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p class="my-2 leading-relaxed">${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

export function Markdown({ children }: { children: string }) {
  const html = useMemo(() => render(children), [children]);
  return <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: html }} />;
}
