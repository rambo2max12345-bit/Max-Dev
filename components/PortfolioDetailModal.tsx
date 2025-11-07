
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Portfolio, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, HeartIcon, StarIcon, XIcon } from './icons';

interface PortfolioDetailModalProps {
  portfolio: Portfolio;
  onClose: () => void;
  currentUser: User | null;
  onLike: (id: string) => void;
  onRate: (id: string, score: number) => void;
}

const StarRating: React.FC<{ onRate: (score: number) => void }> = ({ onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const ratingLabels = ["แย่มาก", "แย่", "พอใช้", "ดี", "ยอดเยี่ยม"];
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    title={`${star} - ${ratingLabels[star-1]}`}
                    aria-label={`ให้คะแนน ${star} ดาว`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRate(star)}
                    className="text-gray-400 focus:outline-none"
                >
                    <StarIcon className={`w-6 h-6 transition-colors ${hoverRating >= star ? 'text-warning fill-current' : ''}`}/>
                </button>
            ))}
        </div>
    );
};

const ImagePreviewModal: React.FC<{ images: string[]; startIndex: number; onClose: () => void }> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    
    const goToPrevious = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"><XIcon className="w-8 h-8"/></button>
                <button onClick={goToPrevious} className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-50"><ChevronLeftIcon className="w-8 h-8"/></button>
                
                <img src={images[currentIndex]} alt="Album preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
                
                <button onClick={goToNext} className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-50"><ChevronRightIcon className="w-8 h-8"/></button>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({ portfolio, onClose, currentUser, onLike, onRate }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);

  const avgRating = portfolio.ratings.length > 0 ? portfolio.ratings.reduce((acc, r) => acc + r.score, 0) / portfolio.ratings.length : 0;
  const isLiked = currentUser ? portfolio.likes.includes(currentUser.id) : false;

  const openPreview = (index: number) => {
    setPreviewStartIndex(index);
    setIsPreviewOpen(true);
  };
  
  return ReactDOM.createPortal(
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800 truncate">{portfolio.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <img src={portfolio.coverImage} alt={portfolio.title} className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <span className="inline-block bg-primary-light text-primary-darkest text-sm font-semibold px-3 py-1 rounded-full">{portfolio.type}</span>
              <p className="text-gray-500">โดย <span className="font-semibold text-gray-700">{portfolio.authorName}</span></p>
              <p className="text-gray-600 leading-relaxed">{portfolio.description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-700 pt-4 border-t">
                  <span title="ยอดเข้าชม" className="flex items-center text-lg"><EyeIcon className="w-5 h-5 mr-2"/> {portfolio.views}</span>
                  <button title={isLiked ? 'ยกเลิกการถูกใจ' : 'ถูกใจ'} onClick={() => onLike(portfolio.id)} className={`flex items-center text-lg transition-colors ${isLiked ? 'text-danger' : 'hover:text-danger'}`}>
                      <HeartIcon className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`}/> {portfolio.likes.length}
                  </button>
                  <span title={`คะแนนเฉลี่ย (${portfolio.ratings.length} ratings)`} className="flex items-center text-lg"><StarIcon className="w-5 h-5 mr-2 text-warning fill-current"/> {avgRating.toFixed(1)} ({portfolio.ratings.length})</span>
              </div>
               <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">ให้คะแนนผลงานนี้</h4>
                  <StarRating onRate={(score) => onRate(portfolio.id, score)} />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">อัลบั้มรูปภาพ</h3>
            {portfolio.albumImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {portfolio.albumImages.map((img, index) => (
                  <div key={index} className="cursor-pointer group" onClick={() => openPreview(index)}>
                    <img src={img} alt={`Album image ${index + 1}`} className="h-32 w-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">ไม่มีรูปภาพในอัลบั้ม</p>
            )}
          </div>
        </div>
      </div>
    </div>
    {isPreviewOpen && <ImagePreviewModal images={portfolio.albumImages} startIndex={previewStartIndex} onClose={() => setIsPreviewOpen(false)} />}
    </>,
    document.getElementById('modal-root')!
  );
};

export default PortfolioDetailModal;
