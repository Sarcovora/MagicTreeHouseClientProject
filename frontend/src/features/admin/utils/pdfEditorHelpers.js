/**
 * PDF/Image Editor Save Utilities
 * 
 * Handles the complex save logic for annotated PDFs and images,
 * including scaling annotations and embedding them into documents.
 */

import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';

/**
 * Saves an annotated image by merging annotations onto the original image.
 * Scales annotations proportionally to maintain quality at original resolution.
 * 
 * @param {object} params - Save parameters
 * @param {string} params.imageUrl - URL of the original image
 * @param {object} params.annotationsJson - Fabric.js canvas JSON with annotations
 * @param {object} params.displayDimensions - Current canvas dimensions { width, height }
 * @param {object|null} params.originalDimensions - Original image dimensions { width, height }
 * @returns {Promise<Blob>} - PNG blob of the annotated image
 */
export async function saveAnnotatedImage({
  imageUrl,
  annotationsJson,
  displayDimensions,
  originalDimensions,
}) {
  // Use original dimensions for high quality, else fallback to display size
  const targetWidth = originalDimensions?.width || displayDimensions.width;
  const targetHeight = originalDimensions?.height || displayDimensions.height;
  
  // Calculate scale factor (original vs displayed size)
  const scaleFactor = originalDimensions 
    ? originalDimensions.width / displayDimensions.width 
    : 1;

  console.log(`Saving image: ${targetWidth}x${targetHeight}, scale: ${scaleFactor}`);
  
  // Create temporary canvas at full resolution
  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = targetWidth;
  tempCanvasEl.height = targetHeight;
  
  const staticCanvas = new fabric.StaticCanvas(tempCanvasEl, {
    width: targetWidth,
    height: targetHeight,
  });

  // Load original image as background
  await new Promise((resolve, reject) => {
    fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      .then((img) => {
        img.scaleToWidth(targetWidth);
        staticCanvas.backgroundImage = img;
        staticCanvas.renderAll();
        resolve();
      })
      .catch(reject);
  });

  // Scale and add annotations
  if (annotationsJson.objects?.length > 0) {
    try {
      const enlivenedObjects = await fabric.util.enlivenObjects(annotationsJson.objects);
      
      enlivenedObjects.forEach((obj) => {
        // Scale position and size proportionally
        obj.left *= scaleFactor;
        obj.top *= scaleFactor;
        obj.scaleX *= scaleFactor;
        obj.scaleY *= scaleFactor;
        
        // Scale stroke width for paths
        if (obj.strokeWidth) {
          obj.strokeWidth *= scaleFactor;
        }
        
        obj.setCoords();
        staticCanvas.add(obj);
      });
      
      staticCanvas.renderAll();
    } catch (err) {
      console.error('Error applying annotations to image:', err);
    }
  }

  // Export as PNG blob
  const dataUrl = staticCanvas.toDataURL({ format: 'png', quality: 1.0 });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  
  staticCanvas.dispose();
  return blob;
}

/**
 * Saves an annotated PDF by embedding annotations onto each page.
 * 
 * @param {object} params - Save parameters
 * @param {string} params.pdfUrl - URL of the original PDF
 * @param {object} params.allAnnotations - Annotations keyed by page number { 1: json, 2: json, ... }
 * @returns {Promise<Blob>} - PDF blob with embedded annotations
 */
export async function saveAnnotatedPdf({ pdfUrl, allAnnotations }) {
  // Fetch and load the original PDF
  const response = await fetch(pdfUrl);
  const pdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  console.log(`Saving PDF with ${Object.keys(allAnnotations).length} annotated pages`);

  // Process each annotated page
  for (const [pageIndexStr, json] of Object.entries(allAnnotations)) {
    const pageIndex = parseInt(pageIndexStr, 10);
    
    // Skip pages with no annotations
    if (!json.objects?.length) continue;

    const pdfPage = pages[pageIndex - 1]; // Convert to 0-based index
    if (!pdfPage) continue;

    const { width, height } = pdfPage.getSize();
    
    // Use 1.5x scale for clarity (matches display scale)
    const targetWidth = width * 1.5;
    const targetHeight = height * 1.5;

    // Create temporary canvas for this page's annotations
    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = targetWidth;
    tempCanvasEl.height = targetHeight;
    
    const staticCanvas = new fabric.StaticCanvas(tempCanvasEl, {
      width: targetWidth,
      height: targetHeight,
    });

    // Add annotation objects
    try {
      const enlivenedObjects = await fabric.util.enlivenObjects(json.objects);
      
      if (enlivenedObjects.length === 0) {
        console.warn(`Page ${pageIndex}: No objects enlivened`);
        continue;
      }
      
      enlivenedObjects.forEach((obj) => {
        obj.setCoords();
        staticCanvas.add(obj);
      });
      
      staticCanvas.renderAll();
    } catch (err) {
      console.error(`Page ${pageIndex}: Error processing annotations:`, err);
      continue;
    }

    // Export annotations as PNG and embed into PDF
    const annotationsDataURL = staticCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const pngImageBytes = await fetch(annotationsDataURL).then(res => res.arrayBuffer());
    const annotationsImg = await pdfDoc.embedPng(pngImageBytes);
    
    pdfPage.drawImage(annotationsImg, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    
    staticCanvas.dispose();
  }

  // Save modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
}
