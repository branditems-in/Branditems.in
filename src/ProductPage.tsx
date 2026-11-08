import React, { useEffect, useRef, useState } from 'react';
import { waEnquiry, Photo, SHEETS, INSTAGRAM_URL, TELEGRAM_URL, WHATSAPP_CHANNEL_URL, FACEBOOK_URL, type Product } from './products';

function productPath(p: Product): string {
    return `#/p=${p.source === 'wm' ? 'wm' : 'bi'}${p.id}`;
}

export function ProductPage({ product }: { product: Product }) {
    const [photo, setPhoto] = useState(0);
    const stripRef = useRef<HTMLDivElement>(null);
    const scrollTimer = useRef<number | undefined>(undefined);
    useEffect(() => { setPhoto(0); stripRef.current?.scrollTo({ left: 0 }); }, [product]);
    const multi = product.photos.length > 1;
    // Preload the neighbours' full-resolution sheets so upgrading the active slide is instant.
    useEffect(() => {
        for (const i of [photo - 1, photo + 1]) {
            const ph = product.photos[i];
            if (ph && !ph.src) { const im = new Image(); im.src = SHEETS[ph.s]; }
        }
    }, [photo, product]);
    const goTo = (i: number) => {
        setPhoto(i);
        const el = stripRef.current;
        if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    };
    const onStripScroll = () => {
        window.clearTimeout(scrollTimer.current);
        scrollTimer.current = window.setTimeout(() => {
            const el = stripRef.current;
            if (el) setPhoto(Math.min(product.photos.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
        }, 90);
    };
    return (
        <div className="pdp" key={product.id + product.source}>
            <a className="pdp-back" href="#/">← Back to the collection</a>
            <div className="pdp-grid">
                <div className="pdp-gallery">
                    <div className="pdp-swipe" ref={stripRef} onScroll={onStripScroll}>
                        {product.photos.map((ph, i) => (
                            <div className="pdp-slide" key={`${ph.s}-${ph.x}-${ph.y}-${ph.src ?? ''}-${i}`}>
                                <Photo ph={ph} mode="contain" className="pdp-photo" full={i === photo} lazy={i > photo + 1} />
                            </div>
                        ))}
                    </div>
                    {multi && (
                        <div className="pdp-thumbs">
                            {product.photos.map((ph, i) => (
                                <button key={i} className={`pdp-thumb${i === photo ? ' is-active' : ''}`} onClick={() => goTo(i)} aria-label={`View photo ${i + 1}`}>
                                    <Photo ph={ph} mode="cover" className="pdp-thumb-sprite" lazy />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="pdp-body">
                    <p className="modal-cat">{product.category === 'Watch' ? 'Watches' : product.category === 'Sunglass' ? 'Sunglasses' : 'Accessories'}{product.gender === 'L' ? ' - Ladies' : product.gender === 'M' ? ' - Men' : ''}</p>
                    <h2 className="modal-name">{product.name}</h2>
                    <p className="modal-price">{product.price}</p>
                    <p className="cod-note"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8"/><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M6 9.5v.01M18 14.5v.01"/></svg><span>COD available · ₹150 extra, paid Advance</span></p>
                    <p className="modal-details-label"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h10"/></svg>Details</p>
                    <ul className="modal-details">
                        {product.details.map((d) => <li key={d}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>{d}</span></li>)}
                    </ul>
                    {product.authenticity && <p className="modal-auth"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 11v5"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/></svg><span>{product.authenticity}</span></p>}
                    <a className="cta" href={waEnquiry(product)} target="_blank" rel="noreferrer">Order on WhatsApp <span aria-hidden="true">↗</span></a>
                </div>
            </div>
            <div className="social-block">
                <h3 className="social-title">New arrivals, first.</h3>
                <p className="social-sub">Follow BRANDITEMS.IN for new models and restocks.</p>
                <div className="social-btns">
                    <a className="social-btn" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noreferrer">WhatsApp Channel <span aria-hidden="true">↗</span></a>
                    <a className="social-btn" href={TELEGRAM_URL} target="_blank" rel="noreferrer">Telegram <span aria-hidden="true">↗</span></a>
                    <a className="social-btn" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
                    <a className="social-btn" href={FACEBOOK_URL} target="_blank" rel="noreferrer">Facebook <span aria-hidden="true">↗</span></a>
                </div>
            </div>
        </div>
    );
}

export { productPath };