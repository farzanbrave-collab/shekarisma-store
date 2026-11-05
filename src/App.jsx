import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpLeft, Check, ChevronDown,
  CircleHelp, Instagram, Lamp, Lightbulb, Menu, Minus, Moon, Plus,
  Search, Settings2, ShoppingBag, Sparkles, Sun, Trash2, X, LayoutDashboard, UserRound,
  Package, ShoppingCart, Tags, Image as ImageIcon, SlidersHorizontal, Globe2,
  Save, Eye, Pencil, PlusCircle, LogOut, Home, Boxes, Mail, Phone, MapPin
} from 'lucide-react';
import { starterProducts, copy } from './data';

const money = (n, en=false) => new Intl.NumberFormat(en ? 'en-US' : 'fa-IR').format(n) + (en ? ' تومان' : ' تومان');
const API_BASE = 'https://shekarisma-store.onrender.com/api';
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };

function Brand({ light=false }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#home" aria-label="Shekarisma home">
    <span className="brand-mark"><Lightbulb size={21}/></span>
    <span><b>شی‌کاریزما</b><small>S H E K A R I S M A</small></span>
  </a>;
}

function HeroLamp() {
  return <div className="hero-art" aria-label="تصویر سه‌بعدی تزئینی لامپ روشن">
    <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
    <div className="art-glow"></div>
    <div className="floating-chip chip-one"><Sparkles size={15}/> Warm ambience</div>
    <div className="floating-chip chip-two"><span className="tiny-dot"></span> 2700K · Soft glow</div>
    <div className="lamp-scene">
      <div className="lamp-rays ray-a"></div><div className="lamp-rays ray-b"></div>
      <div className="bulb-glass"><div className="bulb-highlight"></div><div className="filament"></div></div>
      <div className="bulb-neck"></div><div className="bulb-base"><i></i><i></i><i></i></div>
      <div className="lamp-shadow"></div>
    </div>
    <div className="art-caption"><span>01 / LIGHT OBJECT</span><b>THE ART OF GLOW</b></div>
    <div className="art-star star-one">✳</div><div className="art-star star-two">✦</div>
  </div>;
}

function Header({ lang, setLang, theme, setTheme, cartCount, onCart, onAdmin, onAccount, user, t }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container header-inner">
      <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)} aria-label="menu"><Menu/></button>
      <Brand/>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'}>
        {t.nav.map((item, i) => <a key={item} href={['#home','#shop','#about','#contact'][i]} onClick={() => setOpen(false)}>{item}</a>)}
      </nav>
      <div className="header-actions">
        <button className="language-btn" onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}><Globe2 size={16}/>{t.language}</button>
        <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="toggle theme">{theme === 'dark' ? <Sun/> : <Moon/>}</button>
        <button className="bag-btn" onClick={onCart}><ShoppingBag size={18}/><span>{cartCount}</span></button>
        <button className="account-shortcut" onClick={onAccount}><UserRound size={16}/><span>{user ? user.name : 'ورود / ثبت‌نام'}</span></button><button className="admin-shortcut" onClick={onAdmin}><LayoutDashboard size={15}/><span>{t.admin}</span></button>
      </div>
    </div>
  </header>;
}

function ProductCard({ product, onAdd, onEdit, admin, lang }) {
  return <article className="product-card">
    <div className="product-image-wrap">
      <img src={product.image} alt={lang === 'fa' ? product.name : product.en || product.name} loading="lazy"/>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      {admin && <button className="edit-product" onClick={() => onEdit(product)}><Pencil size={14}/> ویرایش</button>}
      <button className="quick-add" onClick={() => onAdd(product)} aria-label="add to cart"><Plus/></button>
    </div>
    <div className="product-info">
      <div className="product-meta"><span>{product.category}</span><span className="product-dot"></span><span>Shekarisma edit</span></div>
      <h3>{lang === 'fa' ? product.name : product.en || product.name}</h3>
      <div className="price-row"><strong>{money(product.price, lang === 'en')}</strong>{product.oldPrice > product.price && <del>{money(product.oldPrice, lang === 'en')}</del>}</div>
    </div>
  </article>;
}

