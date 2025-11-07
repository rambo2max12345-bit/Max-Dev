
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Portfolio, ViewMode, PortfolioFilter, UserRole, PortfolioCategory } from './types';
import * as dataService from './services/dataService';
import { FullPageSpinner } from './components/Spinner';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import PortfolioFormModal from './components/PortfolioFormModal';
import { EyeIcon, GridIcon, HeartIcon, ListIcon, LogOutIcon, MoreHorizontalIcon, SearchIcon, StarIcon, UserIcon, UsersIcon, LibraryIcon, PlusIcon } from './components/icons';
import PortfolioDetailModal from './components/PortfolioDetailModal';
import UserManagement from './components/UserManagement';

// Component defined outside App to prevent re-creation on re-renders
const StatCard: React.FC<{ title: string; value: number; gradient: string }> = ({ title, value, gradient }) => (
    <div className={`p-6 rounded-2xl text-white shadow-lg ${gradient}`}>
        <p className="text-lg">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
    </div>
);

// Component defined outside App
const PortfolioCard: React.FC<{ portfolio: Portfolio; onDetails: (p: Portfolio) => void; onLike: (id: string) => void; onRate: (id: string, score: number) => void; currentUser: User | null; }> = ({ portfolio, onDetails, onLike, onRate, currentUser }) => {
    const avgRating = portfolio.ratings.length > 0 ? portfolio.ratings.reduce((acc, r) => acc + r.score, 0) / portfolio.ratings.length : 0;
    const isLiked = currentUser ? portfolio.likes.includes(currentUser.id) : false;

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl group">
            <div className="relative">
                <img src={portfolio.coverImage} alt={portfolio.title} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">{portfolio.type}</div>
                 <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDetails(portfolio)}>
                    <button className="text-white bg-primary rounded-full p-3">
                        <MoreHorizontalIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{portfolio.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{portfolio.authorName}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                        <span className="flex items-center" title="ยอดเข้าชม"><EyeIcon className="w-4 h-4 mr-1"/> {portfolio.views}</span>
                        <button onClick={() => onLike(portfolio.id)} title={isLiked ? 'ยกเลิกการถูกใจ' : 'ถูกใจ'} className={`flex items-center transition-colors ${isLiked ? 'text-danger' : 'hover:text-danger'}`}>
                            <HeartIcon className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`}/> {portfolio.likes.length}
                        </button>
                        <span className="flex items-center" title="คะแนนเฉลี่ย"><StarIcon className="w-4 h-4 mr-1 text-warning fill-current"/> {avgRating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PortfolioRow: React.FC<{ portfolio: Portfolio; onDetails: (p: Portfolio) => void; }> = ({ portfolio, onDetails }) => {
    const avgRating = portfolio.ratings.length > 0 ? portfolio.ratings.reduce((acc, r) => acc + r.score, 0) / portfolio.ratings.length : 0;
    return (
        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onDetails(portfolio)}>
            <td className="p-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={portfolio.coverImage} alt={portfolio.title} />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{portfolio.title}</div>
                        <div className="text-sm text-gray-500">{portfolio.authorName}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{portfolio.type}</span>
            </td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{portfolio.category}</td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{portfolio.views}</td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{portfolio.likes.length}</td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{avgRating.toFixed(1)}</td>
        </tr>
    );
}

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filter, setFilter] = useState<PortfolioFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [activeView, setActiveView] = useState<'home' | 'user_management' | 'portfolio_management'>('home');

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
    const [portfolioToEdit, setPortfolioToEdit] = useState<Portfolio | null>(null);

    const [detailPortfolio, setDetailPortfolio] = useState<Portfolio | null>(null);

    const initializeApp = useCallback(() => {
        setIsLoading(true);
        const allUsers = dataService.getUsers();
        const allPortfolios = dataService.getPortfolios();
        setUsers(allUsers);
        setPortfolios(allPortfolios);
        const loggedInUser = dataService.getCurrentUser();
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
        }
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
        showToast('เข้าสู่ระบบสำเร็จ');
    };

    const handleLogout = () => {
        dataService.logout();
        setCurrentUser(null);
        setActiveView('home');
        setFilter('all');
        showToast('ออกจากระบบแล้ว');
    };
    
    const handleSavePortfolio = async (portfolioData: Omit<Portfolio, 'id' | 'views' | 'likes' | 'ratings' | 'createdAt'| 'authorName'>, portfolioId?: string) => {
        try {
            if (portfolioId) {
                dataService.updatePortfolio(portfolioId, portfolioData);
                showToast('อัปเดตผลงานสำเร็จ');
            } else {
                dataService.createPortfolio(portfolioData);
                showToast('สร้างผลงานใหม่สำเร็จ');
            }
            setPortfolios(dataService.getPortfolios());
            setIsPortfolioFormOpen(false);
            setPortfolioToEdit(null);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'error');
        }
    };
    
    const handleOpenPortfolioForm = (portfolio?: Portfolio) => {
        setPortfolioToEdit(portfolio || null);
        setIsPortfolioFormOpen(true);
    };

    const handleDeletePortfolio = (id: string) => {
       if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้?')) {
         dataService.deletePortfolio(id);
         setPortfolios(dataService.getPortfolios());
         showToast('ลบผลงานสำเร็จ');
         if (activeView === 'portfolio_management') {
           // stay on page
         } else if (detailPortfolio?.id === id) {
           setDetailPortfolio(null);
         }
       }
    };
    
    const handleShowDetails = useCallback((portfolio: Portfolio) => {
        dataService.incrementPortfolioView(portfolio.id);
        setPortfolios(prev => prev.map(p => p.id === portfolio.id ? {...p, views: p.views + 1} : p));
        setDetailPortfolio(portfolio);
    }, [detailPortfolio?.id]);

    const handleLike = useCallback((portfolioId: string) => {
        if (!currentUser) {
            showToast('กรุณาเข้าสู่ระบบเพื่อกดไลค์', 'error');
            return;
        }
        dataService.togglePortfolioLike(portfolioId, currentUser.id);
        setPortfolios(dataService.getPortfolios());
    }, [currentUser]);

    const handleRate = useCallback((portfolioId: string, score: number) => {
        if (!currentUser) {
            showToast('กรุณาเข้าสู่ระบบเพื่อให้คะแนน', 'error');
            return;
        }
        dataService.ratePortfolio(portfolioId, currentUser.id, score);
        const updatedPortfolios = dataService.getPortfolios();
        setPortfolios(updatedPortfolios);
        if(detailPortfolio){
            const updatedDetail = updatedPortfolios.find(p => p.id === detailPortfolio.id);
            setDetailPortfolio(updatedDetail || null);
        }
    }, [currentUser, detailPortfolio]);

    const filteredPortfolios = useMemo(() => {
        return portfolios
            .filter(p => {
                if (filter === 'all') return true;
                if (filter === 'my_portfolios') {
                    return currentUser ? p.authorId === currentUser.id : false;
                }
                return p.category === filter;
            })
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [portfolios, filter, searchTerm, currentUser]);

    const portfolioCounts = useMemo(() => {
        const counts: Record<PortfolioFilter, number> = {
            'all': portfolios.length,
            [PortfolioCategory.COMMANDER]: portfolios.filter(p => p.category === PortfolioCategory.COMMANDER).length,
            [PortfolioCategory.PERSONNEL]: portfolios.filter(p => p.category === PortfolioCategory.PERSONNEL).length,
            'my_portfolios': currentUser ? portfolios.filter(p => p.authorId === currentUser.id).length : 0,
        };
        return counts;
    }, [portfolios, currentUser]);


    if (isLoading) {
        return <FullPageSpinner />;
    }

    const renderHomePage = () => {
        const filterOptions: PortfolioFilter[] = ['all', PortfolioCategory.COMMANDER, PortfolioCategory.PERSONNEL];
        if (currentUser && currentUser.role !== UserRole.ADMIN) {
            filterOptions.push('my_portfolios');
        }

        const filterLabels: Record<PortfolioFilter, string> = {
            'all': 'ทั้งหมด',
            [PortfolioCategory.COMMANDER]: PortfolioCategory.COMMANDER,
            [PortfolioCategory.PERSONNEL]: PortfolioCategory.PERSONNEL,
            'my_portfolios': 'ผลงานของฉัน'
        };

        return (
        <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="ผลงานทั้งหมด" value={portfolios.length} gradient="bg-gradient-to-br from-primary to-teal-400" />
                <StatCard title={PortfolioCategory.COMMANDER} value={portfolioCounts[PortfolioCategory.COMMANDER]} gradient="bg-gradient-to-br from-secondary to-lime-400" />
                <StatCard title={PortfolioCategory.PERSONNEL} value={portfolioCounts[PortfolioCategory.PERSONNEL]} gradient="bg-gradient-to-br from-accent to-orange-400" />
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {filterOptions.map(key => (
                        <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === key ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {filterLabels[key]}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${filter === key ? 'bg-white text-primary' : 'bg-gray-300 text-gray-600'}`}>{portfolioCounts[key]}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 flex-grow sm:flex-grow-0">
                    <div className="relative flex-grow">
                        <input type="text" placeholder="ค้นหาชื่อผลงาน..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-primary focus:border-primary" />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition ${viewMode === 'grid' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}><GridIcon/></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-full transition ${viewMode === 'table' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}><ListIcon/></button>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            {viewMode === 'grid' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPortfolios.map(p => <PortfolioCard key={p.id} portfolio={p} onDetails={handleShowDetails} onLike={handleLike} onRate={handleRate} currentUser={currentUser} />)}
                 </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผลงาน</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ดู</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ไลค์</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {filteredPortfolios.map(p => <PortfolioRow key={p.id} portfolio={p} onDetails={handleShowDetails} />)}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </>
    );
    }

    const renderAdminView = () => (
        <UserManagement 
            users={users} 
            setUsers={setUsers}
            showToast={showToast}
        />
    );
    
    const PortfolioManagement: React.FC = () => {
      const portfoliosForUser = currentUser?.role === UserRole.ADMIN 
        ? portfolios 
        : portfolios.filter(p => p.authorId === currentUser?.id);

      return (
         <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">จัดการผลงาน</h2>
              <button onClick={() => handleOpenPortfolioForm()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
                <PlusIcon className="w-5 h-5"/>
                เพิ่มผลงาน
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อผลงาน</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                        {currentUser?.role === UserRole.ADMIN && <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ผู้สร้าง</th>}
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">วันที่สร้าง</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">การกระทำ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {portfoliosForUser.map(p => (
                        <tr key={p.id}>
                            <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{p.type}</td>
                            {currentUser?.role === UserRole.ADMIN && <td className="p-4 whitespace-nowrap text-sm text-gray-500">{p.authorName}</td>}
                            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => handleOpenPortfolioForm(p)} className="text-primary hover:text-primary-light mr-4">แก้ไข</button>
                                <button onClick={() => handleDeletePortfolio(p.id)} className="text-danger hover:text-red-700">ลบ</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
      );
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 onClick={() => setActiveView('home')} className="text-2xl font-bold text-primary cursor-pointer">Portfolio Showcase</h1>
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2">
                                    <span className="font-semibold">{currentUser.fullName}</span>
                                    <UserIcon className="w-6 h-6 p-1 bg-gray-200 rounded-full" />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">
                                    {currentUser.role === UserRole.ADMIN && (
                                         <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('user_management');}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <UsersIcon className="w-4 h-4 mr-2"/> จัดการผู้ใช้
                                         </a>
                                    )}
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('portfolio_management');}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <LibraryIcon className="w-4 h-4 mr-2"/> จัดการผลงาน
                                    </a>
                                    <a href="#" onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-danger hover:bg-gray-100">
                                       <LogOutIcon className="w-4 h-4 mr-2"/> ออกจากระบบ
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsLoginModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100">
                                <UserIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {activeView === 'home' && renderHomePage()}
                {activeView === 'user_management' && currentUser?.role === UserRole.ADMIN && renderAdminView()}
                {activeView === 'portfolio_management' && currentUser && <PortfolioManagement />}
            </main>

            {/* Modals and Toasts */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} showToast={showToast} />
            {currentUser && <PortfolioFormModal isOpen={isPortfolioFormOpen} onClose={() => {setIsPortfolioFormOpen(false); setPortfolioToEdit(null);}} onSave={handleSavePortfolio} portfolioToEdit={portfolioToEdit} currentUser={currentUser} />}
            {detailPortfolio && <PortfolioDetailModal portfolio={detailPortfolio} onClose={() => setDetailPortfolio(null)} currentUser={currentUser} onLike={handleLike} onRate={handleRate} />}
        </div>
    );
};

export default App;
