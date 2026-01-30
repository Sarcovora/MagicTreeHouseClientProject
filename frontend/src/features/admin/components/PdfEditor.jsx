/**
 * PdfEditor - Full-screen annotation editor for PDFs and images
 * 
 * Features:
 * - PDF multi-page navigation with per-page annotation persistence
 * - Image editing with high-resolution output
 * - Drawing tools: pen with adjustable size/color
 * - Undo and clear functionality
 * - Integrated comment field for detailed feedback
 * 
 * @param {object} props
 */

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as fabric from 'fabric';
import PropTypes from 'prop-types';
import { Pencil, Download, Undo, Trash2, MessageSquare } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { saveAnnotatedImage, saveAnnotatedPdf } from '../utils/pdfEditorHelpers';

// ==================== Configuration ====================

/**
 * Configure PDF.js worker (required for react-pdf)
 * Uses local worker from pdfjs-dist via Vite URL for better reliability
 */
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * Default canvas dimensions before document loads
 */
const DEFAULT_DIMENSIONS = { width: 800, height: 600 };

/**
 * Maximum display dimensions to fit on screen
 * Documents larger than this will be scaled down
 */
const MAX_DISPLAY_WIDTH = 1000;
const MAX_DISPLAY_HEIGHT = 800;

/**
 * PDF rendering scale factor for quality
 */
const PDF_SCALE = 1.5;

// ==================== Helper Functions ====================

/**
 * Calculates scaled dimensions to fit within max bounds while preserving aspect ratio.
 * 
 * Used when loading images to ensure they fit on screen while maintaining
 * their original proportions.
 * 
 * @param {number} naturalWidth - Original width of the document
 * @param {number} naturalHeight - Original height of the document
 * @returns {{width: number, height: number, scale: number}} Display dimensions and scale factor
 */
function calculateDisplayDimensions(naturalWidth, naturalHeight) {
  let scale = 1;
  
  // Only scale down if larger than max
  if (naturalWidth > MAX_DISPLAY_WIDTH || naturalHeight > MAX_DISPLAY_HEIGHT) {
    const scaleX = MAX_DISPLAY_WIDTH / naturalWidth;
    const scaleY = MAX_DISPLAY_HEIGHT / naturalHeight;
    scale = Math.min(scaleX, scaleY);
  }

  return {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
    scale,
  };
}

/**
 * Detects if the URL points to a PDF file.
 * 
 * @param {string} url - URL to check
 * @param {boolean|undefined} propOverride - Optional prop to force PDF/image mode
 * @returns {boolean} True if document is a PDF
 */
function detectIsPdf(url, propOverride) {
  if (propOverride !== undefined) {
    return propOverride;
  }
  const cleanUrl = url?.split('?')[0]?.toLowerCase();
  return cleanUrl?.endsWith('.pdf');
}

// ==================== Subcomponents ====================

/**
 * Header bar with title and save/cancel buttons.
 */
const EditorHeader = ({ isPdf, onCancel, onSave, isLoading, canSave }) => (
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
        onClick={onSave}
        disabled={isLoading || !canSave}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        {isLoading ? 'Saving...' : 'Save Annotations'}
      </button>
    </div>
  </div>
);

/**
 * Drawing toolbar with pen settings and undo/clear buttons.
 */
