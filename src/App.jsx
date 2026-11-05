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

function Header({ lang, setLang, theme, setTheme, cartCount, onCart, onAdmin, onAccount, onRegister, user, t }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container header-inner">
      <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)} aria-label="menu"><Menu/></button>
      <Brand/>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'}>
        {t.nav.map((item, i) => <a key={item} href={['#home','#shop','#about','#contact'][i]} onClick={() => setOpen(false)}>{item}</a>)}<button className="mobile-register-link" type="button" onClick={() => { setOpen(false); onRegister(); }}>ثبت‌نام / ورود به حساب</button>
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

function CartDrawer({ open, onClose, cart, setCart, lang, t, onCheckout, busy }) {
  const [details,setDetails] = useState({customerName:'',phone:'',address:'',postalCode:'',note:''});
  const total = cart.reduce((sum,item)=>sum + Number(item.price)*item.qty,0);
  if (!open) return null;
  const submit = e => { e.preventDefault(); onCheckout(details); };
  return <div className="overlay" onMouseDown={onClose}>
    <aside className="drawer checkout-drawer" onMouseDown={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>{t.cart}</h2></div><button className="icon-btn" onClick={onClose} aria-label="بستن"><X/></button></div>
      {!cart.length ? <div className="empty-cart"><ShoppingBag size={42}/><p>{t.empty}</p><button className="btn btn-primary" onClick={onClose}>{t.explore}</button></div> :
      <>
        <div className="cart-lines">{cart.map(item=><div className="cart-line" key={item.id}>
          <img src={item.image} alt={item.name}/><div className="cart-line-info"><b>{lang==='fa'?item.name:item.en||item.name}</b><span>{money(item.price,lang==='en')}</span>
          <div className="qty-control"><button type="button" aria-label="کم کردن" onClick={()=>setCart(c=>c.map(x=>x.id===item.id?{...x,qty:Math.max(1,x.qty-1)}:x))}><Minus size={13}/></button><span>{item.qty}</span><button type="button" aria-label="زیاد کردن" onClick={()=>setCart(c=>c.map(x=>x.id===item.id?{...x,qty:Math.min(50,x.qty+1)}:x))}><Plus size={13}/></button><button type="button" className="remove-item" onClick={()=>setCart(c=>c.filter(x=>x.id!==item.id))}><Trash2 size={14}/></button></div></div>
        </div>)}</div>
        <form className="checkout-form" onSubmit={submit}>
          <h3>اطلاعات تحویل سفارش</h3>
          <label>نام و نام خانوادگی<input required minLength="2" autoComplete="name" value={details.customerName} onChange={e=>setDetails(d=>({...d,customerName:e.target.value}))}/></label>
          <label>شماره تماس<input required type="tel" autoComplete="tel" value={details.phone} onChange={e=>setDetails(d=>({...d,phone:e.target.value}))}/></label>
          <label>آدرس کامل<textarea required minLength="8" rows="3" autoComplete="street-address" value={details.address} onChange={e=>setDetails(d=>({...d,address:e.target.value}))}/></label>
          <label>کد پستی (اختیاری)<input inputMode="numeric" value={details.postalCode} onChange={e=>setDetails(d=>({...d,postalCode:e.target.value}))}/></label>
          <label>توضیحات (اختیاری)<textarea rows="2" value={details.note} onChange={e=>setDetails(d=>({...d,note:e.target.value}))}/></label>
          <div className="cart-bottom"><div><span>{t.total}</span><strong>{money(total,lang==='en')}</strong></div><button className="btn btn-primary" type="submit" disabled={busy}>{busy?'در حال ثبت سفارش…':'ثبت سفارش' }<ArrowLeft size={17}/></button><small>ثبت سفارش نهایی می‌شود؛ پرداخت آنلاین هنوز فعال نیست.</small></div>
        </form>
      </>}
    </aside>
  </div>;
}

function AdminPanel({ products, setProducts, settings, setSettings, orders, token, onRefreshOrders, onSaveProduct, onDeleteProduct, onUpdateOrder, onClose, lang }) {
  const [tab,setTab]=useState('products');
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const startEdit=(p=null)=>{setEditing(p?p.id:'new');setForm(p?{...p,en:p.nameEn||p.en||'',oldPrice:p.oldPrice||'',stock:p.stock??0}:{name:'',en:'',category:'آویز',price:'',oldPrice:'',badge:'',image:'',description:'',stock:0});};
  const update=(key,value)=>setForm(f=>({...f,[key]:value}));
  const save=async e=>{
    e.preventDefault();
    const price=Number(form.price), oldPrice=form.oldPrice===''?null:Number(form.oldPrice);
    if(!form.name?.trim()||!Number.isFinite(price)||price<0){setNotice('نام و قیمت معتبر وارد کنید.');return;}
    const english=(form.en||'').trim();
    const slug=(english||form.name).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||('product-'+Date.now());
    setBusy(true);
    try{await onSaveProduct({...form,name:form.name.trim(),nameEn:english||null,slug,price,oldPrice,stock:Math.max(0,Number(form.stock)||0)},editing);setEditing(null);setNotice('محصول با موفقیت در دیتابیس ذخیره شد.');}
    catch(error){setNotice(error.message||'ذخیره محصول انجام نشد.');}
    finally{setBusy(false);}
  };
  return <div className="admin-overlay"><div className="admin-shell">
    <aside className="admin-sidebar"><div className="admin-brand"><Brand/><span className="admin-label">CONTROL CENTER</span></div>
      <div className="admin-nav">{[['products',Package,'محصولات'],['orders',ShoppingCart,'سفارش‌ها'],['categories',Tags,'دسته‌بندی‌ها'],['appearance',SlidersHorizontal,'تنظیمات ظاهری']].map(([id,Icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setEditing(null);setNotice('');if(id==='orders')onRefreshOrders();}}><Icon size={18}/>{label}</button>)}</div>
      <button className="admin-back" onClick={onClose}><ArrowRight size={17}/> بازگشت به فروشگاه</button>
    </aside>
    <main className="admin-main">
      <div className="admin-topbar"><div><span className="admin-label">SHEKARISMA / ADMIN</span><h1>{({products:'مدیریت محصولات',orders:'مدیریت سفارش‌ها',categories:'دسته‌بندی‌ها',appearance:'تنظیمات فروشگاه'})[tab]}</h1></div><button className="icon-btn" onClick={onClose}><X/></button></div>
      {notice&&<div className="notice" role="status">{notice}</div>}
      {tab==='products'&&<>{editing===null?<><div className="admin-toolbar"><p>محصولات فروشگاه <b>{products.length}</b></p><button className="btn btn-primary" onClick={()=>startEdit()}><Plus size={17}/> افزودن محصول</button></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>محصول</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>عملیات</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.image} alt=""/><b>{p.name}</b></div></td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock??'—'}</td><td><div className="table-actions"><button onClick={()=>startEdit(p)} aria-label="ویرایش"><Pencil size={16}/></button><button className="danger" onClick={async()=>{if(confirm('این محصول از فروشگاه غیرفعال شود؟')){try{await onDeleteProduct(p.id);setNotice('محصول غیرفعال شد.')}catch(e){setNotice(e.message)}}}} aria-label="حذف"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></>:<form className="product-form" onSubmit={save}><div className="form-head"><h2>{editing==='new'?'افزودن محصول':'ویرایش محصول'}</h2><button type="button" className="text-btn" onClick={()=>setEditing(null)}>انصراف</button></div><div className="form-grid">
        {[['name','نام فارسی'],['en','نام انگلیسی'],['category','دسته‌بندی'],['badge','برچسب'],['price','قیمت (تومان)'],['oldPrice','قیمت قبلی (تومان)'],['stock','موجودی'],['image','آدرس تصویر']].map(([key,label])=><label key={key}>{label}<input required={key==='name'||key==='price'} type={['price','oldPrice','stock'].includes(key)?'number':'text'} min={['price','oldPrice','stock'].includes(key)?0:undefined} value={form[key]??''} onChange={e=>update(key,e.target.value)} placeholder={label}/></label>)}
        <label className="full-field">توضیحات<textarea rows="3" value={form.description||''} onChange={e=>update('description',e.target.value)}/></label>
      </div><button className="btn btn-primary" type="submit" disabled={busy}>{busy?'در حال ذخیره…':'ذخیره محصول'}<Save size={17}/></button></form>}</>}
      {tab==='orders'&&<><div className="admin-toolbar"><p>سفارش‌های ثبت‌شده <b>{orders.length}</b></p><button className="btn btn-primary" onClick={onRefreshOrders}>به‌روزرسانی</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>شماره</th><th>مشتری</th><th>تلفن</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.id.slice(-7)}</td><td>{o.customerName}</td><td>{o.phone}</td><td>{money(o.total)}</td><td><select value={o.status} onChange={e=>onUpdateOrder(o.id,e.target.value)}><option value="PENDING">در انتظار</option><option value="CONFIRMED">تأیید</option><option value="PROCESSING">در حال آماده‌سازی</option><option value="SHIPPED">ارسال‌شده</option><option value="DELIVERED">تحویل‌شده</option><option value="CANCELLED">لغوشده</option></select></td></tr>)}</tbody></table>{!orders.length&&<p className="empty-admin">هنوز سفارشی ثبت نشده است.</p>}</div></>}
      {tab==='categories'&&<div className="category-admin"><p>دسته‌بندی‌های فعلی محصولات</p><div className="category-chips">{[...new Set(products.map(p=>p.category))].map(c=><span key={c}>{c}</span>)}</div><small>دسته‌بندی‌ها از اطلاعات محصولات دیتابیس استخراج می‌شوند.</small></div>}
      {tab==='appearance'&&<div className="settings-form"><h2>تنظیمات ظاهری این مرورگر</h2><label>نام فروشگاه<input value={settings.brand} onChange={e=>setSettings(v=>({...v,brand:e.target.value}))}/></label><label>شعار فروشگاه<input value={settings.tagline} onChange={e=>setSettings(v=>({...v,tagline:e.target.value}))}/></label><label>رنگ اصلی برند<input type="color" value={settings.accent} onChange={e=>setSettings(v=>({...v,accent:e.target.value}))}/></label><p className="settings-note">این تنظیمات فعلاً فقط در همین مرورگر ذخیره می‌شوند و روی همه بازدیدکنندگان اعمال نمی‌شوند.</p></div>}
    </main>
  </div></div>;
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
  const [accountBusy,setAccountBusy] = useState(false);
  const [accountError,setAccountError] = useState('');
  const [checkoutBusy,setCheckoutBusy] = useState(false);
  const [orders,setOrders] = useState([]);
  const [myOrders,setMyOrders] = useState([]);
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
  useEffect(()=>{if(token && user?.role!=='ADMIN')fetch(`${API_BASE}/orders/mine`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setMyOrders(d.orders||[])).catch(e=>console.error('Order history:',e));else setMyOrders([])},[token,user?.role]);
  useEffect(()=>{localStorage.setItem('sk-cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem('sk-settings',JSON.stringify(settings));document.documentElement.style.setProperty('--accent',settings.accent)},[settings]);
  const submitAccount = async e => { e.preventDefault(); setAccountBusy(true); setAccountError(''); try { const response = await fetch(`${API_BASE}/auth/${accountMode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(accountMode==='register'?accountForm:{email:accountForm.email,password:accountForm.password})}); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||`خطای سرور (${response.status})`); if(!data.token||!data.user) throw new Error('پاسخ سرور ناقص است؛ لطفاً دوباره تلاش کن.'); setToken(data.token); setUser(data.user); setAccountOpen(false); setAccountError(''); setToast(accountMode==='register'?'حساب کاربری ساخته شد.':'ورود موفق بود'); } catch(error){setAccountError(error.message==='Failed to fetch'?'ارتباط با سرور برقرار نشد. چند لحظه بعد دوباره امتحان کن.':error.message||'ثبت‌نام انجام نشد.');} finally {setAccountBusy(false);} };
  const checkout = async details => { if(!cart.length)return; if(!token){setAccountOpen(true);setToast('برای ثبت سفارش ابتدا وارد حساب شوید');return;} setCheckoutBusy(true); try { const response=await fetch(`${API_BASE}/orders`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({...details,items:cart.map(i=>({productId:i.id,quantity:i.qty}))})}); const data=await response.json(); if(!response.ok)throw new Error(data.error||'ثبت سفارش ناموفق بود'); setCart([]);setCartOpen(false);setToast(`سفارش ${data.order.id.slice(-7)} ثبت شد`); }catch(error){setToast(error.message)}finally{setCheckoutBusy(false)} };
  const saveProduct = async (payload,editing) => { const clean={name:payload.name,nameEn:payload.nameEn,slug:payload.slug,category:payload.category,description:payload.description||'',image:payload.image||'',price:payload.price,oldPrice:payload.oldPrice,stock:payload.stock,badge:payload.badge||null}; const response=await fetch(editing==='new'?`${API_BASE}/admin/products`:`${API_BASE}/admin/products/${editing}`,{method:editing==='new'?'POST':'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(clean)}); const data=await response.json(); if(!response.ok)throw new Error(data.error||'ذخیره ناموفق بود'); setProducts(list=>editing==='new'?[data.product,...list]:list.map(p=>p.id===editing?data.product:p)); };
  const deleteProduct = async id => { const response=await fetch(`${API_BASE}/admin/products/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(!response.ok)throw new Error('حذف محصول ناموفق بود');setProducts(list=>list.filter(p=>p.id!==id)); };
  const refreshOrders = async () => { const response=await fetch(`${API_BASE}/admin/orders`,{headers:{Authorization:`Bearer ${token}`}});const data=await response.json();if(!response.ok)throw new Error(data.error||'دریافت سفارش‌ها ناموفق بود');setOrders(data.orders||[]); };
  const updateOrder = async (id,status) => { const response=await fetch(`${API_BASE}/admin/orders/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status})});const data=await response.json();if(!response.ok)throw new Error(data.error||'تغییر وضعیت ناموفق بود');setOrders(list=>list.map(o=>o.id===id?data.order:o)); };
  const add = p => {setCart(c=>{const found=c.find(x=>x.id===p.id);return found?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]});setToast(isFa?'به سبد خرید اضافه شد':'Added to your bag');setTimeout(()=>setToast(''),2200)};
  return <div className="app" dir={isFa?'rtl':'ltr'}>
    <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} cartCount={cart.reduce((n,x)=>n+x.qty,0)} onCart={()=>setCartOpen(true)} onAdmin={()=>{if(user?.role!=='ADMIN'){setAccountOpen(true);return}setAdminOpen(true)}} onAccount={()=>setAccountOpen(true)} onRegister={()=>{setAccountMode('register');setAccountOpen(true)}} user={user} t={t}/>
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
    {adminOpen && <AdminPanel products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} orders={orders} onRefreshOrders={refreshOrders} onUpdateOrder={updateOrder} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onClose={()=>setAdminOpen(false)} lang={lang}/>}
    {accountOpen && <div className="auth-overlay" onMouseDown={()=>setAccountOpen(false)}><section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={e=>e.stopPropagation()}>
      <button className="auth-close" type="button" onClick={()=>setAccountOpen(false)} aria-label="بستن"><X size={19}/></button>
      <div className="auth-brand-mark"><Lightbulb size={23}/></div>
      <span className="auth-eyebrow">S H E K A R I S M A</span>
      <h2 id="auth-title">{accountMode==='login'?'خوش برگشتی':'به شی‌کاریزما بپیوند'}</h2>
      <p className="auth-intro">{accountMode==='login'?'برای ادامه خرید وارد حساب کاربری‌ات شو.':'حساب کاربری بساز و تجربه خریدت را ساده‌تر کن.'}</p>
      <div className="auth-tabs"><button type="button" className={accountMode==='login'?'active':''} onClick={()=>setAccountMode('login')}>ورود</button><button type="button" className={accountMode==='register'?'active':''} onClick={()=>setAccountMode('register')}>ثبت‌نام</button></div>
      <form className="auth-form" onSubmit={submitAccount}>
        {accountMode==='register'&&<label>نام و نام خانوادگی<input autoComplete="name" required value={accountForm.name} onChange={e=>setAccountForm(f=>({...f,name:e.target.value}))} placeholder="نام خود را وارد کنید"/></label>}
        <label>آدرس ایمیل<input autoComplete="email" type="email" required value={accountForm.email} onChange={e=>setAccountForm(f=>({...f,email:e.target.value}))} placeholder="name@example.com"/></label>
        <label>رمز عبور<input autoComplete={accountMode==='login'?'current-password':'new-password'} type="password" minLength="8" required value={accountForm.password} onChange={e=>setAccountForm(f=>({...f,password:e.target.value}))} placeholder="حداقل ۸ کاراکتر"/></label>
        {accountError&&<p className="auth-error" role="alert">{accountError}</p>}<button className="btn btn-primary auth-submit" type="submit" disabled={accountBusy}>{accountBusy?'در حال بررسی اطلاعات…':accountMode==='login'?'ورود به حساب':'ساخت حساب کاربری'}<ArrowLeft size={17}/></button>
      </form>
      <p className="auth-switch">{accountMode==='login'?'هنوز حساب نداری؟':'قبلاً ثبت‌نام کردی؟'} <button type="button" onClick={()=>setAccountMode(m=>m==='login'?'register':'login')}>{accountMode==='login'?'ثبت‌نام کن':'وارد شو'}</button></p>
      {user&&user.role!=='ADMIN'&&<section className="account-orders"><h3>سفارش‌های من</h3>{myOrders.length?myOrders.map(order=><div className="account-order" key={order.id}><span>#{order.id.slice(-7)}</span><b>{money(order.total)}</b><small>{({PENDING:'در انتظار بررسی',CONFIRMED:'تأیید شده',PROCESSING:'در حال آماده‌سازی',SHIPPED:'ارسال شده',DELIVERED:'تحویل شده',CANCELLED:'لغو شده'})[order.status]||order.status}</small></div>):<p>هنوز سفارشی ثبت نکرده‌اید.</p>}</section>}
      {user&&<button className="auth-logout" type="button" onClick={()=>{fetch(`${API_BASE}/auth/logout`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});setToken('');setUser(null);setAccountOpen(false)}}>خروج از حساب</button>}
      <div className="auth-footnote"><span></span> اطلاعات حساب با اتصال امن ارسال می‌شود</div>
    </section></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    {user?.role==='ADMIN'&&<button className="floating-admin" onClick={()=>setAdminOpen(true)} title="پنل مدیریت"><Settings2 size={18}/></button>}
  </div>;
}