
import React, { useState, useCallback } from 'react';
import { AppState, StoryBook, GenreType } from './types';
import { generateStoryOutline, generatePageImage } from './services/geminiService';
import LoadingOverlay from './components/LoadingOverlay';
import BookDisplay from './components/BookDisplay';
// Added missing Download icon to imports
import { Sparkles, BookOpen, PenTool, Layers, Download } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<GenreType>('Fabel');
  const [book, setBook] = useState<StoryBook | null>(null);
  const [loadingMsg, setLoadingMsg] = useState({ title: '', sub: '' });

  const genres: GenreType[] = ['Petualangan', 'Fabel', 'Fantasi', 'Edukasi', 'Misteri'];

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setState(AppState.GENERATING_TEXT);
      setLoadingMsg({ 
        title: 'Sedang Merangkai Kata...', 
        sub: 'Kecerdasan buatan kami sedang menulis petualangan ajaib untukmu.' 
      });

      const storyOutline = await generateStoryOutline(prompt, genre);
      setBook(storyOutline);

      setState(AppState.GENERATING_IMAGES);
      setLoadingMsg({ 
        title: 'Melukis Imajinasi...', 
        sub: 'Hampir selesai! Kami sedang menggambar ilustrasi untuk setiap halaman.' 
      });

      // Generate all images
      const updatedPages = await Promise.all(
        storyOutline.pages.map(async (page, index) => {
          try {
            const imageUrl = await generatePageImage(page.imagePrompt);
            return { ...page, imageUrl };
          } catch (error) {
            console.error(`Error generating image for page ${index}:`, error);
            return { ...page, imageUrl: `https://picsum.photos/seed/${index}/800/600` };
          }
        })
      );

      setBook({ ...storyOutline, pages: updatedPages });
      setState(AppState.VIEWING);
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setBook(null);
    setPrompt('');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      {state === AppState.IDLE && (
        <main className="container mx-auto px-6 pt-12 max-w-4xl">
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full mb-6 font-bold">
              <Sparkles size={20} />
              <span>Bertenaga Gemini AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              Ubah Imajinasi Jadi <span className="text-indigo-600 underline decoration-wavy decoration-indigo-200">Dongeng Nyata</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tulis satu kalimat petualangan, dan biarkan AI kami membuatkan buku cerita lengkap dengan ilustrasi yang cantik.
            </p>
          </header>

          <form onSubmit={handleCreateStory} className="bg-white p-8 rounded-3xl book-shadow border border-amber-50">
            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-3 flex items-center gap-2">
                <PenTool size={18} className="text-indigo-500" />
                Tema Cerita Kamu?
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Petualangan kucing oren yang ingin menjadi astronot..."
                className="w-full h-32 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none text-lg"
                required
              />
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                Pilih Genre
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      genre === g 
                        ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transform hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200"
            >
              <BookOpen size={24} />
              Buat Buku Cerita Sekarang
            </button>
          </form>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenTool size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Penulis AI Pintar</h3>
              <p className="text-gray-500">Menciptakan narasi yang menyentuh hati dalam Bahasa Indonesia.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Ilustrasi Magis</h3>
              <p className="text-gray-500">Gambar yang dihasilkan khusus untuk menyesuaikan alur ceritamu.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {/* Download icon is now correctly imported */}
                <Download size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Unduh PDF</h3>
              <p className="text-gray-500">Simpan karyamu selamanya dan bagikan dengan orang tersayang.</p>
            </div>
          </div>
        </main>
      )}

      {(state === AppState.GENERATING_TEXT || state === AppState.GENERATING_IMAGES) && (
        <LoadingOverlay 
          message={loadingMsg.title}
          subMessage={loadingMsg.sub}
        />
      )}

      {state === AppState.VIEWING && book && (
        <div className="animate-in fade-in zoom-in duration-500 pt-10">
          <BookDisplay book={book} onReset={handleReset} />
        </div>
      )}

      {state === AppState.ERROR && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ups! Terjadi Kesalahan</h2>
          <p className="text-gray-500 mb-8 max-w-sm">Mohon maaf, AI kami sedang lelah. Silakan coba lagi sebentar lagi.</p>
          <button 
            onClick={handleReset}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
