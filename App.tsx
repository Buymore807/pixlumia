
import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, Category, PosterFormat, FORMAT_DETAILS, User, Order } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import BackOffice from './components/BackOffice';
import Testimonials from './components/Testimonials';
import ServiceImpressionBanner from './components/ServiceImpressionBanner';
import ServiceImpressionPage from './components/ServiceImpressionPage';
import Auth from './components/Auth';
import CustomerArea from './components/CustomerArea';
import AIAssistant from './components/AIAssistant';
import ShippingTrust from './components/ShippingTrust';

type Page = 'home' | 'custom-print' | 'account';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pixlumia_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pixlumia_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pixlumia_products');
      const parsed = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pixlumia_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [customStudioBg, setCustomStudioBg] = useState<string | null>(() => {
    return localStorage.getItem('pixlumia_studio_bg');
  });

  const [activeCategory, setActiveCategory] = useState<Category | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pixlumia_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pixlumia_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem('pixlumia_user', JSON.stringify(user));
    else localStorage.removeItem('pixlumia_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pixlumia_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (customStudioBg) {
      localStorage.setItem('pixlumia_studio_bg', customStudioBg);
    } else {
      localStorage.removeItem('pixlumia_studio_bg');
    }
  }, [customStudioBg]);

  const categories: (Category | 'Tous')[] = ['Tous', 'Films', 'Séries', 'Jeux Vidéo', 'Anime'];

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let filtered = products;
    
    if (activeCategory !== 'Tous') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(lowSearch) || 
        p.category.toLowerCase().includes(lowSearch) ||
        p.description.toLowerCase().includes(lowSearch)
      );
    }
    
    return filtered;
  }, [activeCategory, searchTerm, products]);

  const addToCart = (product: Product, format: PosterFormat, discountMultiplier: number = 1) => {
    const isFree = product.id === 'test-0' || (product.isCustom && product.price === 0);
    const basePrice = isFree ? 0 : (FORMAT_DETAILS[format]?.price || 0) + (product.price || 0);
    const finalPrice = isFree ? 0 : basePrice * discountMultiplier;
    
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && item.selectedFormat === format
      );
      
      if (existingIndex > -1 && !product.isCustom) {
        const newCart = [...prev];
        newCart[existingIndex] = { 
          ...newCart[existingIndex], 
          quantity: newCart[existingIndex].quantity + 1,
          finalPrice: finalPrice
        };
        return newCart;
      }
      return [...prev, { ...product, quantity: 1, selectedFormat: format, finalPrice }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const handleOrderComplete = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setActivePage('account');
  };

  const updateQuantity = (id: string, format: PosterFormat, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedFormat === format) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string, format: PosterFormat) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedFormat === format)));
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('home');
  };

  if (isAdminMode) {
    return (
      <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
        <Navbar 
          onCartToggle={() => setIsCartOpen(!isCartOpen)} 
          cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
          onAdminToggle={() => setIsAdminMode(!isAdminMode)}
          isAdminMode={isAdminMode}
          onNavigate={(p) => { setActivePage(p as Page); setIsAdminMode(false); }}
          user={user}
        />
        <BackOffice 
          products={products} 
          onAddProduct={(p) => setProducts(prev => [p, ...prev])} 
          onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
          onClose={() => setIsAdminMode(false)}
          onReset={() => { setProducts(INITIAL_PRODUCTS); setCustomStudioBg(null); }}
          customStudioBg={customStudioBg}
          onUpdateStudioBg={setCustomStudioBg}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <Navbar 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onAdminToggle={() => setIsAdminMode(!isAdminMode)}
        isAdminMode={isAdminMode}
        onNavigate={setActivePage}
        user={user}
      />

      {activePage === 'home' && (
        <>
          <header className="relative py-24 md:py-32 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[150px] rounded-full animate-pulse"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
              <div 
                onClick={() => setIsAIOpen(true)}
                className="cursor-pointer inline-flex items-center gap-3 px-6 py-2 glass rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8 border border-indigo-500/30 hover:scale-105 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-500/50 shadow-lg">
                   <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="Lumia" />
                </div>
                Besoin d'aide ? Discutez avec Lumia
                <i className="fas fa-magic ml-1 group-hover:rotate-12 transition-transform text-fuchsia-500"></i>
              </div>
              <h1 className="font-brand text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                Sublimez<br/>
                <span className="gradient-text">Votre Intérieur</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                Art Digital & Tirages Qualité Galerie. Testez notre conseiller IA pour trouver la pièce idéale !
              </p>
            </div>
          </header>

          <main className="flex-grow w-full">
            <div className="max-w-7xl mx-auto px-4 pb-20">
              <ServiceImpressionBanner onAction={() => setActivePage('custom-print')} />
              
              <div className="mt-24 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setSearchTerm(''); }}
                        className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                          activeCategory === cat && !searchTerm
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 -translate-y-1' 
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-indigo-500/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative w-full md:w-80 group">
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Chercher un film, style..."
                      className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <i className="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                  </div>
                </div>

                {searchTerm && (
                  <div className="flex items-center gap-4 animate-in fade-in">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Résultats pour : <span className="text-indigo-400">"{searchTerm}"</span></p>
                    <button onClick={() => setSearchTerm('')} className="text-slate-600 hover:text-white text-[10px] uppercase font-black">Effacer</button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 min-h-[400px]">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={addToCart}
                        customStudioBg={customStudioBg}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-white/10">
                       <i className="fas fa-search text-4xl text-slate-800 mb-6"></i>
                       <p className="text-white font-bold">Aucun poster ne correspond à cette recherche.</p>
                       <button onClick={() => {setSearchTerm(''); setActiveCategory('Tous');}} className="mt-4 text-indigo-400 text-xs font-black uppercase tracking-widest">Voir tout le catalogue</button>
                    </div>
                  )}
                </div>
              </div>

              <ShippingTrust />
            </div>
            <Testimonials />
          </main>
        </>
      )}

      {activePage === 'custom-print' && (
        <ServiceImpressionPage 
          onAddToCart={addToCart} 
          customStudioBg={customStudioBg} 
          onBack={() => setActivePage('home')}
        />
      )}

      {activePage === 'account' && (
        <CustomerArea 
          user={user} 
          orders={orders} 
          onLogout={handleLogout}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onUpdateUser={handleUpdateUser}
        />
      )}

      <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-2xl font-brand font-black text-white uppercase tracking-tight">
                PIX<span className="text-indigo-500">LUMIA</span>
            </span>
            <p className="text-slate-500 text-[10px] font-bold mt-4 uppercase tracking-[0.4em]">Laboratoire Photo & Édition d'Art</p>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        allProducts={products}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onAddToCart={addToCart}
        user={user}
        onAuthRequired={() => setIsAuthModalOpen(true)}
        onOrderComplete={handleOrderComplete}
      />

      <Auth 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={setUser}
      />

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)}
        products={products}
        onFilterApply={(theme) => {
          setSearchTerm(theme);
          setActiveCategory('Tous');
          document.getElementById('root')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      
      {/* Floating AI Trigger with Advisor Avatar */}
      {!isAIOpen && activePage === 'home' && (
        <button 
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-8 right-8 w-20 h-20 rounded-[2.2rem] p-1 shadow-2xl z-40 hover:scale-110 active:scale-95 transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-fuchsia-600 animate-pulse"></div>
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/20">
             <img 
               src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop" 
               className="w-full h-full object-cover brightness-[0.9] group-hover:scale-110 transition-transform duration-500" 
               alt="Lumia AI" 
             />
             <div className="absolute bottom-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-bounce shadow-lg"></div>
          </div>
          {/* Professional Tooltip */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2 px-5 py-2.5 glass text-white text-[10px] font-black uppercase tracking-widest rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-2xl border border-indigo-500/50">
             <i className="fas fa-sparkles text-indigo-400 mr-2"></i>
             Besoin d'un conseil ?
          </div>
        </button>
      )}
    </div>
  );
};

export default App;