function CartDrawer({ open, onClose, cart, setCart, lang, t }) {
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  if (!open) return null;
  return <div className="overlay" onMouseDown={onClose}>
    <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
      <div className="drawer-head"><h2>{t.cart}</h2><button className="icon-btn" onClick={onClose}><X/></button></div>
      {!cart.length ? <div className="empty-cart"><ShoppingBag size={42}/><p>{t.empty}</p><button className="btn btn-primary" onClick={onClose}>{t.explore}</button></div> :
        <><div className="cart-lines">{cart.map(item => <div className="cart-line" key={item.id}>
          <img src={item.image} alt=""/><div className="cart-line-info"><b>{lang === 'fa' ? item.name : item.en || item.name}</b><span>{money(item.price, lang === 'en')}</span>
          <div className="qty-control"><button onClick={() => setCart(c => c.map(x => x.id === item.id ? {...x, qty: Math.max(1,x.qty-1)} : x))}><Minus size={13}/></button><span>{item.qty}</span><button onClick={() => setCart(c => c.map(x => x.id === item.id ? {...x, qty:x.qty+1} : x))}><Plus size={13}/></button><button className="remove-item" onClick={() => setCart(c => c.filter(x => x.id !== item.id))}><Trash2 size={14}/></button></div>
          </div></div>)}</div>
        <div className="cart-bottom"><div><span>{t.total}</span><strong>{money(total, lang === 'en')}</strong></div><button className="btn btn-primary" onClick={() => alert(lang === 'fa' ? 'این نسخه نمایشی است؛ درگاه پرداخت هنوز متصل نشده.' : 'Demo mode: payment gateway is not connected yet.')}>{t.checkout}<ArrowLeft size={17}/></button><small>نسخه نمایشی · پرداخت آنلاین در مرحله راه‌اندازی</small></div></>}
    </aside>
  </div>;
}

