import { pdfjs } from 'react-pdf';

// Configure the PDF.js worker so react-pdf can render documents in the browser.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
