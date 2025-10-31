import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

// Use a locally-bundled worker to avoid CORS issues during development.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