function AdminPanel({ products, setProducts, settings, setSettings, orders, onClose, lang }) {
  const [tab, setTab] = useState('products');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [notice, setNotice] = useState('');
  const isFa = lang === 'fa';
  const startEdit = (p=null) => { setEditing(p ? p.id : 'new'); setForm(p ? {...p} : {name:'',en:'',category:'آویز',price:0,oldPrice:0,badge:'',image:'',description:''}); };
  const save = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    if (editing === 'new') setProducts(p => [{...form,id:Date.now()},...p]);
    else setProducts(p => p.map(x => x.id === editing ? {...form, price:Number(form.price), oldPrice:Number(form.oldPrice)} : x));
    setEditing(null); setNotice('تغییرات در این مرورگر ذخیره شد.'); setTimeout(() => setNotice(''), 2600);
  };
  const update = (key, value) => setForm(f => ({...f,[key]:value}));
  return <div className="admin-overlay">
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><Brand/><span className="admin-label">CONTROL CENTER</span></div>
        <div className="admin-nav">
          {[['products',Package,'محصولات'],['orders',ShoppingCart,'سفارش‌ها'],['categories',Tags,'دسته‌بندی‌ها'],['appearance',SlidersHorizontal,'تنظیمات ظاهری']].map(([id,Icon,label]) =>
            <button key={id} className={tab===id?'active':''} onClick={() => {setTab(id);setEditing(null)}}><Icon size={18}/>{label}</button>)}
        </div>
        <button className="admin-back" onClick={onClose}><ArrowRight size={17}/> بازگشت به فروشگاه</button>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar"><div><span className="admin-label">SHEKARISMA / ADMIN</span><h1>{({products:'مدیریت محصولات',orders:'مدیریت سفارش‌ها',categories:'دسته‌بندی‌ها',appearance:'تنظیمات فروشگاه'})[tab]}</h1></div><button className="icon-btn" onClick={onClose}><X/></button></div>
        {notice && <div className="notice"><Check size={16}/>{notice}</div>}
        {tab === 'products' && <>
          {editing === null ? <><div className="admin-toolbar"><p>محصولات فروشگاه <b>{products.length}</b></p><button className="btn btn-primary" onClick={() => startEdit()}><Plus size={17}/> افزودن محصول</button></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>محصول</th><th>دسته</th><th>قیمت</th><th>عملیات</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.image} alt=""/><b>{p.name}</b></div></td><td>{p.category}</td><td>{money(p.price)}</td><td><div className="table-actions"><button onClick={()=>startEdit(p)} aria-label="edit"><Pencil size={16}/></button><button className="danger" onClick={()=>{if(confirm('این محصول حذف شود؟'))setProducts(list=>list.filter(x=>x.id!==p.id))}} aria-label="delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></> :
            <form className="product-form" onSubmit={save}><div className="form-head"><h2>{editing==='new'?'افزودن محصول':'ویرایش محصول'}</h2><button type="button" className="text-btn" onClick={()=>setEditing(null)}>انصراف</button></div>
              <div className="form-grid">
                {[['name','نام فارسی'],['en','نام انگلیسی'],['category','دسته‌بندی'],['badge','برچسب'],['price','قیمت (تومان)'],['oldPrice','قیمت قبلی (تومان)'],['image','آدرس تصویر']].map(([k,label])=><label key={k}>{label}<input required={k==='name'||k==='price'} type={k==='price'||k==='oldPrice'?'number':'text'} value={form[k]??''} onChange={e=>update(k,e.target.value)} placeholder={label}/></label>)}
                <label className="full-field">توضیحات<textarea value={form.description||''} onChange={e=>update('description',e.target.value)} rows="3"/></label>
              </div><button className="btn btn-primary" type="submit"><Save size={17}/> ذخیره محصول</button>
            </form>}
        </>}
        {tab === 'orders' && <div className="empty-admin"><ShoppingCart size={38}/><h2>هنوز سفارشی ثبت نشده</h2><p>سفارش‌های واقعی پس از اتصال بک‌اند و درگاه پرداخت در این بخش نمایش داده می‌شوند.</p></div>}
        {tab === 'categories' && <div className="category-admin"><p>دسته‌بندی‌های نمونه</p><div className="category-chips">{['آویز','رومیزی','دیواری','ایستاده','سقفی'].map(c=><span key={c}>{c}</span>)}</div><small>مدیریت دسته‌بندی پویا در مرحله اتصال دیتابیس تکمیل می‌شود.</small></div>}
        {tab === 'appearance' && <div className="settings-form"><h2>تنظیمات برند</h2><label>نام فروشگاه<input value={settings.brand} onChange={e=>setSettings(s=>({...s,brand:e.target.value}))}/></label><label>شعار فروشگاه<input value={settings.tagline} onChange={e=>setSettings(s=>({...s,tagline:e.target.value}))}/></label><label>رنگ اصلی برند<input type="color" value={settings.accent} onChange={e=>setSettings(s=>({...s,accent:e.target.value}))}/></label><p className="settings-note">این تنظیمات در نسخه نمایشی ذخیره می‌شوند. برای انتشار آنلاین، تنظیمات باید به API و دیتابیس متصل شوند.</p></div>}
      </main>
    </div>
  </div>;
}

