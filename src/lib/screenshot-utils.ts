/**
 * Utilities for taking and processing screenshots from 3D configurator
 */

interface ScreenshotOptions {
  carModel: string;
  rimModel: string;
  fileName?: string;
}

/**
 * Add watermark with branding info to canvas and return as blob
 */
export async function addWatermarkAndDownload(
  sourceCanvas: HTMLCanvasElement,
  options: ScreenshotOptions
): Promise<void> {
  const { carModel, rimModel, fileName = "draxler-config" } = options;

  // Create new canvas for final image (same size as source)
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = sourceCanvas.width;
  finalCanvas.height = sourceCanvas.height;
  const ctx = finalCanvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get 2D context");

  // Draw the original screenshot
  ctx.drawImage(sourceCanvas, 0, 0);

  // Set up text properties
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";

  // Add soft drop shadow for readability against any background (since we removed the bar)
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = Math.round(finalCanvas.width * 0.012);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(finalCanvas.width * 0.002);

  // Padding from edges
  const paddingX = Math.round(finalCanvas.width * 0.045); // Generous side padding
  let currentY = finalCanvas.height - Math.round(finalCanvas.height * 0.06); // Bottom padding

  // Calculate responsive font sizes
  const titleFontSize = Math.round(finalCanvas.width * 0.014); // Made in Draxler
  const descFontSize = Math.round(finalCanvas.width * 0.02);   // Car model
  const linkFontSize = Math.round(finalCanvas.width * 0.012);  // Link

  // Deeply Apple-esque font stack
  const fontFamily = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif";

  // Line 3 (Bottom): "visit..."
  ctx.font = `300 ${linkFontSize}px ${fontFamily}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = "0.5px";
  ctx.fillText("visit draxlerwheels.com to see more", paddingX, currentY);

  currentY -= Math.round(linkFontSize * 1.8); // Space up

  // Line 2 (Middle): "G Class on DRX-301" - Main emphasis
  ctx.font = `500 ${descFontSize}px ${fontFamily}`;
  ctx.fillStyle = "#FFFFFF";
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = "-0.2px"; // Tighter tracking for large text
  ctx.fillText(`${carModel} on ${rimModel}`, paddingX, currentY);

  currentY -= Math.round(descFontSize * 1.4); // Space up

  // Line 1 (Top): "Made in Draxler"
  ctx.font = `600 ${titleFontSize}px ${fontFamily}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = "1.5px"; // Wide tracking for premium feel
  ctx.fillText("Made in Draxler", paddingX, currentY);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Convert to blob and download
  finalCanvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png", 1.0);
}

/**
 * Extract model display name from selected car
 */
export function extractModelNames(
  selectedCar: { displayName?: string },
  selectedWheelModel: string
): { carName: string; rimName: string } {
  const carName = selectedCar?.displayName || "Vehicle";

  // Extract rim name from the selected wheel model
  // e.g., "DRX-301" -> "DRX-301" or "DRX_301.glb" -> "DRX-301"
  let rimName = selectedWheelModel
    .replace(/\.glb$/i, "")
    .replace(/_/g, "-");

  // If it doesn't have the DRX prefix, add it
  if (!rimName.startsWith("DRX")) {
    rimName = `DRX-${rimName}`;
  }

  return { carName, rimName };
}
