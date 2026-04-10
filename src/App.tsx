/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Edit2,
  Check,
  Tag,
  DollarSign,
  ShoppingCart,
  Home,
  Zap,
  Droplets,
  Wifi,
  ShoppingBag,
  Palmtree,
  Minus,
  Wallet,
  Car,
  Utensils,
  HeartPulse,
  GraduationCap,
  Gift,
  Briefcase,
  Coffee,
  Smartphone,
  Tv,
  Gamepad,
  Music,
  Book,
  Plane,
  Bus,
  Bike,
  Fuel,
  ShoppingBasket,
  CreditCard,
  Banknote,
  Coins,
  Loader2, 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Share2, 
  Mail, 
  MessageCircle,
  Download,
  LogIn,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Plus,
  X,
  Target,
  Settings,
  Search,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Database,
  Info,
  ExternalLink,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Calendar,
  ChevronDown,
  AlignLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  User
} from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
import { Logo } from './components/Logo';

// Extend jsPDF with autotable types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface TransactionData {
  id: string;
  data: string;
  tipo: 'Entrada' | 'Saída';
  valor: number;
  categoria: string;
  descricao: string;
  subtipo?: 'Gasto' | 'Despesa';
  userId: string;
  createdAt: any;
}

interface CategoryData {
  id: string;
  name: string;
  tipo: 'Entrada' | 'Saída';
  icon?: string;
  userId: string;
  createdAt?: any;
}

