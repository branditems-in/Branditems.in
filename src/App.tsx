import React, { useEffect, useMemo, useRef, useState } from 'react';
import { products, productFromAnchor, INSTAGRAM_URL, TELEGRAM_URL, WA_GENERAL_URL, WHATSAPP_CHANNEL_URL, Photo, type Product } from './products';
import { ProductPage, productPath } from './ProductPage';

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 0-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.9a11.6 11.6 0 0 0 4.5 4.3c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.4z"/>
        </svg>
    );
}

function Card({ product }: { product: Product }) {
    const stripRef = useRef<HTMLDivElement>(null);
    const [idx, setIdx] = useState(0);
    const multi = product.photos.length > 1;
    const go = (e: React.MouseEvent, dir: number) => {
        e.preventDefault();
        e.stopPropagation();
        const el = stripRef.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
    };
    const onStripScroll = () => {
        const el = stripRef.current;
        if (el) setIdx(Math.min(product.photos.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    // A real horizontal swipe cancels the click; a drag with the mouse should not open the product either.
    const onStripClick = (e: React.MouseEvent) => {
        const el = stripRef.current;
        if (el && Math.abs(el.scrollLeft - idx * el.clientWidth) > 4) e.preventDefault();
    };
    return (
        <a className="card" href={productPath(product)}>
            <div className="card-media">
                <div className="card-swipe" ref={stripRef} onScroll={onStripScroll} onClickCapture={onStripClick}>
                    {product.photos.map((ph, i) => (
                        <div className="card-slide" key={`${ph.s}-${ph.x}-${ph.y}-${ph.src ?? ''}-${i}`}>
                            <Photo ph={ph} mode="cover" className="card-photo" lazy />
                        </div>
                    ))}
                </div>
                {multi && <button type="button" className="card-nav card-prev" onClick={(e) => go(e, -1)} aria-label="Previous photo">&#8249;</button>}
                {multi && <button type="button" className="card-nav card-next" onClick={(e) => go(e, 1)} aria-label="Next photo">&#8250;</button>}
                {multi && <div className="card-dots" aria-hidden="true">{product.photos.map((_, i) => <span key={i} className={i === idx ? 'on' : ''} />)}</div>}
            </div>
            <span className="card-cat">{product.category === 'Watch' ? 'Watches' : product.category === 'Sunglass' ? 'Sunglasses' : 'Accessories'}{product.gender === 'L' ? ' - Ladies' : product.gender === 'M' ? ' - Men' : ''}</span>
            <span className="card-name">{product.name}</span>
            <span className="card-price">{product.price}</span>
        </a>
    );
}

type Cat = 'All' | 'Watch' | 'Sunglass' | 'Accessories';
type WatchSub = 'ALL' | 'L' | 'M';
const COLLECTIONS: [Cat, string][] = [['All', 'ALL MODELS'], ['Watch', 'WATCHES'], ['Sunglass', 'SUNGLASSES'], ['Accessories', 'ACCESSORIES']];
const WATCH_SUBS: [WatchSub, string][] = [['ALL', 'ALL WATCHES'], ['L', 'LADIES'], ['M', 'MEN']];

const CHANNEL_BANNER_DISMISSED_KEY = 'branditems-wa-channel-banner-dismissed';

function WhatsAppChannelBanner() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return window.sessionStorage.getItem(CHANNEL_BANNER_DISMISSED_KEY) !== '1';
        } catch {
            return true;
        }
    });

    const dismiss = () => {
        try {
            window.sessionStorage.setItem(CHANNEL_BANNER_DISMISSED_KEY, '1');
        } catch {
            // Keep the banner dismissible if browser storage is unavailable.
        }
        setVisible(false);
    };

    if (!visible) return null;
    return (
        <aside className="wa-channel-banner" aria-label="Join our WhatsApp Channel">
            <span className="wa-channel-icon" aria-hidden="true"><WhatsAppIcon /></span>
            <p>Join our WhatsApp Channel</p>
            <a className="wa-channel-join" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noreferrer">Join</a>
            <button className="wa-channel-close" type="button" onClick={dismiss} aria-label="Dismiss WhatsApp channel banner">×</button>
        </aside>
    );
}

export function App() {
    const [cat, setCat] = useState<Cat>('All');
    const [sub, setSub] = useState<WatchSub>('ALL');
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState<Product | null>(null);
    const scrollY = useRef(0);
    useEffect(() => {
        const fromHash = () => {
            const m = window.location.hash.match(/#\/?p=(bi|wm)(\d+)/) || window.location.pathname.match(/^\/p\/(bi|wm)(\d+)\/?$/);
            if (!m) {
                setOpen(null);
                requestAnimationFrame(() => window.scrollTo(0, scrollY.current));
                return;
            }
            const p = productFromAnchor(m[1] + m[2]);
            setOpen((prev) => {
                if (!prev) scrollY.current = window.scrollY;
                requestAnimationFrame(() => window.scrollTo(0, 0));
                return p ?? null;
            });
        };
        fromHash();
        window.addEventListener('hashchange', fromHash);
        return () => window.removeEventListener('hashchange', fromHash);
    }, []);
    const filtered = useMemo(() => products.filter((p) =>
        (cat === 'All' || p.category === cat) &&
        (cat !== 'Watch' || sub === 'ALL' || p.gender === sub) &&
        (!query || p.name.toLowerCase().includes(query.toLowerCase()))
    ), [cat, sub, query]);
    return (
        <>
        <main className="catalogue">
            <div className="shop">
                <div className="topbar">
                    <a href="#/" className="logo-text" aria-label="BRANDITEMS home"><img src="logo.png" alt="BRANDITEMS - Simple Shopping" className="logo-img" width="900" height="191" fetchPriority="high" decoding="async" /></a>
                    <a className="wa-icon" href={WA_GENERAL_URL} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><WhatsAppIcon /></a>
                </div>
                {open ? <ProductPage product={open} /> : (
                    <>
                        <p className="eyebrow">Watch · Sunglasses · Accessories</p>
                        <h1 className="title">THE COLLECTION</h1>
                        <p className="count">{filtered.length} of {products.length} models</p>
                        <div className="pills" role="group" aria-label="Collection">
                            {COLLECTIONS.map(([c, label]) => (
                                <button key={c} className={`pill${c === cat ? ' is-active' : ''}`} onClick={() => { setCat(c); setSub('ALL'); }}>{label}</button>
                            ))}
                        </div>
                        {cat === 'Watch' && (
                            <div className="pills pills-sub" role="group" aria-label="Watches for">
                                {WATCH_SUBS.map(([s, label]) => (
                                    <button key={s} className={`pill${s === sub ? ' is-active' : ''}`} onClick={() => setSub(s)}>{label}</button>
                                ))}
                            </div>
                        )}
                        <input className="search" type="search" placeholder="Search the collection" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the collection" />
                        {filtered.length === 0
                            ? <p className="empty">No models match. Try another search.</p>
                            : <div className="grid">{filtered.map((p) => <Card key={`${p.category}-${p.id}`} product={p} />)}</div>}
                    </>
                )}
                <footer className="foot">
                    <p className="socials">Follow: <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a> · <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">Telegram</a></p>
                </footer>
            </div>
        </main>
        <WhatsAppChannelBanner />
        </>
    );
}
