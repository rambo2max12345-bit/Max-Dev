
import { User, Portfolio, UserRole, PortfolioCategory, PortfolioType } from '../types';

const USERS_KEY = 'portfolio_users';
const PORTFOLIOS_KEY = 'portfolio_portfolios';
const CURRENT_USER_KEY = 'portfolio_current_user';

// --- Initialization ---

const getInitialUsers = (): User[] => {
  // In a real app, passwords should be hashed.
  return [
    { id: 'user-1', username: 'a', password: 'a', fullName: 'Admin User', role: UserRole.ADMIN },
    { id: 'user-2', username: 'teacher1', password: 'password', fullName: 'Jane Doe', role: UserRole.TEACHER },
    { id: 'user-3', username: 'teacher2', password: 'password', fullName: 'John Smith', role: UserRole.TEACHER },
  ];
};

const getInitialPortfolios = (): Portfolio[] => {
  return [
    {
      id: 'portfolio-1',
      authorId: 'user-2',
      authorName: 'Jane Doe',
      title: 'โปรเจคระบบจัดการห้องสมุด',
      description: 'ระบบที่พัฒนาด้วย React และ Node.js สำหรับจัดการการยืม-คืนหนังสือในห้องสมุดโรงเรียน',
      category: PortfolioCategory.PERSONNEL,
      type: PortfolioType.APPLICATION,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop',
      albumImages: [
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop',
      ],
      views: 152,
      likes: ['user-1', 'user-3'],
      ratings: [{ userId: 'user-1', score: 5 }, { userId: 'user-3', score: 4 }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: 'portfolio-2',
      authorId: 'user-3',
      authorName: 'John Smith',
      title: 'นวัตกรรมการสอนคณิตศาสตร์',
      description: 'สื่อการสอนแบบ Interactive ที่ช่วยให้นักเรียนเข้าใจแนวคิดทางคณิตศาสตร์ที่ซับซ้อนได้ง่ายขึ้น สร้างด้วย Geogebra และ PowerPoint',
      category: PortfolioCategory.COMMANDER,
      type: PortfolioType.OTHER,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop',
      albumImages: [],
      views: 89,
      likes: ['user-2'],
      ratings: [{ userId: 'user-2', score: 5 }],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'portfolio-3',
      authorId: 'user-2',
      authorName: 'Jane Doe',
      title: 'เว็บไซต์ E-learning ภาษาอังกฤษ',
      description: 'แพลตฟอร์มการเรียนรู้ภาษาอังกฤษออนไลน์ที่มีทั้งวิดีโอ, แบบทดสอบ, และเกมส์เพื่อการศึกษา',
      category: PortfolioCategory.PERSONNEL,
      type: PortfolioType.APPLICATION,
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
      albumImages: [
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop'
      ],
      views: 230,
      likes: ['user-1', 'user-2', 'user-3'],
      ratings: [{ userId: 'user-1', score: 4 }, { userId: 'user-3', score: 5 }],
      createdAt: new Date().toISOString(),
    }
  ];
};


export const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(getInitialUsers()));
  }
  if (!localStorage.getItem(PORTFOLIOS_KEY)) {
    localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(getInitialPortfolios()));
  }
};

// Initialize data on first load
initializeData();

// --- Helper Functions ---
const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const savePortfolios = (portfolios: Portfolio[]) => localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(portfolios));
const generateId = () => `id-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

// --- User Management ---

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getUserById = (id: string): User | undefined => {
    return getUsers().find(u => u.id === id);
}

export const login = (username: string, password_param: string): User => {
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (user && user.password === password_param) {
    const userToStore = { ...user };
    delete userToStore.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    return userToStore;
  }
  throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const createUser = (userData: Omit<User, 'id'>) => {
  const users = getUsers();
  if (users.some(u => u.username === userData.username)) {
    throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
  }
  const newUser: User = { ...userData, id: generateId() };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (userId: string, updateData: Partial<Omit<User, 'id'>>) => {
  let users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('ไม่พบผู้ใช้');
  }
  if (updateData.username && users.some(u => u.username === updateData.username && u.id !== userId)) {
      throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
  }
  
  if (updateData.password === '') {
      delete updateData.password;
  }

  users[userIndex] = { ...users[userIndex], ...updateData };
  saveUsers(users);
  return users[userIndex];
};


export const deleteUser = (userId: string) => {
  let users = getUsers();
  const userToDelete = users.find(u => u.id === userId);
  if (userToDelete?.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
    throw new Error('ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้');
  }
  users = users.filter(u => u.id !== userId);
  saveUsers(users);
};


// --- Portfolio Management ---

export const getPortfolios = (): Portfolio[] => {
  return JSON.parse(localStorage.getItem(PORTFOLIOS_KEY) || '[]');
};

export const getPortfolioById = (id: string): Portfolio | undefined => {
  return getPortfolios().find(p => p.id === id);
}

export const createPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'views' | 'likes' | 'ratings' | 'createdAt' | 'authorName'>): Portfolio => {
    const portfolios = getPortfolios();
    const author = getUserById(portfolioData.authorId);
    if (!author) throw new Error('ไม่พบผู้เขียน');

    const newPortfolio: Portfolio = {
        ...portfolioData,
        id: generateId(),
        authorName: author.fullName,
        views: 0,
        likes: [],
        ratings: [],
        createdAt: new Date().toISOString(),
    };
    portfolios.push(newPortfolio);
    savePortfolios(portfolios);
    return newPortfolio;
}

export const updatePortfolio = (portfolioId: string, updateData: Partial<Omit<Portfolio, 'id'>>) => {
    let portfolios = getPortfolios();
    const portfolioIndex = portfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex === -1) throw new Error('ไม่พบผลงาน');
    
    portfolios[portfolioIndex] = { ...portfolios[portfolioIndex], ...updateData };
    savePortfolios(portfolios);
    return portfolios[portfolioIndex];
}

export const deletePortfolio = (portfolioId: string) => {
    let portfolios = getPortfolios();
    portfolios = portfolios.filter(p => p.id !== portfolioId);
    savePortfolios(portfolios);
}

export const incrementPortfolioView = (portfolioId: string) => {
    const portfolio = getPortfolioById(portfolioId);
    if (portfolio) {
        updatePortfolio(portfolioId, { views: (portfolio.views || 0) + 1 });
    }
}

export const togglePortfolioLike = (portfolioId: string, userId: string) => {
    const portfolio = getPortfolioById(portfolioId);
    if (!portfolio) return;
    const likes = portfolio.likes || [];
    const userIndex = likes.indexOf(userId);

    if (userIndex === -1) {
        likes.push(userId);
    } else {
        likes.splice(userIndex, 1);
    }
    updatePortfolio(portfolioId, { likes });
}

export const ratePortfolio = (portfolioId: string, userId: string, score: number) => {
    const portfolio = getPortfolioById(portfolioId);
    if (!portfolio) return;
    
    const ratings = portfolio.ratings || [];
    const existingRatingIndex = ratings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
        ratings[existingRatingIndex].score = score;
    } else {
        ratings.push({ userId, score });
    }
    updatePortfolio(portfolioId, { ratings });
}
