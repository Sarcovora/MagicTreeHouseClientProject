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

const PdfEditor = ({ pdfUrl, onSave, onCancel }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvas, setCanvas] = useState(null);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#FF0000');
  const [pdfDimensions, setPdfDimensions] = useState({ width: 800, height: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [pageAnnotations, setPageAnnotations] = useState({}); // Store annotations per page

  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const fabricCanvasRef = useRef(null);

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
        width: 800,
        height: 600,
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

  // Save current annotations before unmounting or changing specific dependencies if needed
  // ideally we save on page change.

  // Restore annotations when page changes
  useEffect(() => {
    if (canvas) {
        canvas.clear();
        // Set dimensions first if we have them (they come from onPageLoadSuccess usually, but we might have them cached)
        // Actually dimensions update in another effect.
        
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

  // Update canvas dimensions when PDF loads
  useEffect(() => {
    if (canvas && pdfDimensions.width > 0 && pdfDimensions.height > 0) {
      canvas.setWidth(pdfDimensions.width);
      canvas.setHeight(pdfDimensions.height);
      canvas.calcOffset(); // Recalculate canvas offset for proper mouse positioning
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
          // specific check if there are meaningful objects? 
          // canvas.toJSON always returns an object. "objects" array is empty if clear.
          setPageAnnotations(prev => ({
              ...prev,
              [currentPage]: json
          }));
      }
  };


  const handleSave = async () => {
    if (!canvas) return;

    // Save the CURRENT page's annotations first to ensure latest state is captured
    const currentJson = canvas.toJSON();
    // We don't strictly need to update state here if we use local variable, 
    // but useful to sync state. 
    // However, for the loop below, we can construct a merged map.
    const allAnnotations = { ...pageAnnotations, [currentPage]: currentJson };

    setIsLoading(true);
    try {
      // Fetch the original PDF
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();

      // Load the PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      // Iterate through all pages that have annotations
      console.log('Starting PDF save. Total annotated pages identified:', Object.keys(allAnnotations).length);

      for (const [pageIndexStr, json] of Object.entries(allAnnotations)) {
          const pageIndex = parseInt(pageIndexStr, 10);
          console.log(`Processing Page ${pageIndex}. Objects count: ${json.objects ? json.objects.length : 0}`);
          
          if (!json.objects || json.objects.length === 0) {
              console.log(`Skipping Page ${pageIndex} (no objects)`);
              continue; 
          }

          const pdfPage = pages[pageIndex - 1]; // 1-based index from UI
          if (!pdfPage) {
              console.warn(`Page ${pageIndex} not found in PDF document.`);
              continue;
          }

          // We need the dimensions. We can get them from the pdfPage itself.
          const { width, height } = pdfPage.getSize();
          
          // Create a static canvas to render this page's annotations
          // We'll mimic the size used in the UI (scale 1.5)
          const targetWidth = width * 1.5;
          const targetHeight = height * 1.5;

          // In Node/invisible mode we can't easily make a DOM canvas. 
          // But we are in browser. We can make a hidden canvas.
          const tempCanvasEl = document.createElement('canvas');
          tempCanvasEl.width = targetWidth;
          tempCanvasEl.height = targetHeight;
          
          const staticCanvas = new fabric.StaticCanvas(tempCanvasEl, {
              width: targetWidth,
              height: targetHeight
          });

          // Manual Enliven approach to securely restore objects - Fabric v6 Promise compatible
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

          // Export to high-res PNG for embedding
          const annotationsDataURL = staticCanvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: 2 
          });

          // Convert Data URI to ArrayBuffer for pdf-lib compatibility
          const pngImageBytes = await fetch(annotationsDataURL).then(res => res.arrayBuffer());

          const annotationsImg = await pdfDoc.embedPng(pngImageBytes);
          
          pdfPage.drawImage(annotationsImg, {
              x: 0,
              y: 0,
              width: width,
              height: height,
          });
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      await onSave(blob);
    } catch (error) {
      console.error('Error saving PDF annotations:', error);
      alert('Failed to save annotations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changePage = (offset) => {
    // Save current page annotations before switching
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
          <h2 className="text-xl font-semibold text-gray-900">Edit Draft Map</h2>
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

        {/* PDF Viewer with Canvas Overlay */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="flex justify-center">
            <div className="relative inline-block" ref={pageRef}>
              <div className="relative">
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

        {/* Page Navigation */}
        {numPages && numPages > 1 && (
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
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PdfEditor;
