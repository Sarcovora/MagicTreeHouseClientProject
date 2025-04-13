import { pdfjs } from 'react-pdf';
// Update path to match the file location in public/pdfs directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfs/pdf.min.js';
export default pdfjs;