const DrawingToolbar = ({ penSize, setPenSize, penColor, setPenColor, onUndo, onClear }) => (
  <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3">
    {/* Pen Size Slider */}
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

    {/* Pen Color Picker */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Color:</label>
      <input
        type="color"
        value={penColor}
        onChange={(e) => setPenColor(e.target.value)}
        className="h-8 w-16 cursor-pointer rounded border border-gray-300"
      />
    </div>

    {/* Undo/Clear Buttons */}
    <div className="ml-auto flex items-center gap-2">
      <button
        onClick={onUndo}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        <Undo className="h-4 w-4" />
        Undo
      </button>
      <button
        onClick={onClear}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        <Trash2 className="h-4 w-4" />
        Clear All
      </button>
    </div>
  </div>
);

/**
 * Comment input field (shown when comments are required).
 */
const CommentField = ({ comment, setComment, isLoading }) => (
  <div className="px-6 pt-4">
    <div className="flex items-center gap-2 mb-2">
      <MessageSquare className="h-4 w-4 text-green-600" />
      <label className="text-sm font-bold text-gray-800">
        Comment Required <span className="text-red-500">*</span>
      </label>
    </div>
    <textarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Please describe your annotations or changes..."
      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      rows={2}
      disabled={isLoading}
    />
  </div>
);

/**
 * PDF page navigation controls.
 */
const PageNavigation = ({ currentPage, numPages, onPrevious, onNext }) => (
  <div className="flex items-center justify-center gap-4 px-6 py-4">
    <button
      onClick={onPrevious}
      disabled={currentPage <= 1}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
    >
      Previous
    </button>
    <p className="text-sm text-gray-600">
      Page {currentPage} of {numPages}
    </p>
    <button
      onClick={onNext}
      disabled={currentPage >= numPages}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

// ==================== Main Component ====================

/**
 * PdfEditor - Full-screen annotation editor for PDFs and images.
 * 
 * @param {object} props
 * @param {string} props.pdfUrl - URL of the PDF or image to edit
 * @param {boolean} [props.isPdf] - Force PDF mode (auto-detected from URL if not provided)
 * @param {function} props.onSave - Callback receiving (blob, comment) when user saves
 * @param {function} props.onCancel - Callback to close editor
 * @param {boolean} props.requireComment - Whether to show and require a comment field
 */
const PdfEditor = ({ pdfUrl, isPdf: propIsPdf, onSave, onCancel, requireComment = false }) => {
  // ==================== State ====================
  
  // Document state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState(DEFAULT_DIMENSIONS);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  
  // Canvas/drawing state
  const [canvas, setCanvas] = useState(null);
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#FF0000');
  const [pageAnnotations, setPageAnnotations] = useState({});
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");

  // ==================== Refs ====================
  
  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  // ==================== Computed Values ====================
  
  const isPdf = detectIsPdf(pdfUrl, propIsPdf);
  const isImage = !isPdf;
  const canSave = !requireComment || comment.trim().length > 0;

  console.log('PdfEditor Debug:', { pdfUrl: pdfUrl?.split('?')[0], isPdf, isImage });

  // ==================== Canvas Initialization ====================
  
  /**
   * Initialize Fabric.js canvas on mount.
   * Only runs once to prevent duplicate canvas creation.
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    // Prevent re-initialization
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
        backgroundColor: 'rgba(0,0,0,0)', // Transparent overlay
      });

      // Enable drawing mode with pencil brush
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = penColor;
      brush.width = penSize;
      fabricCanvas.freeDrawingBrush = brush;

      console.log('Canvas initialized - Drawing mode:', fabricCanvas.isDrawingMode);

      // Store reference to prevent re-initialization
      canvasRef.current.__fabricCanvas = fabricCanvas;
      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }

    // Cleanup on unmount
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        if (canvasRef.current) {
          delete canvasRef.current.__fabricCanvas;
        }
        fabricCanvasRef.current = null;
      }
    };
  }, []); // Run once on mount

  // ==================== Canvas Effects ====================
  
  /**
   * Restore annotations when changing pages.
   * Clears canvas and loads saved annotations for the new page.
   */
  useEffect(() => {
    if (!canvas) return;
    
    canvas.clear();
    
    const savedJSON = pageAnnotations[currentPage];
    if (savedJSON) {
      canvas.loadFromJSON(savedJSON, () => {
        canvas.renderAll();
        
        // Re-apply brush settings after load
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        canvas.freeDrawingBrush.color = penColor;
        canvas.freeDrawingBrush.width = penSize;
      });
    }
  }, [currentPage, canvas]);

  /**
   * Update canvas dimensions when document dimensions change.
   */
  useEffect(() => {
    if (canvas && pdfDimensions.width > 0 && pdfDimensions.height > 0) {
      canvas.setWidth(pdfDimensions.width);
      canvas.setHeight(pdfDimensions.height);
      canvas.calcOffset();
      canvas.renderAll();
    }
  }, [canvas, pdfDimensions.width, pdfDimensions.height]);

  /**
   * Update brush settings when pen color/size changes.
   */
  useEffect(() => {
    if (!canvas) return;
    
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.color = penColor;
    canvas.freeDrawingBrush.width = penSize;
  }, [canvas, penColor, penSize]);

  // ==================== Document Load Handlers ====================
  
  /**
   * Called when PDF document loads successfully.
   * Sets total page count for navigation.
   */
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  /**
   * Called when a PDF page loads.
   * Sets canvas dimensions to match rendered page.
   */
  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: PDF_SCALE });
    setPdfDimensions({
      width: viewport.width,
      height: viewport.height,
    });
  };

  /**
   * Called when an image loads.
   * Calculates optimal display size while storing original dimensions.
   */
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    
    const { width, height } = calculateDisplayDimensions(naturalWidth, naturalHeight);
    
    setPdfDimensions({ width, height });
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // ==================== Drawing Actions ====================
  
  /**
   * Removes the last drawn object (undo).
   */
  const handleUndo = () => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  /**
   * Clears all annotations from the current page.
   */
  const handleClear = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  /**
   * Saves current page annotations to state.
   * Called before page change to persist annotations.
   */
  const saveCurrentPageAnnotations = () => {
    if (!canvas) return;
    
    const json = canvas.toJSON();
    setPageAnnotations(prev => ({
      ...prev,
      [currentPage]: json,
    }));
  };

  // ==================== Save Handler ====================
  
  /**
   * Main save handler.
   * Collects all annotations across pages and generates output file.
   */
  const handleSave = async () => {
    if (!canvas) return;
    if (requireComment && !comment.trim()) {
      alert("Please add a comment describing your changes before saving.");
      return;
    }

    // Save current page annotations first
    const currentJson = canvas.toJSON();
    const allAnnotations = { ...pageAnnotations, [currentPage]: currentJson };

    setIsLoading(true);
    
    try {
      let blob;
      
      if (isPdf) {
        blob = await saveAnnotatedPdf({ pdfUrl, allAnnotations });
      } else {
        blob = await saveAnnotatedImage({
          imageUrl: pdfUrl,
          annotationsJson: currentJson,
          displayDimensions: pdfDimensions,
          originalDimensions,
        });
      }
      
      await onSave(blob, comment);
    } catch (error) {
      console.error('Error saving annotations:', error);
      alert('Failed to save annotations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== Page Navigation ====================
  
  /**
   * Changes PDF page with annotation persistence.
   * @param {number} offset - Page offset (+1 or -1)
   */
  const changePage = (offset) => {
    saveCurrentPageAnnotations();
    setCurrentPage((prevPage) => {
      const newPage = prevPage + offset;
      return Math.max(1, Math.min(newPage, numPages || 1));
    });
  };

  // ==================== Render ====================
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="flex h-full w-full max-w-7xl flex-col bg-white">
        
        {/* Header */}
        <EditorHeader
          isPdf={isPdf}
          onCancel={onCancel}
          onSave={handleSave}
          isLoading={isLoading}
          canSave={canSave}
        />

        {/* Drawing Toolbar */}
        <DrawingToolbar
          penSize={penSize}
          setPenSize={setPenSize}
          penColor={penColor}
          setPenColor={setPenColor}
          onUndo={handleUndo}
          onClear={handleClear}
        />

        {/* Document Viewer with Canvas Overlay */}
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
                      scale={PDF_SCALE}
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
                      height: `${pdfDimensions.height}px`,
                    }} 
                    alt="Document to annotate"
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

        {/* Footer: Comment Field and Page Navigation */}
        <div className="border-t border-gray-200 bg-gray-50">
          
          {/* Comment Field (when required) */}
          {requireComment && (
            <CommentField
              comment={comment}
              setComment={setComment}
              isLoading={isLoading}
            />
          )}

          {/* Page Navigation (PDF Only, multi-page) */}
          {isPdf && numPages && numPages > 1 && (
            <PageNavigation
              currentPage={currentPage}
              numPages={numPages}
              onPrevious={() => changePage(-1)}
              onNext={() => changePage(1)}
            />
          )}
          
          {/* Spacer if no pagination but has comment */}
          {(!isPdf || !numPages || numPages <= 1) && requireComment && (
            <div className="h-4"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== PropTypes ====================

PdfEditor.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  isPdf: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  requireComment: PropTypes.bool,
};

export default PdfEditor;