type TabType = 'dashboard' | 'ganhos' | 'gastos' | 'relatorio';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      try {
        const parsed = JSON.parse((this as any).state.error.message);
        if (parsed.error && parsed.operationType) {
          errorMessage = `Erro no Firestore (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        errorMessage = (this as any).state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ops! Algo deu errado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const ICON_OPTIONS = [
  'DollarSign', 'ShoppingCart', 'TrendingUp', 'TrendingDown', 'Home', 'Zap', 
  'Droplets', 'Wifi', 'ShoppingBag', 'Palmtree', 'Minus', 'Plus', 'Wallet', 
  'Car', 'Utensils', 'HeartPulse', 'GraduationCap', 'Gift', 'Briefcase', 
  'Coffee', 'Smartphone', 'Tv', 'Gamepad', 'Music', 'Book', 'Plane', 
  'Bus', 'Bike', 'Fuel', 'ShoppingBasket', 'CreditCard', 'Banknote', 'Coins', 'Tag'
];

const ICON_EMOJI_MAP: { [key: string]: string } = {
  DollarSign: '💰', ShoppingCart: '🛒', TrendingUp: '📈', TrendingDown: '📉', 
  Home: '🏠', Zap: '⚡', Droplets: '💧', Wifi: '🌐', ShoppingBag: '🛍️', 
  Palmtree: '🌴', Minus: '➖', Plus: '➕', Wallet: '👛', Car: '🚗', 
  Utensils: '🍴', HeartPulse: '❤️', GraduationCap: '🎓', Gift: '🎁', 
  Briefcase: '💼', Coffee: '☕', Smartphone: '📱', Tv: '📺', Gamepad: '🎮', 
  Music: '🎵', Book: '📖', Plane: '✈️', Bus: '🚌', Bike: '🚲', Fuel: '⛽', 
  ShoppingBasket: '🧺', CreditCard: '💳', Banknote: '💵', Coins: '🪙', Tag: '🏷️'
};

const ICON_MAP: { [key: string]: any } = {
  DollarSign, ShoppingCart, TrendingUp, TrendingDown, Home, Zap, 
  Droplets, Wifi, ShoppingBag, Palmtree, Minus, Plus, Wallet, 
  Car, Utensils, HeartPulse, GraduationCap, Gift, Briefcase, 
  Coffee, Smartphone, Tv, Gamepad, Music, Book, Plane, 
  Bus, Bike, Fuel, ShoppingBasket, CreditCard, Banknote, Coins, Tag
};

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e'];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [spendingGoal, setSpendingGoal] = useState<number>(() => {
    const saved = localStorage.getItem('spendingGoal');
    return saved ? Number(saved) : 5000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(spendingGoal.toString());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryIcon, setEditCategoryIcon] = useState('Tag');
  const [chartView, setChartView] = useState<'distribution' | 'cashflow'>('distribution');
  const [scriptURL, setScriptURL] = useState(() => {
    return localStorage.getItem('scriptURL') || import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  });

  useEffect(() => {
    localStorage.setItem('spendingGoal', spendingGoal.toString());
  }, [spendingGoal]);

  useEffect(() => {
    localStorage.setItem('scriptURL', scriptURL);
  }, [scriptURL]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Tag');
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    categoria: '',
    descricao: '',
    subtipo: 'Gasto' as 'Gasto' | 'Despesa',
  });

  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasAcceptedLGPD, setHasAcceptedLGPD] = useState(() => {
    return localStorage.getItem('oyvey_lgpd_accepted') === 'true';
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    valor: 0,
    categoria: '',
    descricao: '',
    data: '',
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    subtipo: 'Gasto' as 'Gasto' | 'Despesa' | null
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirmation = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
  }) => {
    setConfirmModal({
      isOpen: true,
      ...config
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryIconMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    categories.forEach(c => {
      map[`${c.name}_${c.tipo}`] = c.icon || 'Tag';
    });
    return map;
  }, [categories]);

  const getCategoryIcon = (categoryName: string, type: 'Entrada' | 'Saída', size: number = 14) => {
    const iconName = categoryIconMap[`${categoryName}_${type}`] || 'Tag';
    const IconComponent = ICON_MAP[iconName] || Tag;
    return <IconComponent size={size} />;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [transactions, searchTerm]);

  const chartData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.tipo === 'Saída')
      .forEach(t => {
        expensesByCategory[t.categoria] = (expensesByCategory[t.categoria] || 0) + t.valor;
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value], index) => ({ 
        name, 
        value,
        fill: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const cashFlowData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Sort transactions by date ascending
    const sorted = [...transactions].sort((a, b) => a.data.localeCompare(b.data));

    const dailyNet: { [key: string]: number } = {};
    sorted.forEach(t => {
      const val = t.tipo === 'Entrada' ? t.valor : -t.valor;
      dailyNet[t.data] = (dailyNet[t.data] || 0) + val;
    });

    const data: { date: string; balance: number }[] = [];
    let cumulativeBalance = 0;

    // Get all unique dates in order
    const dates = Object.keys(dailyNet).sort();
    
    dates.forEach(date => {
      cumulativeBalance += dailyNet[date];
      data.push({
        date: date.split('-').slice(1).reverse().join('/'), // DD/MM
        balance: Number(cumulativeBalance.toFixed(2))
      });
    });

    return data;
  }, [transactions]);

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;
    const oldCategory = categories.find(c => c.id === id);
    if (!oldCategory) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Atualizando categoria...');
      
      // Update category document
      await updateDoc(doc(db, 'categories', id), {
        name: editCategoryName.trim(),
        icon: editCategoryIcon
      });

      // If name changed, update all transactions using this category
      if (oldCategory.name !== editCategoryName.trim()) {
        const q = query(
          collection(db, 'transactions'), 
          where('userId', '==', user?.uid),
          where('categoria', '==', oldCategory.name),
          where('tipo', '==', oldCategory.tipo)
        );
        const snapshot = await getDocs(q);
        const updatePromises = snapshot.docs.map(d => 
          updateDoc(doc(db, 'transactions', d.id), { categoria: editCategoryName.trim() })
        );
        await Promise.all(updatePromises);
      }

      setEditingCategory(null);
      setStatus({ type: 'success', message: '✅ Categoria e transações atualizadas!' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    setStatus({ type: 'error', message: `Erro no banco de dados (${operationType}). Verifique o console.` });
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update favicon to use the logo
    const updateFavicon = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a simple version of the logo for the favicon
        ctx.fillStyle = '#4f46e5'; // Indigo 600
        ctx.beginPath();
        ctx.roundRect(0, 0, 32, 32, 8);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(16, 16, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(12, 16);
        ctx.lineTo(16, 20);
        ctx.lineTo(22, 12);
        ctx.stroke();

        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = canvas.toDataURL();
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    };
    updateFavicon();
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || null,
              displayName: currentUser.displayName || null,
              photoURL: currentUser.photoURL || null,
              createdAt: serverTimestamp(),
              role: 'user',
              settings: {
                darkMode,
                spendingGoal
              }
            });
          } else {
            const userData = userSnap.data();
            if (userData?.settings) {
              setDarkMode(userData.settings.darkMode ?? darkMode);
              setSpendingGoal(userData.settings.spendingGoal ?? spendingGoal);
            }
            await setDoc(userRef, {
              email: currentUser.email || null,
              displayName: currentUser.displayName || null,
              photoURL: currentUser.photoURL || null,
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (error) {
          console.error("User Sync Error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync settings to Firestore
  useEffect(() => {
    if (user && isAuthReady) {
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, {
        'settings.darkMode': darkMode,
        'settings.spendingGoal': spendingGoal
      }).catch(err => console.error("Failed to sync settings:", err));
    }
  }, [darkMode, spendingGoal, user, isAuthReady]);

  // Firestore Listener
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TransactionData[];
      
      // Ordenação no cliente para evitar erro de índice composto no Firestore
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA; // decrescente
      });
      
      setTransactions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, [user]);

  // Categories Listener
  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryData[];
      
      // Ordenação no cliente para evitar erro de índice composto no Firestore
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB; // crescente
      });
      
      if (data.length === 0) {
        // Bootstrap default categories
        const defaults: Omit<CategoryData, 'id'>[] = [
          { name: 'Salário', tipo: 'Entrada', icon: 'DollarSign', userId: user.uid },
          { name: 'Venda', tipo: 'Entrada', icon: 'ShoppingCart', userId: user.uid },
          { name: 'Investimento', tipo: 'Entrada', icon: 'TrendingUp', userId: user.uid },
          { name: 'Aluguel', tipo: 'Saída', icon: 'Home', userId: user.uid },
          { name: 'Luz', tipo: 'Saída', icon: 'Zap', userId: user.uid },
          { name: 'Água', tipo: 'Saída', icon: 'Droplets', userId: user.uid },
          { name: 'Internet', tipo: 'Saída', icon: 'Wifi', userId: user.uid },
          { name: 'Mercado', tipo: 'Saída', icon: 'ShoppingBag', userId: user.uid },
          { name: 'Lazer', tipo: 'Saída', icon: 'Palmtree', userId: user.uid },
          { name: 'Outros', tipo: 'Saída', icon: 'Minus', userId: user.uid },
          { name: 'Outros', tipo: 'Entrada', icon: 'Plus', userId: user.uid },
        ];
        defaults.forEach(cat => {
          addDoc(collection(db, 'categories'), {
            ...cat,
            createdAt: serverTimestamp()
          }).catch(err => console.error("Error bootstrapping category:", err));
        });
      }
      setCategories(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    return () => unsubscribe();
  }, [user]);

  const totals = useMemo(() => {
    const ganhos = transactions
      .filter(t => t.tipo === 'Entrada')
      .reduce((acc, t) => acc + t.valor, 0);
    const gastos = transactions
      .filter(t => t.tipo === 'Saída')
      .reduce((acc, t) => acc + t.valor, 0);
    const saldo = ganhos - gastos;
    let gaugePercent = 50;
    if (ganhos + gastos > 0) {
      gaugePercent = (ganhos / (ganhos + gastos)) * 100;
    }
    return { ganhos, gastos, saldo, gaugePercent };
  }, [transactions]);

  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setLoadingMessage('Registrando transação...');
    setStatus({ type: null, message: '' });

    const tipo: 'Entrada' | 'Saída' = activeTab === 'ganhos' ? 'Entrada' : 'Saída';
    const subtipo = activeTab === 'ganhos' ? null : formData.subtipo;

    if (!formData.categoria) {
      setStatus({ type: 'error', message: 'Por favor, selecione uma categoria.' });
      setIsLoading(false);
      return;
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setStatus({ type: 'error', message: 'Por favor, insira um valor válido maior que zero.' });
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      tipo,
      subtipo,
      valor: parseFloat(formData.valor) || 0,
      userId: user.uid,
      createdAt: serverTimestamp()
    };

    try {
      // Save to Firestore
      await addDoc(collection(db, 'transactions'), payload);

      // Optional: Save to Google Sheets if URL exists
      if (scriptURL) {
        fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        }).catch(err => console.error("Sheets Error:", err));
      }

      setStatus({
        type: 'success',
        message: `✅ ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} registrado com sucesso!`,
      });
      
      setFormData({
        data: new Date().toISOString().split('T')[0],
        valor: '',
        categoria: '',
        descricao: '',
        subtipo: 'Gasto',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategoryName.trim()) return;

    const tipo: 'Entrada' | 'Saída' = activeTab === 'ganhos' ? 'Entrada' : 'Saída';
    
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        tipo,
        icon: newCategoryIcon,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewCategoryName('');
      setNewCategoryIcon('Tag');
      setIsAddingCategory(false);
      setStatus({ type: 'success', message: '✅ Categoria adicionada!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const generatePDF = (targetDate?: string) => {
    const doc = new jsPDF();
    const displayDate = targetDate 
      ? new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');
    
    const filteredTransactions = targetDate 
      ? transactions.filter(t => t.data === targetDate)
      : transactions;

    const dailyTotals = targetDate ? {
      ganhos: filteredTransactions.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0),
      gastos: filteredTransactions.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0),
    } : totals;
    
    const dailySaldo = dailyTotals.ganhos - dailyTotals.gastos;

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('OyVey Accounting', 14, 22);
    
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text(targetDate ? `Relatório Diário - ${displayDate}` : 'Relatório Financeiro Geral', 14, 32);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 36, 196, 36);

    doc.setFontSize(12);
    doc.text(`Resumo Financeiro:`, 14, 45);
    doc.text(`Total Ganhos: R$ ${(dailyTotals.ganhos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 52);
    doc.text(`Total Gastos: R$ ${(dailyTotals.gastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 58);
    doc.setFont('helvetica', 'bold');
    doc.text(`Saldo: R$ ${(dailySaldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 64);
    doc.setFont('helvetica', 'normal');

    const tableData = filteredTransactions.map(t => [
      t.data,
      t.tipo,
      t.subtipo || '-',
      `R$ ${(t.valor || 0).toFixed(2)}`,
      t.categoria,
      t.descricao || '-'
    ]);

    doc.autoTable({
      startY: 75,
      head: [['Data', 'Tipo', 'Subtipo', 'Valor', 'Categoria', 'Descrição']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 75 }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Página ${i} de ${pageCount} - Gerado por OyVey Accounting`, 14, doc.internal.pageSize.height - 10);
    }

    return doc;
  };

  const handleDownloadPDF = (isDaily: boolean = false) => {
    const doc = generatePDF(isDaily ? reportDate : undefined);
    const fileName = isDaily ? `relatorio_diario_${reportDate}.pdf` : `relatorio_geral_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleSharePDF = async (isDaily: boolean = false) => {
    const doc = generatePDF(isDaily ? reportDate : undefined);
    const pdfBlob = doc.output('blob');
    const fileName = isDaily ? `relatorio_diario_${reportDate}.pdf` : `relatorio_geral.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Relatório Financeiro OyVey',
          text: `Confira o meu relatório financeiro ${isDaily ? 'do dia ' + reportDate : 'geral'}.`,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        // Fallback to text share if file share fails
        handleShareWhatsApp(isDaily);
      }
    } else {
      // Fallback for browsers that don't support file sharing
      handleShareWhatsApp(isDaily);
      handleDownloadPDF(isDaily);
      setStatus({ type: 'success', message: 'PDF baixado! Agora você pode anexá-lo manualmente.' });
    }
  };

  const handleShareWhatsApp = (isDaily: boolean = false) => {
    const targetTransactions = isDaily ? transactions.filter(t => t.data === reportDate) : transactions;
    const dailyTotals = isDaily ? {
      ganhos: targetTransactions.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0),
      gastos: targetTransactions.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0),
    } : totals;
    const saldo = dailyTotals.ganhos - dailyTotals.gastos;

    const text = `*Relatório Financeiro OyVeyAccounting*\n${isDaily ? 'Data: ' + reportDate : 'Relatório Geral'}\n\n*Resumo:*\n- Ganhos: R$ ${dailyTotals.ganhos.toFixed(2)}\n- Gastos: R$ ${dailyTotals.gastos.toFixed(2)}\n- Saldo: R$ ${saldo.toFixed(2)}\n\n_Gerado pelo App OyVeyAccounting_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = (isDaily: boolean = false) => {
    const targetTransactions = isDaily ? transactions.filter(t => t.data === reportDate) : transactions;
    const dailyTotals = isDaily ? {
      ganhos: targetTransactions.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0),
      gastos: targetTransactions.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0),
    } : totals;
    const saldo = dailyTotals.ganhos - dailyTotals.gastos;

    const subject = `Relatório Financeiro - ${isDaily ? reportDate : 'Geral'}`;
    const body = `Resumo Financeiro ${isDaily ? 'do dia ' + reportDate : 'Geral'}:\n\nGanhos: R$ ${dailyTotals.ganhos.toFixed(2)}\nGastos: R$ ${dailyTotals.gastos.toFixed(2)}\nSaldo: R$ ${saldo.toFixed(2)}\n\nConfira os detalhes no anexo (gerado pelo app).`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getGaugeColor = () => {
    if (totals.gaugePercent > 66) return 'bg-green-500';
    if (totals.gaugePercent > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleEditClick = (t: TransactionData) => {
    setEditingTransaction(t.id);
    setEditFormData({
      valor: t.valor,
      categoria: t.categoria,
      descricao: t.descricao || '',
      data: t.data,
      tipo: t.tipo,
      subtipo: t.subtipo || null
    });
  };

  const handleUpdateTransaction = async (id: string) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Atualizando transação...');
      await updateDoc(doc(db, 'transactions', id), {
        valor: Number(editFormData.valor),
        categoria: editFormData.categoria,
        descricao: editFormData.descricao,
        data: editFormData.data,
        tipo: editFormData.tipo,
        subtipo: editFormData.subtipo
      });
      setEditingTransaction(null);
      setStatus({ type: 'success', message: '✅ Transação atualizada!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    
    askConfirmation({
      title: '⚠️ ATENÇÃO',
      message: 'Isso excluirá TODAS as suas transações permanentemente. Esta ação não pode ser desfeita. Deseja continuar?',
      type: 'danger',
      confirmText: 'Sim, Resetar Tudo',
      onConfirm: async () => {
        setIsLoading(true);
        setLoadingMessage('Limpando dados...');
        try {
          const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'transactions', d.id)));
          await Promise.all(deletePromises);
          setStatus({ type: 'success', message: '🧹 Todos os dados foram resetados!' });
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'transactions');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleAcceptLGPD = () => {
    localStorage.setItem('oyvey_lgpd_accepted', 'true');
    setHasAcceptedLGPD(true);
  };

  if (!isAuthReady) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md glass-card rounded-[2.5rem] p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="flex justify-center mb-10">
              <div className="p-6 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-3xl">
                <Logo 
                  className="w-16 h-16" 
                  showText={false}
                />
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">OyVey</h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] mb-8">Accounting</p>
            <p className="text-slate-500 dark:text-slate-400 mb-12 leading-relaxed text-lg font-medium">
              Sua contabilidade inteligente e organizada.
            </p>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-4 bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] group"
            >
              <div className="bg-white/20 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <LogIn className="w-6 h-6" />
              </div>
              <span className="text-lg">Entrar com Google</span>
            </button>
            <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
              Ao entrar, você concorda com nossos termos de uso.
            </p>
          </motion.div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col items-center p-2 sm:p-4 font-sans pb-32 transition-colors duration-500 mesh-gradient ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="w-full max-w-4xl my-6 sm:my-10 flex flex-col sm:flex-row justify-between items-center px-4 gap-6 sm:gap-0">
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <Logo />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 ml-1">
            Olá, <span className="text-indigo-500">{user.displayName?.split(' ')[0]}</span>! 👋
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setDarkMode(false)}
              className={`p-2 rounded-xl transition-all ${!darkMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => setDarkMode(true)}
              className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <div className="h-8 sm:h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2 hidden sm:block"></div>
          
          <div className="flex items-center gap-2 sm:gap-3 group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold tracking-tight">{user.displayName}</p>
              <button onClick={handleLogout} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Sair</button>
            </div>
            <div className="relative">
              <img src={user.photoURL || ''} alt="User" className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-500 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:rotate-90"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Financial Gauge & Summary */}
      {activeTab === 'dashboard' && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="md:col-span-2 neo-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Saúde Financeira</h3>
                <p className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
                  Status: <span className={`gradient-text ${totals.gaugePercent > 66 ? 'from-emerald-500 to-teal-500' : totals.gaugePercent > 33 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500'}`}>
                    {totals.gaugePercent > 66 ? 'Excelente' : totals.gaugePercent > 33 ? 'Estável' : 'Crítico'}
                  </span>
                </p>
              </div>
              <div className={`p-5 rounded-3xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${totals.gaugePercent > 66 ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' : totals.gaugePercent > 33 ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'}`}>
                <TrendingUp size={32} />
              </div>
            </div>
            
            <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-12 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totals.gaugePercent}%` }}
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 shadow-lg ${getGaugeColor()}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-8 relative z-10">
              <button 
                onClick={() => setActiveTab('ganhos')}
                className="space-y-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-all active:scale-95"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ganhos</p>
                <p className="text-2xl font-black font-mono tracking-tighter text-emerald-500">R$ {totals.ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </button>
              <button 
                onClick={() => setActiveTab('gastos')}
                className="space-y-2 border-x border-slate-100 dark:border-slate-800 px-8 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-all active:scale-95"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gastos</p>
                <p className="text-2xl font-black font-mono tracking-tighter text-rose-500">R$ {totals.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </button>
              <button 
                onClick={() => setActiveTab('relatorio')}
                className="space-y-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-all active:scale-95"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Saldo</p>
                <p className={`text-2xl font-black font-mono tracking-tighter ${totals.saldo >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </button>
            </div>
          </div>

          {/* Spending Goal Card */}
          <div className="neo-card p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mb-24 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-5 bg-indigo-500/10 text-indigo-500 rounded-3xl shadow-lg shadow-indigo-500/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <Target size={32} />
              </div>
              <button 
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-600 transition-all hover:scale-105 active:scale-95"
              >
                {isEditingGoal ? 'Cancelar' : 'Ajustar'}
              </button>
            </div>
            <div className="mb-10 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-3">Meta Mensal</p>
              {isEditingGoal ? (
                <div className="flex items-center gap-3 mt-4">
                  <input 
                    type="number" 
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-mono font-black text-2xl focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setSpendingGoal(Number(tempGoal) || 0);
                      setIsEditingGoal(false);
                    }}
                    className="p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-90 transition-all"
                  >
                    <Check size={28} />
                  </button>
                </div>
              ) : (
                <p className="text-4xl font-black font-mono tracking-tighter text-slate-800 dark:text-white">R$ {spendingGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              )}
            </div>
            <div className="relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                <span>Progresso</span>
                <span className="text-indigo-500 font-black">{Math.min(100, Math.round((totals.gastos / (spendingGoal || 1)) * 100))}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totals.gastos / (spendingGoal || 1)) * 100)}%` }}
                  className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                    (totals.gastos / (spendingGoal || 1)) > 0.9 ? 'bg-rose-500' : (totals.gastos / (spendingGoal || 1)) > 0.7 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid - Charts & Recent Activity */}
      {activeTab === 'dashboard' && (
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Chart Card */}
        {transactions.length > 0 && (
          <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 relative overflow-hidden border-none shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-0">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {chartView === 'distribution' ? 'Distribuição de Gastos' : 'Fluxo de Caixa'}
              </h3>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-auto">
                <button 
                  onClick={() => setChartView('distribution')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    chartView === 'distribution' 
                      ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Categorias
                </button>
                <button 
                  onClick={() => setChartView('cashflow')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    chartView === 'cashflow' 
                      ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Fluxo
                </button>
              </div>
            </div>

            <div className="h-[240px] sm:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'distribution' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
                          const percent = ((data.value / total) * 100).toFixed(1);
                          return (
                            <div className="glass-card p-4 rounded-2xl shadow-2xl border-none text-xs font-bold">
                              <p className="flex items-center gap-2 mb-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill || COLORS[chartData.indexOf(data) % COLORS.length] }}></span>
                                {data.name}
                              </p>
                              <p className="text-indigo-500 font-mono text-lg">R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-slate-400 font-medium mt-1">{percent}% do total</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                    />
                  </PieChart>
                ) : (
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="date" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: darkMode ? '#64748b' : '#94a3b8' }}
                    />
                    <YAxis 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: darkMode ? '#64748b' : '#94a3b8' }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1e293b' : '#fff', 
                        borderColor: 'transparent',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      itemStyle={{ color: darkMode ? '#fff' : '#000' }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activity Card */}
        <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 relative overflow-hidden border-none shadow-2xl">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Atividade Recente</h3>
            <button 
              onClick={() => setActiveTab('relatorio')}
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-all hover:scale-105"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-4 sm:space-y-6 max-h-[320px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between group p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                    t.tipo === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/5'
                  }`}>
                    {t.tipo === 'Entrada' ? <TrendingUp size={18} className="sm:w-6 sm:h-6" /> : <TrendingDown size={18} className="sm:w-6 sm:h-6" />}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">
                      {t.categoria}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{t.data}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm sm:text-lg font-black font-mono tracking-tighter ${t.tipo === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.tipo === 'Entrada' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => { setActiveTab('relatorio'); handleEditClick(t); }} className="text-slate-400 hover:text-indigo-500 transition-colors"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                    <button onClick={() => {
                      askConfirmation({
                        title: 'Excluir Transação',
                        message: 'Deseja excluir esta transação?',
                        type: 'danger',
                        onConfirm: async () => {
                          try {
                            await deleteDoc(doc(db, 'transactions', t.id));
                            setStatus({ type: 'success', message: '🗑️ Transação excluída!' });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.DELETE, `transactions/${t.id}`);
                          }
                        }
                      });
                    }} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <TrendingUp className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem transações recentes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      <motion.main 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl px-4 mb-20"
      >
        {activeTab === 'relatorio' ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-white tracking-tight">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <FileText size={20} className="sm:w-6 sm:h-6" />
                </div>
                Relatório Geral
              </h2>
            </div>
            
            <div className="neo-card p-6 sm:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 sm:mb-8">Resumo do Período</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 sm:mb-3">Transações</p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white font-mono tracking-tighter">{transactions.length}</p>
                  </div>
                  <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 sm:mb-3">Média por Transação</p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white font-mono tracking-tighter">
                      R$ {transactions.length > 0 ? ((totals.ganhos || 0) / transactions.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Filtros e Exportação</p>
              <div className="neo-card p-6 sm:p-10 relative overflow-hidden group">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Selecionar Data</label>
                    <div className="relative group/input">
                      <Calendar className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                      <input 
                        type="date" 
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Pesquisar</label>
                    <div className="relative group/input">
                      <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Categoria ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <button 
                    onClick={() => handleDownloadPDF(true)}
                    className="flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 px-6 sm:px-8 bg-indigo-600 text-white rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    <Download size={18} className="sm:w-5 sm:h-5" /> Baixar PDF
                  </button>
                  <button 
                    onClick={() => handleSharePDF(true)}
                    className="flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 px-6 sm:px-8 bg-emerald-500 text-white rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                    <Share2 size={18} className="sm:w-5 sm:h-5" /> Compartilhar
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">
                {searchTerm ? `Resultados para "${searchTerm}"` : 'Histórico de Transações'}
              </p>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTransactions.length === 0 ? (
                  <div className="glass-card p-12 rounded-[2.5rem] border-none text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  filteredTransactions.map(t => (
                    <motion.div 
                      layout
                      key={t.id} 
                      className="glass-card p-6 rounded-3xl border-none shadow-lg group hover:shadow-xl transition-all"
                    >
                      {editingTransaction === t.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Tipo</label>
                              <select
                                value={editFormData.tipo}
                                onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value as 'Entrada' | 'Saída' })}
                                className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                              >
                                <option value="Entrada">Entrada</option>
                                <option value="Saída">Saída</option>
                              </select>
                            </div>
                            {editFormData.tipo === 'Saída' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Subtipo</label>
                                <select
                                  value={editFormData.subtipo || 'Gasto'}
                                  onChange={(e) => setEditFormData({ ...editFormData, subtipo: e.target.value as 'Gasto' | 'Despesa' })}
                                  className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                  <option value="Gasto">Gasto</option>
                                  <option value="Despesa">Despesa</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Data</label>
                              <input
                                type="date"
                                value={editFormData.data}
                                onChange={(e) => setEditFormData({ ...editFormData, data: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Valor</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editFormData.valor}
                                onChange={(e) => setEditFormData({ ...editFormData, valor: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
                            <select
                              value={editFormData.categoria}
                              onChange={(e) => setEditFormData({ ...editFormData, categoria: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                              {categories
                                .filter(c => c.tipo === editFormData.tipo)
                                .map(c => (
                                  <option key={c.id} value={c.name}>
                                    {ICON_EMOJI_MAP[c.icon || 'Tag']} {c.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Descrição</label>
                            <input
                              type="text"
                              value={editFormData.descricao}
                              onChange={(e) => setEditFormData({ ...editFormData, descricao: e.target.value })}
                              placeholder="Descrição"
                              className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              onClick={() => setEditingTransaction(null)}
                              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleUpdateTransaction(t.id)}
                              className="px-6 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-6 rounded-[2.5rem] hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-500 group relative">
                          <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                              t.tipo === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/5'
                            }`}>
                              {getCategoryIcon(t.categoria, t.tipo, 28)}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-800 dark:text-white tracking-tight">{t.categoria}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.data}</p>
                              {t.descricao && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">"{t.descricao}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className={`text-xl font-black font-mono tracking-tighter ${t.tipo === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {t.tipo === 'Entrada' ? '+' : '-'} R$ {(t.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{t.subtipo || t.tipo}</span>
                            </div>
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button 
                                onClick={() => handleEditClick(t)}
                                className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all active:scale-90 shadow-sm"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  askConfirmation({
                                    title: 'Excluir Transação',
                                    message: 'Deseja excluir esta transação?',
                                    type: 'danger',
                                    onConfirm: async () => {
                                      try {
                                        await deleteDoc(doc(db, 'transactions', t.id));
                                        setStatus({ type: 'success', message: '🗑️ Transação excluída!' });
                                      } catch (error) {
                                        handleFirestoreError(error, OperationType.DELETE, `transactions/${t.id}`);
                                      }
                                    }
                                  });
                                }}
                                className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={() => handleDownloadPDF(false)}
                className="glass-card p-10 rounded-[3rem] border-none shadow-2xl flex items-center justify-between group hover:bg-indigo-500 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:bg-white/20 group-hover:text-white transition-all shadow-lg shadow-indigo-500/5">
                    <Download size={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-white/60 transition-all">Exportar Tudo</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white group-hover:text-white transition-all tracking-tighter mt-1">Baixar PDF Geral</p>
                  </div>
                </div>
                <ArrowUpCircle className="w-10 h-10 text-slate-200 group-hover:text-white rotate-90 transition-all opacity-50 group-hover:opacity-100" />
              </button>

              <button 
                onClick={() => handleSharePDF(false)}
                className="glass-card p-10 rounded-[3rem] border-none shadow-2xl flex items-center justify-between group hover:bg-emerald-500 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-white/20 group-hover:text-white transition-all shadow-lg shadow-emerald-500/5">
                    <Share2 size={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-white/60 transition-all">Compartilhar Tudo</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white group-hover:text-white transition-all tracking-tighter mt-1">Enviar Relatório</p>
                  </div>
                </div>
                <ArrowUpCircle className="w-10 h-10 text-slate-200 group-hover:text-white rotate-90 transition-all opacity-50 group-hover:opacity-100" />
              </button>
            </div>

            <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-4 p-8 rounded-[3rem] bg-rose-500/5 border border-rose-500/10 text-rose-500 font-black uppercase tracking-[0.3em] text-xs hover:bg-rose-500 hover:text-white transition-all shadow-2xl shadow-rose-500/5 active:scale-[0.98] group"
              >
                <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                Resetar Todos os Dados
              </button>
              <p className="text-[10px] font-black text-slate-400 text-center mt-6 uppercase tracking-[0.3em] opacity-60">
                Esta ação é irreversível. Todas as transações serão excluídas permanentemente.
              </p>
            </div>
          </div>
        ) : (activeTab === 'ganhos' || activeTab === 'gastos') ? (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-4 gap-6 sm:gap-0">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 sm:p-4 rounded-2xl shadow-lg ${
                  activeTab === 'ganhos' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {activeTab === 'ganhos' ? <TrendingUp size={20} className="sm:w-6 sm:h-6" /> : <TrendingDown size={20} className="sm:w-6 sm:h-6" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight capitalize">
                    Registrar {activeTab}
                  </h2>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Adicionar novo lançamento manual</p>
                </div>
              </div>
            </div>

            <div className="neo-card p-6 sm:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="data" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Data da Transação</label>
                  <div className="relative group/input">
                    <Calendar className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                    <input
                      type="date"
                      id="data"
                      name="data"
                      value={formData.data}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="valor" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Valor (R$)</label>
                  <div className="relative group/input">
                    <span className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within/input:text-indigo-500 transition-colors">R$</span>
                    <input
                      type="number"
                      id="valor"
                      name="valor"
                      step="0.01"
                      min="0.01"
                      value={formData.valor}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-xl sm:text-2xl font-black font-mono tracking-tighter focus:ring-2 transition-all shadow-inner ${
                        activeTab === 'ganhos' ? 'focus:ring-emerald-500 text-emerald-500' : 'focus:ring-rose-500 text-rose-500'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {activeTab === 'gastos' && (
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Tipo de Saída</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subtipo: 'Gasto' }))}
                        className={`py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                          formData.subtipo === 'Gasto' 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        Gasto (Variável)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subtipo: 'Despesa' }))}
                        className={`py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                          formData.subtipo === 'Despesa' 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        Despesa (Fixa)
                      </button>
                    </div>
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2 space-y-3">
                  <label htmlFor="categoria" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Categoria</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group/input">
                      <Tag className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                      <select
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        required
                        className={`w-full pl-12 sm:pl-14 pr-12 py-4 sm:py-5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold appearance-none focus:ring-2 transition-all shadow-inner ${
                          activeTab === 'ganhos' ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                        }`}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories
                          .filter(c => c.tipo === (activeTab === 'ganhos' ? 'Entrada' : 'Saída'))
                          .map(c => (
                            <option key={c.id} value={c.name}>
                              {ICON_EMOJI_MAP[c.icon || 'Tag']} {c.name}
                            </option>
                          ))
                        }
                      </select>
                      <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="w-full sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all active:scale-90 shadow-sm"
                      title="Nova Categoria"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isAddingCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-1 md:col-span-2 overflow-hidden"
                    >
                      <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Nova Categoria</p>
                          <button onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da categoria..."
                            className="flex-1 px-6 py-4 rounded-2xl border-none bg-white dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                          >
                            Adicionar
                          </button>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Escolher Ícone</p>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-48 overflow-y-auto p-2 custom-scrollbar bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            {ICON_OPTIONS.map(iconName => {
                              const IconComp = ICON_MAP[iconName] || Tag;
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => setNewCategoryIcon(iconName)}
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                                    newCategoryIcon === iconName 
                                      ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <IconComp size={20} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label htmlFor="descricao" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Descrição (Opcional)</label>
                  <div className="relative group/input">
                    <AlignLeft className="absolute left-6 top-6 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" size={18} />
                    <textarea
                      id="descricao"
                      name="descricao"
                      rows={3}
                      value={formData.descricao}
                      onChange={handleChange}
                      className="w-full pl-14 pr-6 py-5 rounded-3xl border-none bg-slate-50 dark:bg-slate-800 text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner resize-none"
                      placeholder="Detalhes adicionais sobre este lançamento..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 relative z-10">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-4 py-6 px-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all duration-300 active:scale-[0.98] ${
                    isLoading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : activeTab === 'ganhos' 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                        : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{loadingMessage || 'Processando...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      <span>Registrar {activeTab}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : null}

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 border transition-colors ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                  : 'bg-red-50 text-red-800 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span className="text-sm font-medium">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-4 sm:px-8 py-2 sm:py-3 flex justify-around items-center z-50 glass-card rounded-[2rem] sm:rounded-[2.5rem] border-white/20 dark:border-slate-800/50 shadow-2xl transition-all duration-500 w-[95%] max-w-xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-2 sm:p-3 rounded-2xl transition-all duration-500 active:scale-90 relative group ${activeTab === 'dashboard' ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-400'}`}
        >
          {activeTab === 'dashboard' && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-indigo-500/10 rounded-2xl -z-10" />}
          <LayoutDashboard className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${activeTab === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab('ganhos')}
          className={`flex flex-col items-center p-2 sm:p-3 rounded-2xl transition-all duration-500 active:scale-90 relative group ${activeTab === 'ganhos' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-400'}`}
        >
          {activeTab === 'ganhos' && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-emerald-500/10 rounded-2xl -z-10" />}
          <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${activeTab === 'ganhos' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">Ganhos</span>
        </button>
        <button 
          onClick={() => setActiveTab('gastos')}
          className={`flex flex-col items-center p-2 sm:p-3 rounded-2xl transition-all duration-500 active:scale-90 relative group ${activeTab === 'gastos' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-rose-400'}`}
        >
          {activeTab === 'gastos' && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-rose-500/10 rounded-2xl -z-10" />}
          <TrendingDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${activeTab === 'gastos' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">Gastos</span>
        </button>
        <button 
          onClick={() => setActiveTab('relatorio')}
          className={`flex flex-col items-center p-2 sm:p-3 rounded-2xl transition-all duration-500 active:scale-90 relative group ${activeTab === 'relatorio' ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-400'}`}
        >
          {activeTab === 'relatorio' && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-indigo-500/10 rounded-2xl -z-10" />}
          <FileText className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${activeTab === 'relatorio' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">Relatório</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-lg p-6 sm:p-8 glass-card rounded-[2rem] sm:rounded-[3rem] border-none shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-white tracking-tight">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Settings size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  Configurações
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2.5 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar relative z-10 flex-1">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Gerenciar Categorias</h3>
                  <div className="space-y-3">
                    {categories.map(cat => (
                      <div key={cat.id} className="p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md">
                        {editingCategory === cat.id ? (
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="flex-1 px-4 py-3 text-sm font-bold rounded-xl border-none bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                              />
                              <button 
                                onClick={() => handleUpdateCategory(cat.id)}
                                className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-90"
                              >
                                <Check size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingCategory(null)}
                                className="p-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-90"
                              >
                                <X size={18} />
                              </button>
                            </div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 custom-scrollbar bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              {ICON_OPTIONS.map(iconName => {
                                const IconComp = ICON_MAP[iconName] || Tag;
                                return (
                                  <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setEditCategoryIcon(iconName)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                                      editCategoryIcon === iconName 
                                        ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <IconComp size={16} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${cat.tipo === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {getCategoryIcon(cat.name, cat.tipo, 20)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{cat.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cat.tipo}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              <button 
                                onClick={() => {
                                  setEditingCategory(cat.id);
                                  setEditCategoryName(cat.name);
                                  setEditCategoryIcon(cat.icon || 'Tag');
                                }}
                                className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-xl transition-all active:scale-90"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  askConfirmation({
                                    title: 'Excluir Categoria',
                                    message: `Deseja excluir a categoria "${cat.name}"?`,
                                    type: 'danger',
                                    onConfirm: async () => {
                                      try {
                                        await deleteDoc(doc(db, 'categories', cat.id));
                                        setStatus({ type: 'success', message: '🗑️ Categoria excluída!' });
                                      } catch (err) {
                                        handleFirestoreError(err, OperationType.DELETE, `categories/${cat.id}`);
                                      }
                                    }
                                  });
                                }}
                                className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Privacidade e Dados (LGPD)</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <Shield size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Política de Privacidade</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Como cuidamos dos seus dados</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                    </button>

                    <button 
                      onClick={() => {
                        const data = JSON.stringify({
                          user: {
                            id: user?.uid,
                            email: user?.email,
                            name: user?.displayName
                          },
                          transactions,
                          categories,
                          exportDate: new Date().toISOString()
                        }, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `oyvey-data-export-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setStatus({ type: 'success', message: '📥 Dados exportados com sucesso!' });
                      }}
                      className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <Download size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Exportar Meus Dados</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baixar cópia em JSON (Direito à Portabilidade)</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Zona de Perigo</h3>
                  <button 
                    onClick={handleResetData}
                    className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] border-2 border-rose-100 dark:border-rose-900/30 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm active:scale-[0.98]"
                  >
                    <Trash2 size={18} /> Resetar Todas as Transações
                  </button>
                  <p className="text-[10px] font-bold text-rose-400/60 text-center mt-4 uppercase tracking-widest">
                    Direito ao Esquecimento: Esta ação apaga todos os seus registros financeiros.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  <AlertCircle size={28} className="sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight uppercase">
                  {confirmModal.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
                  {confirmModal.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    {confirmModal.cancelText || 'Cancelar'}
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    className={`flex-1 p-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${confirmModal.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'}`}
                  >
                    {confirmModal.confirmText || 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LGPD Consent Banner */}
      <AnimatePresence>
        {!hasAcceptedLGPD && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-8 right-8 z-[110] flex justify-center"
          >
            <div className="w-full max-w-4xl glass-card p-6 rounded-[2rem] border-none shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Shield size={28} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Privacidade e LGPD</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                    Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência e garantir a segurança dos seus dados financeiros, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <button 
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-all"
                >
                  Saber Mais
                </button>
                <button 
                  onClick={handleAcceptLGPD}
                  className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Aceitar e Continuar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-2xl p-6 sm:p-10 glass-card rounded-[2rem] sm:rounded-[3rem] border-none shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-white tracking-tight">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Shield size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  Privacidade e Dados
                </h2>
                <button onClick={() => setIsPrivacyModalOpen(false)} className="p-2.5 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar relative z-10 flex-1">
                <section>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-indigo-500" /> 1. Compromisso com a LGPD
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    O OyVey Accounting está totalmente comprometido com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Seus dados financeiros são privados, criptografados e acessíveis apenas por você através de sua conta Google autenticada.
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database size={16} className="text-indigo-500" /> 2. Quais dados coletamos?
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <span><strong>Identidade:</strong> Nome, e-mail e foto do perfil fornecidos pelo Google Auth.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <span><strong>Financeiros:</strong> Transações, categorias e metas inseridas manualmente por você.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-indigo-500" /> 3. Seus Direitos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Acesso e Portabilidade</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Você pode visualizar e exportar todos os seus dados a qualquer momento nas configurações.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Direito ao Esquecimento</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Você tem o poder de excluir permanentemente todos os seus registros financeiros através do botão "Resetar Dados".</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileCheck size={16} className="text-indigo-500" /> 4. Segurança dos Dados
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Seus dados são armazenados de forma segura e não são compartilhados com terceiros. Você tem total controle sobre suas informações financeiras.
                  </p>
                </section>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
                <button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95"
                >
                  Entendi e Concordo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
