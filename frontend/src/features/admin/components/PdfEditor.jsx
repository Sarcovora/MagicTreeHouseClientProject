import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as fabric from 'fabric';
import { PDFDocument } from 'pdf-lib';
import PropTypes from 'prop-types';
import { Pencil, Download, Undo, Trash2 } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfEditor = ({ pdfUrl, isPdf: propIsPdf, onSave, onCancel }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvas, setCanvas] = useState(null);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#FF0000');
  const [pdfDimensions, setPdfDimensions] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(false);

  const [pageAnnotations, setPageAnnotations] = useState({}); // Store annotations per page

  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  // Determine mode
  // If propIsPdf is provided (boolean), use it. Otherwise fall back to URL check.
  const cleanUrl = pdfUrl?.split('?')[0]?.toLowerCase();
  const urlIsPdf = cleanUrl?.endsWith('.pdf');
  
  const isPdf = propIsPdf !== undefined ? propIsPdf : urlIsPdf;
  const isImage = !isPdf;

  console.log('PdfEditor Debug:', { pdfUrl, cleanUrl, isPdf, isImage, propIsPdf });

  // Initialize canvas once on mount
  useEffect(() => {
    // Ensure we only initialize once
    if (!canvasRef.current) return;

    // Check if canvas is already initialized
    const existingCanvas = canvasRef.current.__fabricCanvas;
    if (existingCanvas) {
      fabricCanvasRef.current = existingCanvas;
      setCanvas(existingCanvas);
      return;
    }

    try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: pdfDimensions.width,
        height: pdfDimensions.height,
        backgroundColor: 'rgba(0,0,0,0)' // Transparent
      });

      // Enable drawing mode and set up brush for Fabric v6
      fabricCanvas.isDrawingMode = true;

      // Create a new PencilBrush for Fabric v6
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = penColor; // Use current state
      brush.width = penSize; // Use current state
      fabricCanvas.freeDrawingBrush = brush;

      console.log('Canvas initialized - Drawing mode:', fabricCanvas.isDrawingMode);

      // Store reference on the DOM element to prevent re-initialization
      canvasRef.current.__fabricCanvas = fabricCanvas;
      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        if (canvasRef.current) {
          delete canvasRef.current.__fabricCanvas;
        }
        fabricCanvasRef.current = null;
      }
    };
  }, []); // Empty dependencies - only run once on mount

  // Restore annotations when page changes
  useEffect(() => {
    if (canvas) {
        canvas.clear();
        
        const savedJSON = pageAnnotations[currentPage];
        if (savedJSON) {
            canvas.loadFromJSON(savedJSON, () => {
                canvas.renderAll();
                 // Re-apply brush settings after load
                if (!canvas.freeDrawingBrush) {
                     const brush = new fabric.PencilBrush(canvas);
                     canvas.freeDrawingBrush = brush;
                }
                canvas.freeDrawingBrush.color = penColor;
                canvas.freeDrawingBrush.width = penSize;
            });
        }
    }
  }, [currentPage, canvas]); // Run when page changes

  // Update canvas dimensions when dimensions change
  useEffect(() => {
    if (canvas && pdfDimensions.width > 0 && pdfDimensions.height > 0) {
      canvas.setWidth(pdfDimensions.width);
      canvas.setHeight(pdfDimensions.height);
      canvas.calcOffset();
      canvas.renderAll();
    }
  }, [canvas, pdfDimensions.width, pdfDimensions.height]);

  // Update brush settings when pen color or size changes
  useEffect(() => {
    if (canvas) {
      if (!canvas.freeDrawingBrush) {
        // Create brush if it doesn't exist (Fabric v6)
        const brush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush = brush;
      }
      canvas.freeDrawingBrush.color = penColor;
      canvas.freeDrawingBrush.width = penSize;
    }
  }, [canvas, penColor, penSize]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    setPdfDimensions({
      width: viewport.width,
      height: viewport.height,
    });
  };

  const onImageLoad = (e) => {
      const { naturalWidth, naturalHeight } = e.target;
      
      // Calculate scale to fit within a reasonable workspace (standard laptop screen)
      const MAX_WIDTH = 1000;
      const MAX_HEIGHT = 800;
      
      let scale = 1;
      if (naturalWidth > MAX_WIDTH || naturalHeight > MAX_HEIGHT) {
         const scaleX = MAX_WIDTH / naturalWidth;
         const scaleY = MAX_HEIGHT / naturalHeight;
         scale = Math.min(scaleX, scaleY);
      }

      const finalWidth = naturalWidth * scale;
      const finalHeight = naturalHeight * scale;

      setPdfDimensions({
          width: finalWidth,
          height: finalHeight
      });
  };

  const handleUndo = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        canvas.remove(objects[objects.length - 1]);
        canvas.renderAll();
      }
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  // Helper to save current page annotations to state
  const saveCurrentPageAnnotations = () => {
      if (canvas) {
          const json = canvas.toJSON();
          setPageAnnotations(prev => ({
              ...prev,
              [currentPage]: json
          }));
      }
  };


  const handleSave = async () => {
    if (!canvas) return;

    // Save the CURRENT page's annotations first
    const currentJson = canvas.toJSON();
    const allAnnotations = { ...pageAnnotations, [currentPage]: currentJson };

    setIsLoading(true);
    try {
        if (isPdf) {
            await handleSavePdf(allAnnotations);
        } else {
            // For Images, we only support single page anyway for now (Page 1)
            await handleSaveImage(currentJson);
        }
    } catch (error) {
      console.error('Error saving annotations:', error);
      alert('Failed to save annotations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async (annotationsJson) => {
      const { width, height } = pdfDimensions;
      
      const tempCanvasEl = document.createElement('canvas');
      tempCanvasEl.width = width;
      tempCanvasEl.height = height;
      
      const staticCanvas = new fabric.StaticCanvas(tempCanvasEl, {
          width: width,
          height: height
      });

      // Load original image as background
      await new Promise((resolve, reject) => {
          fabric.FabricImage.fromURL(pdfUrl, { crossOrigin: 'anonymous' }).then((img) => {
              // Scale image to match canvas if needed, but here we set canvas to match image
              img.scaleToWidth(width);
              staticCanvas.backgroundImage = img;
              staticCanvas.renderAll();
              resolve();
          }).catch(reject);
      });

      // Load Annotations
      if (annotationsJson.objects && annotationsJson.objects.length > 0) {
          try {
              const enlivenedObjects = await fabric.util.enlivenObjects(annotationsJson.objects);
              enlivenedObjects.forEach((obj) => {
                  obj.setCoords();
                  staticCanvas.add(obj);
              });
              staticCanvas.renderAll();
          } catch (err) {
              console.error('Error enlivening objects for image:', err);
          }
      }

      // Export to Blob
      const dataUrl = staticCanvas.toDataURL({ format: 'png', quality: 0.9 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      await onSave(blob);
      staticCanvas.dispose();
  };

  const handleSavePdf = async (allAnnotations) => {
      // Fetch the original PDF
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();

      // Load the PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      console.log('Starting PDF save. Total annotated pages identified:', Object.keys(allAnnotations).length);

      for (const [pageIndexStr, json] of Object.entries(allAnnotations)) {
          const pageIndex = parseInt(pageIndexStr, 10);
          
          if (!json.objects || json.objects.length === 0) continue;

          const pdfPage = pages[pageIndex - 1]; // 1-based index from UI
          if (!pdfPage) continue;

          const { width, height } = pdfPage.getSize();
          const targetWidth = width * 1.5;
          const targetHeight = height * 1.5;

          const tempCanvasEl = document.createElement('canvas');
          tempCanvasEl.width = targetWidth;
          tempCanvasEl.height = targetHeight;
          
          const staticCanvas = new fabric.StaticCanvas(tempCanvasEl, {
              width: targetWidth,
              height: targetHeight
          });

          if (json.objects && json.objects.length > 0) {
              try {
                  const enlivenedObjects = await fabric.util.enlivenObjects(json.objects);
                  if (enlivenedObjects.length === 0) {
                      console.warn(`Page ${pageIndex}: Failed to enliven objects.`);
                  } else {
                      enlivenedObjects.forEach((obj) => {
                          obj.setCoords();
                          staticCanvas.add(obj);
                      });
                      staticCanvas.renderAll();
                  }
              } catch (err) {
                  console.error(`Page ${pageIndex}: Error invoking enlivenObjects:`, err);
              }
          }

          const annotationsDataURL = staticCanvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: 2 
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

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      await onSave(blob);
  };

  const changePage = (offset) => {
    saveCurrentPageAnnotations();
    setCurrentPage((prevPage) => {
      const newPage = prevPage + offset;
      return Math.max(1, Math.min(newPage, numPages || 1));
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="flex h-full w-full max-w-7xl flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
              Edit {isPdf ? 'Document' : 'Image'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Annotations'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Pen Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600">{penSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="h-8 w-16 cursor-pointer rounded border border-gray-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Undo className="h-4 w-4" />
              Undo
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Viewer with Canvas Overlay */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="flex justify-center">
            <div className="relative inline-block" ref={pageRef}>
              <div className="relative">
                {isPdf ? (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center py-20">
                                <div className="text-gray-600">Loading PDF...</div>
                            </div>
                        }
                        error={
                            <div className="flex items-center justify-center py-20">
                                <div className="text-red-600">Failed to load PDF</div>
                            </div>
                        }
                    >
                        <Page
                            pageNumber={currentPage}
                            scale={1.5}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                ) : (
                    <img 
                        src={pdfUrl} 
                        onLoad={onImageLoad}
                        style={{ 
                            display: 'block', 
                            maxWidth: 'none',
                            width: `${pdfDimensions.width}px`,
                            height: `${pdfDimensions.height}px`
                        }} 
                        alt="To annotate"
                    />
                )}

                {/* Drawing Canvas Overlay */}
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: `${pdfDimensions.width}px`,
                    height: `${pdfDimensions.height}px`,
                    pointerEvents: 'all',
                  }}
                >
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Navigation (PDF Only) */}
        {isPdf && numPages && numPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-gray-600">
              Page {currentPage} of {numPages}
            </p>
            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PdfEditor.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  isPdf: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PdfEditor;
