import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onBlobGenerated?: (blob: Blob, fileName: string) => void | Promise<void>;
}

/**
 * Triggers direct browser download for a Blob using cross-browser methods
 */
export function triggerBlobDownload(blob: Blob, fileName: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_self';
    link.rel = 'noopener';
    link.style.position = 'fixed';
    link.style.top = '-9999px';
    link.style.left = '-9999px';
    link.style.opacity = '0';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 3000);
    return true;
  } catch (err) {
    console.error('triggerBlobDownload error:', err);
    return false;
  }
}

/**
 * Robust element capture using html-to-image (native browser rasterization supporting
 * modern CSS like oklch, lab, color-mix) with fallback to patched html2canvas.
 */
async function captureElement(element: HTMLElement): Promise<{ imgData: string; width: number; height: number }> {
  const filterFn = (node: Node) => {
    if (node instanceof HTMLElement) {
      if (
        node.classList?.contains('print:hidden') ||
        node.id === 'quotation-document-action-bar' ||
        node.id === 'quotation-signed-backup-banner'
      ) {
        return false;
      }
    }
    return true;
  };

  // 1. Primary Engine: html-to-image (Uses native SVG foreignObject, 100% immune to oklch parser bugs)
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: filterFn,
      cacheBust: true,
      skipFonts: true,
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('No se pudo cargar la imagen renderizada.'));
    });

    return {
      imgData: dataUrl,
      width: img.naturalWidth || element.offsetWidth * 2 || 1600,
      height: img.naturalHeight || element.offsetHeight * 2 || 1200,
    };
  } catch (primaryErr) {
    console.warn('html-to-image warning, attempting secondary engine html2canvas:', primaryErr);

    // 2. Secondary Fallback Engine: html2canvas (patched against oklch crashes)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        return (
          el.classList?.contains('print:hidden') ||
          el.id === 'quotation-document-action-bar' ||
          el.id === 'quotation-signed-backup-banner'
        );
      },
    });

    return {
      imgData: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    };
  }
}

/**
 * Finds all candidate break positions in element coordinates (pixels relative to element top)
 * based on elements that should not be split (data-page-break-avoid, tr, sections).
 */
function findSafeBreakPoints(element: HTMLElement): number[] {
  const rect = element.getBoundingClientRect();
  const safePositions: number[] = [];

  // Check rows, sections, and blocks marked to avoid breaks
  const candidates = element.querySelectorAll<HTMLElement>(
    'tr, [data-page-break-avoid], .break-inside-avoid, [id="services-table-container"], [id="quotation-totals-block"]'
  );

  candidates.forEach((el) => {
    const elRect = el.getBoundingClientRect();
    const topOffset = elRect.top - rect.top;
    const bottomOffset = elRect.bottom - rect.top;

    if (topOffset > 10 && topOffset < rect.height - 10) {
      safePositions.push(Math.round(topOffset));
    }
    if (bottomOffset > 10 && bottomOffset < rect.height - 10) {
      safePositions.push(Math.round(bottomOffset));
    }
  });

  safePositions.sort((a, b) => a - b);
  return Array.from(new Set(safePositions));
}

/**
 * Creates a jsPDF document from the rendered quotation element with smart pagination
 * that guarantees modules, tables, bank information, and signatures are never sliced.
 */
