import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/**
 * Internal component that captures screenshots from the 3D canvas
 * Used within Canvas to have access to useThree hook
 */
export function ScreenshotCapture({
  shouldCapture,
  onCaptureDone,
  onCaptureError,
}: {
  shouldCapture: boolean;
  onCaptureDone: (canvas: HTMLCanvasElement) => void;
  onCaptureError: (error: Error) => void;
}) {
  const { gl } = useThree();
  const captureRequestedRef = useRef(false);

  useEffect(() => {
    if (!shouldCapture || captureRequestedRef.current) return;

    captureRequestedRef.current = true;

    // Use requestAnimationFrame to ensure the current frame is rendered
    requestAnimationFrame(() => {
      try {
        // Get the canvas from the WebGL renderer
        const canvas = gl.domElement;

        // Create a new canvas to copy the WebGL content
        const screenshotCanvas = document.createElement("canvas");
        screenshotCanvas.width = canvas.width;
        screenshotCanvas.height = canvas.height;
        const ctx = screenshotCanvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get 2D context from screenshot canvas");
        }

        // Draw the WebGL canvas to our new canvas
        ctx.drawImage(canvas, 0, 0);

        onCaptureDone(screenshotCanvas);
      } catch (error) {
        onCaptureError(
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        captureRequestedRef.current = false;
      }
    });
  }, [shouldCapture, gl, onCaptureDone, onCaptureError]);

  return null;
}
