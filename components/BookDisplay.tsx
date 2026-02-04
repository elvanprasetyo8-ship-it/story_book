
import React, { useRef, useState } from 'react';
import { StoryBook } from '../types';
import { Download, ChevronLeft, ChevronRight, Home, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface BookDisplayProps {
  book: StoryBook;
  onReset: () => void;
}

const BookDisplay: React.FC<BookDisplayProps> = ({ book, onReset }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);

  const totalPages = book.pages.length;

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  const downloadPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Export each page individually
    for (let i = 0; i < book.pages.length; i++) {
        const pageId = `page-container-${i}`;
        const element = document.getElementById(pageId);
        if (element) {
            // Momentarily show the element to capture it
            const originalStyle = element.style.display;
            element.style.display = 'block';
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            element.style.display = originalStyle;
        }
    }

    pdf.save(`${book.title.replace(/\s+/g, '_')}.pdf`);
    setIsExporting(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Navigation Buttons & Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <Home size={20} />
          <span>Buat Cerita Baru</span>
        </button>
        <div className="flex gap-4">
          <button 
            onClick={downloadPDF}
            disabled={isExporting}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg transition-all ${
              isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-1'
            }`}
          >
            {isExporting ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                </>
            ) : (
                <>
                    <Download size={20} />
                    <span>Unduh PDF</span>
                </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden container for PDF export */}
      <div className="hidden">
          {book.pages.map((page, idx) => (
              <div 
                key={`print-${idx}`} 
                id={`page-container-${idx}`}
                className="w-[210mm] h-[297mm] bg-white p-12 flex flex-col items-center justify-center relative border border-gray-100"
              >
                  <div className="w-full flex flex-col items-center gap-10">
                    <h2 className="text-3xl font-serif text-gray-800 text-center">{book.title}</h2>
                    <img src={page.imageUrl} alt="Halaman" className="w-4/5 rounded-lg shadow-md aspect-[4/3] object-cover" />
                    <div className="w-4/5 text-center px-4">
                        <p className="text-2xl leading-relaxed text-gray-700 font-serif whitespace-pre-wrap">{page.content}</p>
                        <p className="mt-8 text-gray-400 text-sm">Halaman {page.pageNumber} • Penulis: {book.author}</p>
                    </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Visual Book Container */}
      <div className="relative flex flex-col items-center">
        <div className="w-full max-w-4xl aspect-[4/5] md:aspect-[16/9] bg-white rounded-2xl book-shadow flex flex-col md:flex-row overflow-hidden border border-amber-100">
          
          {/* Left Side (Image) */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full bg-amber-50 relative overflow-hidden group">
            <img 
              src={book.pages[currentPage].imageUrl} 
              alt="Halaman Cerita"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Right Side (Text) */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center bg-white border-l border-amber-50">
            <div className="mb-4">
              <span className="text-indigo-500 font-bold tracking-widest text-xs uppercase">{book.genre}</span>
              <h1 className="text-3xl font-serif text-gray-800 mt-1 mb-6 leading-tight">{book.title}</h1>
            </div>
            
            <div className="flex-grow">
              <p className="text-xl leading-relaxed text-gray-700 italic font-serif transition-opacity duration-300">
                "{book.pages[currentPage].content}"
              </p>
            </div>

            <div className="mt-8 flex justify-between items-center text-gray-400 text-sm">
              <span className="font-medium">Halaman {currentPage + 1} dari {totalPages}</span>
              <span className="italic">Karya: {book.author}</span>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-4 mt-8">
          <button 
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`p-4 rounded-full transition-all ${
              currentPage === 0 ? 'bg-gray-100 text-gray-300' : 'bg-white text-indigo-600 shadow-md hover:shadow-lg hover:scale-110'
            }`}
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`p-4 rounded-full transition-all ${
              currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-300' : 'bg-white text-indigo-600 shadow-md hover:shadow-lg hover:scale-110'
            }`}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDisplay;