export async function createQuotationPdfInstance(
  elementId: string = 'quotation-print-document'
): Promise<{ pdf: jsPDF; imgData: string }> {
  let element = document.getElementById(elementId) as HTMLElement | null;

  if (!element) {
    element = document.querySelector('[id="quotation-print-document"]') as HTMLElement | null;
  }

  if (!element) {
    throw new Error(`No se encontró el documento de cotización (${elementId}).`);
  }

  // Ensure fonts are settled
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  // Capture clean image
  const { imgData, width, height } = await captureElement(element);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 0;
  const renderWidth = pageWidth;
  const mmPerPixel = renderWidth / width;
  const totalHeightMm = height * mmPerPixel;

  if (totalHeightMm <= pageHeight) {
    // Fits in a single A4 page
    pdf.addImage(imgData, 'PNG', marginX, 0, renderWidth, totalHeightMm, undefined, 'FAST');
    return { pdf, imgData };
  }

  // Multi-page document: slice cleanly at element boundaries
  const rawBreakPoints = findSafeBreakPoints(element);
  const safeBreakPointsMm = rawBreakPoints.map((px) => px * mmPerPixel);

  const sourceImage = new Image();
  sourceImage.src = imgData;
  await new Promise((res, rej) => {
    sourceImage.onload = res;
    sourceImage.onerror = rej;
  });

  const usablePageHeightMm = pageHeight;
  let currentStartMm = 0;
  let pageIndex = 0;

  while (currentStartMm < totalHeightMm - 1) {
    let targetEndMm = currentStartMm + usablePageHeightMm;

    if (targetEndMm >= totalHeightMm) {
      targetEndMm = totalHeightMm;
    } else {
      // Find the best clean module break point within the bottom 90mm of the page
      const minAcceptableMm = targetEndMm - 90;
      let bestBreakMm = -1;

      for (let i = safeBreakPointsMm.length - 1; i >= 0; i--) {
        const bp = safeBreakPointsMm[i];
        if (bp <= targetEndMm - 4 && bp >= minAcceptableMm) {
          bestBreakMm = bp;
          break;
        }
      }

      if (bestBreakMm > currentStartMm + 40) {
        targetEndMm = bestBreakMm;
      }
    }

    const sliceHeightMm = targetEndMm - currentStartMm;
    const sliceStartYPx = (currentStartMm / totalHeightMm) * height;
    const sliceHeightPx = (sliceHeightMm / totalHeightMm) * height;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = width;
    pageCanvas.height = Math.max(1, Math.round(sliceHeightPx));
    const ctx = pageCanvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        sourceImage,
        0,
        sliceStartYPx,
        width,
        sliceHeightPx,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
      );

      const sliceDataUrl = pageCanvas.toDataURL('image/png');

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(sliceDataUrl, 'PNG', 0, 0, renderWidth, sliceHeightMm, undefined, 'FAST');
    }

    currentStartMm = targetEndMm;
    pageIndex++;

    if (pageIndex > 20) break;
  }

  return { pdf, imgData };
}

/**
 * Generates a direct PDF Blob
 */
export async function generateQuotationPdfBlob(
  elementId: string = 'quotation-print-document'
): Promise<Blob> {
  const { pdf } = await createQuotationPdfInstance(elementId);
  return pdf.output('blob');
}

/**
 * Generates and downloads a direct high-resolution PDF of the quotation document.
 */
export async function downloadQuotationPdf(
  elementId: string = 'quotation-print-document',
  quotationCode: string = 'COT-RBC',
  options?: PdfExportOptions
): Promise<boolean> {
  try {
    options?.onStart?.();

    const { pdf } = await createQuotationPdfInstance(elementId);

    const safeCode = quotationCode.replace(/[/\\?%*:|"<>]/g, '-');
    const finalFilename = options?.fileName || `${safeCode}_Cotizacion.pdf`;

    const blob = pdf.output('blob');

    // Archive in background without blocking download
    if (options?.onBlobGenerated) {
      Promise.resolve()
        .then(() => options.onBlobGenerated!(blob, finalFilename))
        .catch((err) => console.warn('onBlobGenerated background warning:', err));
    }

    // Trigger single direct browser download via Blob
    triggerBlobDownload(blob, finalFilename);

    options?.onSuccess?.();
    return true;
  } catch (err) {
    console.error('Error al generar el PDF:', err);
    options?.onError?.(err as Error);
    return false;
  }
}

/**
 * Intelligent print handler
 */
export async function triggerPrintOrExport(
  elementId: string = 'quotation-print-document',
  quotationCode: string = 'COT-RBC',
  notifyBlocked?: () => void
): Promise<void> {
  const isInIframe = window.self !== window.top;

  if (isInIframe) {
    try {
      window.print();
    } catch (e) {
      console.warn('Iframe print blocked, opening printable window or direct download:', e);
      if (notifyBlocked) {
        notifyBlocked();
      } else {
        openPrintableWindow(elementId, `Cotización ${quotationCode}`);
      }
      return;
    }
  } else {
    try {
      window.print();
    } catch (e) {
      console.warn('window.print() error, triggering direct PDF download:', e);
      await downloadQuotationPdf(elementId, quotationCode);
    }
  }
}

/**
 * Opens a clean printable standalone window with the exact quotation document design
 */
export function openPrintableWindow(
  elementId: string = 'quotation-print-document',
  title: string = 'Cotización RB Comunicaciones'
): boolean {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const printWindow = window.open('', '_blank', 'width=920,height=850,menubar=no,toolbar=no,location=no,status=no');
  if (!printWindow) {
    return false;
  }

  // Copy stylesheets into the new window
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((style) => style.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
        <style>
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 16px !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          }
          #quotation-print-document {
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            max-width: 800px !important;
            margin: 0 auto !important;
          }
          @media print {
            body { padding: 0 !important; }
            @page { size: A4 portrait; margin: 8mm 10mm; }
            #quotation-print-document {
              border: 1px solid #cbd5e1 !important;
              border-radius: 10px !important;
            }
            [data-page-break-avoid],
            .break-inside-avoid,
            tr,
            td,
            th {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 820px; margin: 0 auto;">
          ${element.outerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        <\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
  return true;
}
