import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants.tsx';
import { Product, CartItem, Category, PosterFormat, FORMAT_DETAILS, User, Order } from './types.ts';
import Navbar from './components/Navbar.tsx';
import ProductCard from './components/ProductCard.tsx';
import Cart from './components/Cart.tsx';
import BackOffice from './components/BackOffice.tsx';
import Testimonials from './components/Testimonials.tsx';
import ServiceImpressionBanner from './components/ServiceImpressionBanner.tsx';
import ServiceImpressionPage from './components/ServiceImpressionPage.tsx';
import Auth from './components/Auth.tsx';
import CustomerArea from './components/CustomerArea.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import ShippingTrust from './components/ShippingTrust.tsx';

type Page = 'home' | 'custom-print' | 'account';

// Added missing default export and completed the component logic which was truncated.
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
                   <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                </div>
                Demander à Lumia
              </div>
              
              <h1 className="text-6xl md:text-8xl font-brand font-black text-white mb-8 tracking-tighter">
                L'ART DU <span className="gradient-text">POSTER</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Tirages d'exception sur papier satiné 235g. <br/> 
                Sublimez vos murs avec nos collections cinéma, gaming et séries.
              </p>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-20 flex-grow">
            <div className="flex flex-col md:flex-row gap-8 justify-between items-center mb-16">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/20 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80 group">
                <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher une oeuvre..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} customStudioBg={customStudioBg} />
              ))}
            </div>

            <ServiceImpressionBanner onAction={() => setActivePage('custom-print')} />
          </main>

          <Testimonials />
          <ShippingTrust />
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

      <footer className="py-20 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-gem text-white"></i>
              </div>
              <span className="text-2xl font-brand font-black text-white">PIXLUMIA</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Pixlumia est un studio de tirage d'art indépendant. Nous croyons que chaque mur mérite une histoire exceptionnelle, imprimée avec une précision chirurgicale sur les meilleurs supports.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><i className="fab fa-tiktok"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><i className="fab fa-pinterest"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><button onClick={() => setActivePage('home')} className="hover:text-white transition-colors">Galerie</button></li>
              <li><button onClick={() => setActivePage('custom-print')} className="hover:text-white transition-colors">Impression Perso</button></li>
              <li><button onClick={() => setActivePage('account')} className="hover:text-white transition-colors">Mon Compte</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Suivi Colis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Livraison & Retours</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions Légales</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2024 PIXLUMIA STUDIO - MADE WITH PASSION</p>
          <div className="flex items-center gap-6">
            <i className="fab fa-cc-stripe text-slate-700 text-2xl"></i>
            <i className="fab fa-cc-visa text-slate-700 text-2xl"></i>
            <i className="fab fa-cc-mastercard text-slate-700 text-2xl"></i>
          </div>
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
        onAuthRequired={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
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
        onFilterApply={(theme) => { setSearchTerm(theme); setActiveCategory('Tous'); }}
        products={products}
      />
    </div>
  );
};

export default App;