export default function App() {
  const [lang,setLang] = useState(() => read('sk-lang','fa'));
  const [theme,setTheme] = useState(() => read('sk-theme','dark'));
  const [products,setProducts] = useState(() => read('sk-products',starterProducts));
  const [cart,setCart] = useState(() => read('sk-cart',[]));
  const [settings,setSettings] = useState(() => read('sk-settings',{brand:'شی‌کاریزما',tagline:'نور، امضای فضا',accent:'#9b78f5'}));
  const [cartOpen,setCartOpen] = useState(false);
  const [token,setToken] = useState(() => localStorage.getItem('sk-token') || '');
  const [user,setUser] = useState(() => read('sk-user',null));
  const [accountOpen,setAccountOpen] = useState(false);
  const [accountMode,setAccountMode] = useState('login');
  const [accountForm,setAccountForm] = useState({name:'',email:'',password:''});
  const [checkoutBusy,setCheckoutBusy] = useState(false);
  const [orders,setOrders] = useState([]);
  const [adminOpen,setAdminOpen] = useState(false);
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('همه');
  const [toast,setToast] = useState('');
  const t = copy[lang];
  const isFa = lang === 'fa';
  const categories = ['همه',...new Set(products.map(p=>p.category))];
  const filtered = useMemo(() => products.filter(p => (category==='همه'||p.category===category) && `${p.name} ${p.en} ${p.category}`.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  useEffect(()=>{localStorage.setItem('sk-lang',JSON.stringify(lang));document.documentElement.lang=lang;document.documentElement.dir=isFa?'rtl':'ltr'},[lang,isFa]);
  useEffect(()=>{localStorage.setItem('sk-theme',JSON.stringify(theme));document.documentElement.dataset.theme=theme},[theme]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/products`, { signal: controller.signal, cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('دریافت محصولات از سرور ناموفق بود.');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.products)) throw new Error('پاسخ محصولات معتبر نیست.');
        setProducts(data.products.map(product => ({
          ...product,
          en: product.nameEn || product.name,
          oldPrice: product.oldPrice ?? 0
        })));
      })
      .catch(error => {
        if (error.name !== 'AbortError') console.error('Shekarisma API:', error);
      });
    return () => controller.abort();
  }, []);
  useEffect(()=>{localStorage.setItem('sk-products',JSON.stringify(products))},[products]);
  useEffect(()=>{if(token){localStorage.setItem('sk-token',token);localStorage.setItem('sk-user',JSON.stringify(user));fetch(`${API_BASE}/auth/me`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setUser(d.user)).catch(()=>{setToken('');setUser(null);localStorage.removeItem('sk-token');localStorage.removeItem('sk-user')})}else{localStorage.removeItem('sk-token');localStorage.removeItem('sk-user')}},[token]);
  useEffect(()=>{if(token && user?.role==='ADMIN')fetch(`${API_BASE}/admin/orders`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setOrders(d.orders||[])).catch(e=>console.error(e))},[token,user?.role]);
  useEffect(()=>{localStorage.setItem('sk-cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem('sk-settings',JSON.stringify(settings));document.documentElement.style.setProperty('--accent',settings.accent)},[settings]);
  const submitAccount = async e => { e.preventDefault(); try { const response = await fetch(`${API_BASE}/auth/${accountMode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(accountMode==='register'?accountForm:{email:accountForm.email,password:accountForm.password})}); const data=await response.json(); if(!response.ok) throw new Error(data.error||'ورود ناموفق بود'); setToken(data.token); setUser(data.user); setAccountOpen(false); setToast('ورود موفق بود'); } catch(error){setToast(error.message)} };
  const checkout = async () => { if(!cart.length)return; if(!token){setAccountOpen(true);setToast('برای ثبت سفارش ابتدا وارد حساب شوید');return;} const customerName=prompt('نام و نام خانوادگی:'); if(!customerName)return; const phone=prompt('شماره تماس:'); if(!phone)return; const address=prompt('آدرس کامل:'); if(!address)return; setCheckoutBusy(true); try { const response=await fetch(`${API_BASE}/orders`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({customerName,phone,address,items:cart.map(i=>({productId:i.id,quantity:i.qty}))})}); const data=await response.json(); if(!response.ok)throw new Error(data.error||'ثبت سفارش ناموفق بود'); setCart([]);setCartOpen(false);setToast(`سفارش ${data.order.id.slice(-7)} ثبت شد`); }catch(error){setToast(error.message)}finally{setCheckoutBusy(false)} };
  const saveProduct = async (payload,editing) => { const clean={name:payload.name,nameEn:payload.nameEn,slug:payload.slug,category:payload.category,description:payload.description||'',image:payload.image||'',price:payload.price,oldPrice:payload.oldPrice,stock:payload.stock,badge:payload.badge||null}; const response=await fetch(editing==='new'?`${API_BASE}/admin/products`:`${API_BASE}/admin/products/${editing}`,{method:editing==='new'?'POST':'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(clean)}); const data=await response.json(); if(!response.ok)throw new Error(data.error||'ذخیره ناموفق بود'); setProducts(list=>editing==='new'?[data.product,...list]:list.map(p=>p.id===editing?data.product:p)); };
  const deleteProduct = async id => { const response=await fetch(`${API_BASE}/admin/products/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(!response.ok)throw new Error('حذف محصول ناموفق بود');setProducts(list=>list.filter(p=>p.id!==id)); };
  const add = p => {setCart(c=>{const found=c.find(x=>x.id===p.id);return found?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]});setToast(isFa?'به سبد خرید اضافه شد':'Added to your bag');setTimeout(()=>setToast(''),2200)};
  return <div className="app" dir={isFa?'rtl':'ltr'}>
    <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} cartCount={cart.reduce((n,x)=>n+x.qty,0)} onCart={()=>setCartOpen(true)} onAdmin={()=>{if(user?.role!=='ADMIN'){setAccountOpen(true);return}setAdminOpen(true)}} onAccount={()=>setAccountOpen(true)} user={user} t={t}/>
    <main>
      <section className="hero-section" id="home"><div className="container hero-grid">
        <div className="hero-copy"><div className="eyebrow"><span></span>{t.eyebrow}</div><h1>{t.heroTitle}<br/><em>{t.heroAccent}</em></h1><p>{t.heroText}</p>
          <div className="hero-buttons"><a className="btn btn-primary" href="#shop">{t.explore}<ArrowLeft size={17}/></a><a className="story-link" href="#about">{t.story}<ArrowUpLeft size={17}/></a></div>
          <div className="hero-footnote"><span>01 — 06</span><span className="foot-line"></span><span>CURATED LIGHTING OBJECTS</span></div>
        </div><HeroLamp/>
      </div><div className="hero-bottom container"><span>SCULPTURAL LIGHTING</span><span>DESIGNED TO FEEL</span><span>EST. 2025</span></div></section>
      <section className="trust-strip"><div className="container trust-inner"><span><Sparkles size={16}/> طراحی مینیمال</span><span><Check size={16}/> انتخاب گزیده</span><span><Lightbulb size={16}/> نورپردازی هدفمند</span><span><Package size={16}/> ارسال امن</span></div></section>
      <section className="collection-section section-pad" id="shop"><div className="container">
        <div className="section-heading"><div><span className="eyebrow">THE COLLECTION / 2026</span><h2>{t.collection}<br/><em>{t.collectionAccent}</em></h2></div><p>{t.collectionText}</p></div>
        <div className="shop-toolbar"><div className="category-tabs">{categories.map(c=><button key={c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c==='همه'?t.all:c}</button>)}</div><label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/></label></div>
        <div className="product-grid">{filtered.map(p=><ProductCard key={p.id} product={p} onAdd={add} lang={lang}/>)}</div>
        {!filtered.length && <div className="no-results">محصولی با این مشخصات پیدا نشد.</div>}
      </div></section>
      <section className="manifesto-section" id="about"><div className="container manifesto-grid"><div className="manifesto-visual"><div className="manifesto-ring"></div><img src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1000&q=85" alt="طراحی نورپردازی مینیمال" loading="lazy"/><span>LIGHT / FORM / FEEL</span></div><div className="manifesto-copy"><span className="eyebrow">OUR PHILOSOPHY</span><h2>{t.about}<br/><em>{t.aboutAccent}</em></h2><p>{t.aboutText}</p><div className="manifesto-points"><span><b>01</b>{t.feature1}</span><span><b>02</b>{t.feature2}</span><span><b>03</b>{t.feature3}</span></div><a href="#contact" className="story-link">{isFa?'بیشتر درباره ما':'Discover more'} <ArrowLeft size={17}/></a></div></div></section>
      <section className="newsletter-section"><div className="container newsletter-inner"><div><span className="eyebrow">A LITTLE MORE LIGHT</span><h2>{t.newsletter}</h2><p>{t.newsletterText}</p></div><form onSubmit={e=>{e.preventDefault();alert(isFa?'عضویت نمایشی انجام شد.':'Demo subscription complete.')}}><input type="email" required placeholder={t.email}/><button className="btn btn-primary">{t.join}<ArrowLeft size={16}/></button></form></div></section>
    </main>
    <footer id="contact"><div className="container footer-grid"><div><Brand light/><p>{t.footer}</p></div><div><b>{isFa?'دسترسی سریع':'Quick links'}</b><a href="#shop">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></div><div><b>{isFa?'ارتباط با ما':'Contact'}</b><span><Mail size={15}/> hello@shekarisma.com</span><span><Phone size={15}/> ۰۲۱-۰۰۰۰۰۰۰۰</span><span><MapPin size={15}/> تهران، ایران</span></div><div className="socials"><b>{isFa?'ما را دنبال کنید':'Follow us'}</b><a href="#contact" aria-label="instagram"><Instagram/></a></div></div><div className="container copyright"><span>© 2026 SHEKARISMA. ALL RIGHTS RESERVED.</span><span>{isFa?'ساخته‌شده با توجه به جزئیات':'Made with attention to detail'}</span></div></footer>
    <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} cart={cart} setCart={setCart} lang={lang} t={t} onCheckout={checkout} busy={checkoutBusy}/>
    {adminOpen && <AdminPanel products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} orders={orders} token={token} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onClose={()=>setAdminOpen(false)} lang={lang}/>}
    {accountOpen && <div className="overlay" onMouseDown={()=>setAccountOpen(false)}><section className="drawer" onMouseDown={e=>e.stopPropagation()}><div className="drawer-head"><h2>{accountMode==='login'?'ورود به حساب':'ساخت حساب کاربری'}</h2><button className="icon-btn" onClick={()=>setAccountOpen(false)}><X/></button></div><form className="product-form" onSubmit={submitAccount}>{accountMode==='register'&&<label>نام<input required value={accountForm.name} onChange={e=>setAccountForm(f=>({...f,name:e.target.value}))}/></label>}<label>ایمیل<input type="email" required value={accountForm.email} onChange={e=>setAccountForm(f=>({...f,email:e.target.value}))}/></label><label>رمز عبور<input type="password" minLength="8" required value={accountForm.password} onChange={e=>setAccountForm(f=>({...f,password:e.target.value}))}/></label><button className="btn btn-primary" type="submit">{accountMode==='login'?'ورود':'ثبت‌نام'}</button><button type="button" className="text-btn" onClick={()=>setAccountMode(m=>m==='login'?'register':'login')}>{accountMode==='login'?'حساب نداری؟ ثبت‌نام':'قبلاً حساب ساختی؟ ورود'}</button>{user&&<button type="button" className="text-btn" onClick={()=>{fetch(`${API_BASE}/auth/logout`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});setToken('');setUser(null);setAccountOpen(false)}}>خروج از حساب</button>}</form></section></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    <button className="floating-admin" onClick={()=>setAdminOpen(true)} title="پنل مدیریت"><Settings2 size={18}/></button>
  </div>;
}