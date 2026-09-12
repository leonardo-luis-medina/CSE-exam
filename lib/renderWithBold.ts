// Converts **bold** markers into <strong> tags safely.
// Escapes HTML first so no injection is possible, then applies the bold pattern.
export function renderWithBold(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}