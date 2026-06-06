// Client-only PDF text extraction using pdfjs-dist.
// Must only be called from browser event handlers (uses DOM/worker).

export async function extractPdfText(file: File, opts?: { maxPages?: number; maxChars?: number }): Promise<string> {
  if (typeof window === "undefined") throw new Error("PDF extraction is browser-only");

  const maxPages = opts?.maxPages ?? 40;
  const maxChars = opts?.maxChars ?? 60_000;

  const pdfjsLib = await import("pdfjs-dist");
  const workerMod = (await import(/* @vite-ignore */ "pdfjs-dist/build/pdf.worker.min.mjs?url")) as { default: string };
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pages = Math.min(pdf.numPages, maxPages);
  let out = "";
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => (typeof (it as { str?: unknown }).str === "string" ? (it as { str: string }).str : ""))
      .filter(Boolean)
      .join(" ");
    out += pageText + "\n\n";
    if (out.length >= maxChars) break;
  }
  return out.slice(0, maxChars).trim();
}
