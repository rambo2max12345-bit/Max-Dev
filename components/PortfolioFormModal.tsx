import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Portfolio, PortfolioCategory, PortfolioType, User } from '../types';
import { fileToBase64 } from '../utils';
import { PlusIcon, TrashIcon, UploadCloudIcon, XIcon } from './icons';
import Spinner from './Spinner';

interface PortfolioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portfolio: Omit<Portfolio, 'id' | 'views' | 'likes' | 'ratings' | 'createdAt' | 'authorName'>, portfolioId?: string) => Promise<void>;
  portfolioToEdit?: Portfolio | null;
  currentUser: User;
}

const PortfolioFormModal: React.FC<PortfolioFormModalProps> = ({ isOpen, onClose, onSave, portfolioToEdit, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>(PortfolioCategory.PERSONNEL);
  const [type, setType] = useState<PortfolioType>(PortfolioType.APPLICATION);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  useEffect(() => {
    if (portfolioToEdit) {
      setTitle(portfolioToEdit.title);
      setDescription(portfolioToEdit.description);
      setCategory(portfolioToEdit.category);
      setType(portfolioToEdit.type);
      setCoverImage(portfolioToEdit.coverImage);
      setAlbumImages(portfolioToEdit.albumImages);
    } else {
      setTitle('');
      setDescription('');
      setCategory(PortfolioCategory.PERSONNEL);
      setType(PortfolioType.APPLICATION);
      setCoverImage(null);
      setAlbumImages([]);
    }
  }, [portfolioToEdit, isOpen]);

  if (!isOpen) return null;

  const processFiles = async (filesToProcess: File[], isCover: boolean) => {
    for (const file of filesToProcess) {
      const fileName = file.name;
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min((prev[fileName] || 0) + 10, 90);
          return { ...prev, [fileName]: newProgress };
        });
      }, 100);

      try {
        const base64 = await fileToBase64(file);
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
        if (isCover) {
          setCoverImage(base64);
        } else {
          setAlbumImages(prev => [...prev, base64]);
        }
        setTimeout(() => {
           setUploadProgress(prev => {
             const newProgress = { ...prev };
             delete newProgress[fileName];
             return newProgress;
           });
        }, 1000);
      } catch (error) {
        console.error("Error converting file to base64", error);
        clearInterval(interval);
        // handle error display
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files), isCover);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files), false);
      e.dataTransfer.clearData();
    }
  };


  const handleRemoveAlbumImage = (index: number) => {
    setAlbumImages(albumImages.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage) {
      alert("Please provide a title and a cover image.");
      return;
    }
    setIsSaving(true);
    const newPortfolio: Omit<Portfolio, 'id' | 'views' | 'likes' | 'ratings' | 'createdAt' | 'authorName'> = {
      authorId: currentUser.id,
      title,
      description,
      category,
      type,
      coverImage,
      albumImages,
    };
    await onSave(newPortfolio, portfolioToEdit?.id);
    setIsSaving(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{portfolioToEdit ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon className="w-7 h-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">ชื่อผลงาน</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
            </div>
             <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">ประเภทผลงาน</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as PortfolioType)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition bg-white">
                {Object.values(PortfolioType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as PortfolioCategory)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition bg-white">
                {Object.values(PortfolioCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบายผลงาน</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"></textarea>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">รูปภาพหน้าปก</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="mx-auto h-24 w-auto rounded-md" />
                  ) : (
                    <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="cover-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-light focus-within:outline-none">
                      <span>อัพโหลดไฟล์</span>
                      <input id="cover-upload" name="cover-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                    </label>
                    <p className="pl-1">หรือลากและวาง</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">อัลบั้มรูปภาพ</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {albumImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Album image ${index + 1}`} className="h-28 w-full object-cover rounded-lg shadow-md" />
                      <button type="button" onClick={() => handleRemoveAlbumImage(index)} className="absolute top-1 right-1 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label 
                    htmlFor="album-upload"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`cursor-pointer flex items-center justify-center h-28 w-full border-2 border-dashed rounded-lg transition-all duration-300 ${
                      isDraggingOver
                        ? 'border-primary bg-primary/10 text-primary scale-105'
                        : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                    }`}
                  >
                      <div className="text-center">
                        {isDraggingOver ? (
                          <>
                            <UploadCloudIcon className="w-8 h-8 mx-auto" />
                            <span className="text-sm font-semibold">วางไฟล์ที่นี่</span>
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-8 h-8 mx-auto"/>
                            <span className="text-sm">เพิ่มรูปภาพ</span>
                          </>
                        )}
                      </div>
                      <input id="album-upload" name="album-upload" type="file" multiple className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                  </label>
              </div>
            </div>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="md:col-span-2 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">กำลังอัพโหลด...</h4>
                {Object.entries(uploadProgress).map(([name, progress]) => (
                  <div key={name}>
                     <p className="text-xs text-gray-500 truncate">{name}</p>
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                       <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s' }}></div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
        <div className="flex justify-end items-center p-6 border-t bg-gray-50">
          <button onClick={onClose} type="button" className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition mr-3">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={isSaving} type="submit" className="px-6 py-2.5 text-white bg-primary rounded-lg hover:bg-opacity-90 transition disabled:bg-gray-400 flex items-center">
            {isSaving ? <Spinner /> : (portfolioToEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผลงาน')}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default PortfolioFormModal;