import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Loader, RotateCcw, ZoomIn, ZoomOut, Move, Trash2, ShoppingCart, Plus } from 'lucide-react';
import { uploadImage } from '../../services/cloudinary';
import { authService } from '../../services/authService';
import { checkoutService } from '../../services/checkoutService';
import axios from 'axios';
import './CustomPage.css';

const CATEGORY_CONFIG = {
    'T-SHIRTS': {
        views: ['Front', 'Back', 'Left', 'Right'],
        images: { Front: '/tshirt-front.png', Back: '/tshirt-back.png', Left: '/tshirt-side-left.png', Right: '/tshirt-side-right.png' },
        printArea: { top: 0.22, left: 0.28, width: 0.44, height: 0.45 },
        thumbnail: '/category-tshirt.jpg',
        customizable: true,
        subImages: {
            'CREW NECK': { Front: '/tshirt-front.png', Back: '/tshirt-back.png', Left: '/tshirt-side-left.png', Right: '/tshirt-side-right.png' },
            'V-NECK': { Front: '/vneck-tshirt-front.png', Back: '/vneck-tshirt-back.png', Left: '/tshirt-side-left.png', Right: '/tshirt-side-right.png' },
            'POLO': { Front: '/polo-front.png', Back: '/polo-back.png', Left: '/polo-side-left.png', Right: '/polo-side-right.png' },
        },
    },
    'DENIMS': {
        views: ['Front', 'Back'],
        images: { Front: '/denim-front.png', Back: '/denim-back.png' },
        printArea: { top: 0.25, left: 0.30, width: 0.40, height: 0.35 },
        thumbnail: '/category-denim.jpg',
        customizable: true,
        subImages: {
            'SLIM FIT': { Front: '/denim-front.png', Back: '/denim-back.png' },
            'REGULAR': { Front: '/denim-front.png', Back: '/denim-back.png' },
            'WIDE LEG': { Front: '/denim-front.png', Back: '/denim-back.png' },
        },
    },
    'TOTE BAGS': {
        views: ['Front'],
        images: { Front: '/tote-front.png' },
        printArea: { top: 0.38, left: 0.18, width: 0.64, height: 0.42 },
        thumbnail: '/category-tote.jpg',
        customizable: true,
    },
    'ACCESSORIES': {
        views: [],
        images: {},
        printArea: { top: 0, left: 0, width: 0, height: 0 },
        thumbnail: '/category-accessories.jpg',
        customizable: false,
    },
};

const DEFAULT_CONFIG = {
    views: ['Front', 'Back'],
    images: { Front: '/tshirt-front.jpg', Back: '/tshirt-back.jpg' },
    printArea: { top: 0.22, left: 0.28, width: 0.44, height: 0.45 },
    thumbnail: null,
};

function getCategoryConfig(categoryName) {
    if (!categoryName) return DEFAULT_CONFIG;
    return CATEGORY_CONFIG[categoryName.toUpperCase()] || DEFAULT_CONFIG;
}

function getActiveImages(categoryName, subName) {
    const cfg = getCategoryConfig(categoryName);
    if (!subName || !cfg.subImages) return cfg.images;
    return cfg.subImages[subName.toUpperCase()] || cfg.images;
}

const defaultDesign = () => ({ url: null, x: 0, y: 0, scale: 1, rotation: 0 });

function designKey(subId, view) {
    return `${subId ?? 'none'}__${view}`;
}

function loadImage(src, crossOrigin = true) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function buildComposite(garmentSrc, design, printArea, domWidth, domHeight) {
    const OUTPUT_W = 1200;
    const OUTPUT_H = 1200;

    const sx = OUTPUT_W / domWidth;
    const sy = OUTPUT_H / domHeight;

    const [garmentImg, designImg] = await Promise.all([
        loadImage(garmentSrc, false),
        loadImage(design.url, true),
    ]);

    const offscreen = document.createElement('canvas');
    offscreen.width = OUTPUT_W;
    offscreen.height = OUTPUT_H;
    const ctx = offscreen.getContext('2d');

    ctx.drawImage(garmentImg, 0, 0, OUTPUT_W, OUTPUT_H);

    const paLeft = printArea.left * OUTPUT_W;
    const paTop = printArea.top * OUTPUT_H;
    const paWidth = printArea.width * OUTPUT_W;
    const paHeight = printArea.height * OUTPUT_H;

    const pivotX = paLeft + paWidth / 2 + design.x * sx;
    const pivotY = paTop + paHeight / 2 + design.y * sy;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate((design.rotation * Math.PI) / 180);
    ctx.scale(design.scale, design.scale);
    ctx.drawImage(designImg, -paWidth / 2, -paHeight / 2, paWidth, paHeight);
    ctx.restore();

    return new Promise(resolve => offscreen.toBlob(resolve, 'image/png'));
}

const MODE_SINGLE = 'single';
const MODE_WHOLESALE = 'wholesale';

export default function CustomPage() {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [activeView, setActiveView] = useState('Front');
    const [gsm, setGsm] = useState('GSM');
    const [material, setMaterial] = useState('Material');
    const [size, setSize] = useState('Size');
    const [color, setColor] = useState('Color');
    const [qty, setQty] = useState(1);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [designs, setDesigns] = useState({});
    const [uploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [orderMode, setOrderMode] = useState(MODE_SINGLE);
    const [variations, setVariations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const drag = useRef(null);

    const config = getCategoryConfig(selectedCategory?.categoryName);
    const { views, printArea: PRINT_AREA } = config;
    const tshirtImages = getActiveImages(selectedCategory?.categoryName, selectedSub?.name);

    const GSM_PRICES = { '180 GSM': 800, '200 GSM': 1000, '220 GSM': 1200 };
    const MATERIAL_PRICES = { Cotton: 500, Polyester: 300, Blend: 400 };
    const SIZE_PRICES = { XS: 0, S: 0, M: 100, L: 200, XL: 300, XXL: 400 };

    const unitPrice = (GSM_PRICES[gsm] || 0) + (MATERIAL_PRICES[material] || 0) + (SIZE_PRICES[size] || 0);
    const singleTotal = unitPrice * qty;

    const subId = selectedSub?.id ?? 'none';
    const currentDesign = designs[designKey(subId, activeView)] || defaultDesign();

    const setCurrentDesign = (patch) => {
        const k = designKey(subId, activeView);
        setDesigns(d => ({
            ...d,
            [k]: {
                ...(d[k] || defaultDesign()),
                ...(typeof patch === 'function' ? patch(d[k] || defaultDesign()) : patch),
            },
        }));
    };

    useEffect(() => {
        if (!selectedCategory) return;
        const cfg = getCategoryConfig(selectedCategory.categoryName);
        setDesigns({});
        setActiveView(cfg.views[0] || 'Front');
        setGsm('GSM'); setMaterial('Material'); setSize('Size'); setColor('Color');
        setQty(1); setVariations([]);
    }, [selectedCategory]);

    useEffect(() => {
        axios.get('/api/categories')
            .then(res => { const data = res.data; setCategories(data); if (data.length) setSelectedCategory(data[0]); })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;
        axios.get(`/api/subcategories/${selectedCategory.categoryId}`)
            .then(res => { const data = res.data; setSubCategories(data); setSelectedSub(data[0] || null); })
            .catch(console.error);
    }, [selectedCategory]);

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);
        const localUrl = URL.createObjectURL(file);
        const k = designKey(subId, activeView);
        setDesigns(d => ({
            ...d,
            [k]: { ...(d[k] || defaultDesign()), url: localUrl, _file: file, x: 0, y: 0, scale: 1, rotation: 0 },
        }));
        e.target.value = '';
    }

    function handleClearUpload() {
        setCurrentDesign({ url: null, _file: null, x: 0, y: 0, scale: 1, rotation: 0 });
        setUploadError(null);
    }

    const onPointerDown = useCallback((e) => {
        if (!currentDesign.url) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = {
            startX: e.clientX, startY: e.clientY,
            origX: currentDesign.x, origY: currentDesign.y,
            key: designKey(subId, activeView),
        };
    }, [currentDesign, activeView, subId]);

    const onPointerMove = useCallback((e) => {
        if (!drag.current) return;
        const { key, origX, origY, startX, startY } = drag.current;
        setDesigns(d => ({
            ...d,
            [key]: { ...(d[key] || defaultDesign()), x: origX + e.clientX - startX, y: origY + e.clientY - startY },
        }));
    }, []);

    const onPointerUp = useCallback(() => { drag.current = null; }, []);

    useEffect(() => {
        function onKey(e) {
            if (!currentDesign.url) return;
            const step = e.shiftKey ? 10 : 2;
            const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
            if (map[e.key]) {
                e.preventDefault();
                const [dx, dy] = map[e.key];
                setCurrentDesign(d => ({ x: d.x + dx, y: d.y + dy }));
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentDesign.url, setCurrentDesign]);

    // validate options
    function validateOptions() {
        const anyDesign = views.some(v => designs[designKey(subId, v)]?.url);
        if (!anyDesign) { alert('Please upload your design first'); return false; }
        if (gsm === 'GSM') { alert('Please select GSM'); return false; }
        if (material === 'Material') { alert('Please select a material'); return false; }
        if (size === 'Size') { alert('Please select a size'); return false; }
        if (color === 'Color') { alert('Please select a color'); return false; }
        return true;
    }

    function handleAddVariation() {
        if (!validateOptions()) return;
        const designUrl = views.map(v => designs[designKey(subId, v)]?.url).find(Boolean);
        setVariations(v => [...v, {
            id: Date.now(), gsm, material, size, color, qty, unitPrice,
            total: unitPrice * qty, designUrl,
        }]);
        setGsm('GSM'); setMaterial('Material'); setSize('Size'); setColor('Color'); setQty(1);
    }

    function handleRemoveVariation(id) { setVariations(v => v.filter(i => i.id !== id)); }

    function handleVariationQty(id, newQty) {
        if (newQty < 1) return;
        setVariations(v => v.map(i => i.id === id ? { ...i, qty: newQty, total: i.unitPrice * newQty } : i));
    }

    const grandTotal = variations.reduce((sum, v) => sum + v.total, 0);
    const grandQty = variations.reduce((sum, v) => sum + v.qty, 0);

    // ── Parallel screenshot capture & upload ──
    async function captureScreenshots() {
        const activeImages = getActiveImages(selectedCategory?.categoryName, selectedSub?.name);
        const domW = canvasRef.current?.offsetWidth || 600;
        const domH = canvasRef.current?.offsetHeight || 480;

        const viewsWithDesigns = views.filter(view => designs[designKey(subId, view)]?.url);

        const results = await Promise.all(
            viewsWithDesigns.map(async (view) => {
                const d = designs[designKey(subId, view)];
                const garmentSrc = activeImages[view];
                const blob = await buildComposite(garmentSrc, d, PRINT_AREA, domW, domH);
                const compositeFile = new File(
                    [blob],
                    `composite-${view.toLowerCase()}.png`,
                    { type: 'image/png' }
                );
                const url = await uploadImage(compositeFile);
                return [view, url];
            })
        );

        return Object.fromEntries(results);
    }

    async function handleSingleCheckout() {
        if (!selectedCategory) return alert('Please select a category');
        if (!validateOptions()) return;

        const user = authService.getUserDetails();
        if (!user) return alert('Please log in to place an order');

        setCheckoutLoading(true);
        try {
            const shots = await captureScreenshots();
            const mainDesignUrl = shots['Front'] || Object.values(shots)[0] || '';

            await axios.post('/api/custom-orders', {
                customerId: user.id,
                categoryName: selectedCategory.categoryName,
                subCategoryName: selectedSub?.name || '',
                gsm, material, size, color, quantity: qty,
                designImageUrl: mainDesignUrl,
                allDesignImageUrls: JSON.stringify(shots),
                totalPrice: singleTotal,
            });

            window.dispatchEvent(new Event('cart-updated'));
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    }

    async function handleWholesaleCheckout() {
        if (!selectedCategory) return alert('Please select a category');
        if (variations.length === 0) return alert('Please add at least one variation');

        const user = authService.getUserDetails();
        if (!user) {
            alert('Please log in to place orders');
            return;
        }

        setShowModal(false);
        setCheckoutLoading(true);
        try {
            const shots = await captureScreenshots();
            const mainDesignUrl = shots['Front'] || Object.values(shots)[0] || '';
            let allOk = true;
            const createdIds = [];
            for (const v of variations) {
                try {
                    const orderResponse = await axios.post('/api/custom-orders', {
                        customerId: user.id,
                        categoryName: selectedCategory.categoryName,
                        subCategoryName: selectedSub?.name || '',
                        gsm: v.gsm, material: v.material, size: v.size, color: v.color,
                        quantity: v.qty,
                        designImageUrl: mainDesignUrl,
                        allDesignImageUrls: JSON.stringify(shots),
                        totalPrice: v.total,
                    });
                    if (orderResponse.data?.id) {
                        createdIds.push(orderResponse.data.id);
                    }
                } catch {
                    allOk = false;
                }
            }
            if (allOk) {
                setVariations([]);
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                alert('Some variations failed to save.');
                return;
            }
            const session = await checkoutService.createCustomOrdersSession(createdIds);
            if (session?.url) {
                window.location.href = session.url;
            } else {
                alert('Unable to start payment.');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    }

    return (
        <div className="custom-page">
            <section className="custom-hero">
                <img src="/bg-web.png" alt="INKA hero" className="custom-hero__bg" />
            </section>

            <div className="custom-content">
                {/* ── Category ── */}
                <section className="custom-section">
                    <p className="custom-section__label">Select the item you want to customize</p>
                    <div className="category-grid">
                        {categories
                            .filter(cat => getCategoryConfig(cat.categoryName).customizable !== false)
                            .map(cat => {
                                const cfg = getCategoryConfig(cat.categoryName);
                                return (
                                    <button key={cat.categoryId}
                                        className={`category-card ${selectedCategory?.categoryId === cat.categoryId ? 'category-card--active' : ''}`}
                                        onClick={() => { setSelectedCategory(cat); setSelectedSub(null); }}>
                                        <div className="category-card__img-wrap">
                                            {cfg.thumbnail && (
                                                <img src={cfg.thumbnail} alt={cat.categoryName} className="category-card__img"
                                                    draggable={false} onError={e => { e.currentTarget.style.display = 'none'; }} />
                                            )}
                                        </div>
                                        <span className="category-card__label">{cat.categoryName}</span>
                                    </button>
                                );
                            })}
                    </div>
                </section>

                {/* ── Sub-category ── */}
                <section className="custom-section">
                    <p className="custom-section__label--sub">Sub-category</p>
                    <div className="subcategory-grid">
                        {subCategories.length > 0
                            ? subCategories.map(sub => (
                                <button key={sub.id}
                                    className={`subcategory-chip ${selectedSub?.id === sub.id ? 'subcategory-chip--active' : ''}`}
                                    onClick={() => setSelectedSub(sub)}>
                                    {sub.name}
                                </button>
                            ))
                            : <p className="empty-sub-label">No sub-categories available</p>
                        }
                    </div>
                </section>

                {/* ── Order mode toggle ── */}
                <div className="order-mode-toggle">
                    <button className={`mode-btn ${orderMode === MODE_SINGLE ? 'mode-btn--active' : ''}`}
                        onClick={() => setOrderMode(MODE_SINGLE)}>
                        <ShoppingCart size={14} /> Single Order
                    </button>
                    <button className={`mode-btn ${orderMode === MODE_WHOLESALE ? 'mode-btn--active' : ''}`}
                        onClick={() => setOrderMode(MODE_WHOLESALE)}>
                        <Plus size={14} /> Wholesale / Multiple Variations
                    </button>
                </div>

                {/* ── Designer layout ── */}
                <div className="designer-layout">

                    {/* LEFT: Canvas */}
                    <section className="custom-canvas-section">
                        <div className="view-tabs">
                            {views.map(view => (
                                <button key={view}
                                    className={`view-tab ${activeView === view ? 'view-tab--active' : ''}`}
                                    onClick={() => setActiveView(view)}>
                                    {view}
                                    {designs[designKey(subId, view)]?.url && <span className="view-tab__dot" />}
                                </button>
                            ))}
                        </div>

                        <div className="custom-canvas" ref={canvasRef} tabIndex={0}
                            onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>

                            <input ref={fileInputRef} type="file" accept="image/*"
                                style={{ display: 'none' }} onChange={handleFileChange} />

                            <img
                                key={`${selectedCategory?.categoryId}-${selectedSub?.id}-${activeView}`}
                                src={tshirtImages[activeView]} alt={`${activeView} view`}
                                className="canvas-tshirt-base" draggable={false}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                            />

                            <div className="canvas-print-area" style={{
                                top: `${PRINT_AREA.top * 100}%`, left: `${PRINT_AREA.left * 100}%`,
                                width: `${PRINT_AREA.width * 100}%`, height: `${PRINT_AREA.height * 100}%`,
                            }} />

                            {currentDesign.url && (
                                <div className="canvas-design-overlay"
                                    style={{
                                        top: `${PRINT_AREA.top * 100}%`, left: `${PRINT_AREA.left * 100}%`,
                                        width: `${PRINT_AREA.width * 100}%`, height: `${PRINT_AREA.height * 100}%`,
                                        cursor: 'grab',
                                    }}
                                    onPointerDown={onPointerDown}>
                                    <img src={currentDesign.url} alt="Design"
                                        className="canvas-design-img"
                                        crossOrigin="anonymous"
                                        style={{
                                            transform: `translate(${currentDesign.x}px, ${currentDesign.y}px) scale(${currentDesign.scale}) rotate(${currentDesign.rotation}deg)`,
                                        }}
                                        draggable={false}
                                    />
                                    <div className="design-drag-hint"><Move size={12} /> drag to move</div>
                                </div>
                            )}

                            {!currentDesign.url && !uploading && (
                                <button className="canvas-drop-hint"
                                    style={{
                                        top: `${(PRINT_AREA.top + PRINT_AREA.height / 2) * 100}%`,
                                        left: `${(PRINT_AREA.left + PRINT_AREA.width / 2) * 100}%`,
                                    }}
                                    onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={26} />
                                    <span>Click to upload your design</span>
                                    <span className="canvas-drop-sub">PNG with transparency works best</span>
                                </button>
                            )}

                            {uploading && (
                                <div className="canvas-uploading-overlay">
                                    <Loader size={32} className="spin" />
                                    <span>Uploading…</span>
                                </div>
                            )}

                            {uploadError && <p className="canvas-error">{uploadError}</p>}
                        </div>

                        <div className="design-toolbar">
                            <div className="design-toolbar__left">
                                <button className="toolbar-btn toolbar-btn--primary"
                                    onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    <Upload size={14} />
                                    {currentDesign.url ? 'Change' : 'Upload Design'}
                                </button>
                                {currentDesign.url && (
                                    <>
                                        <div className="toolbar-group">
                                            <button className="toolbar-icon-btn" title="Zoom out"
                                                onClick={() => setCurrentDesign(d => ({ scale: Math.max(0.2, +(d.scale - 0.1).toFixed(2)) }))}>
                                                <ZoomOut size={14} />
                                            </button>
                                            <span className="toolbar-value">{Math.round(currentDesign.scale * 100)}%</span>
                                            <button className="toolbar-icon-btn" title="Zoom in"
                                                onClick={() => setCurrentDesign(d => ({ scale: Math.min(3, +(d.scale + 0.1).toFixed(2)) }))}>
                                                <ZoomIn size={14} />
                                            </button>
                                        </div>
                                        <div className="toolbar-group">
                                            <button className="toolbar-icon-btn" title="Rotate −15°"
                                                onClick={() => setCurrentDesign(d => ({ rotation: d.rotation - 15 }))}>
                                                <RotateCcw size={14} />
                                            </button>
                                            <span className="toolbar-value">{currentDesign.rotation}°</span>
                                            <button className="toolbar-icon-btn" title="Rotate +15°"
                                                onClick={() => setCurrentDesign(d => ({ rotation: d.rotation + 15 }))}>
                                                <RotateCcw size={14} style={{ transform: 'scaleX(-1)' }} />
                                            </button>
                                        </div>
                                        <button className="toolbar-text-btn"
                                            onClick={() => setCurrentDesign({ x: 0, y: 0, scale: 1, rotation: 0 })}>
                                            Reset
                                        </button>
                                    </>
                                )}
                            </div>
                            {currentDesign.url && (
                                <button className="toolbar-btn toolbar-btn--danger" onClick={handleClearUpload}>
                                    <X size={13} /> Remove
                                </button>
                            )}
                        </div>
                        <p className="canvas-disclaimer">
                            Drag to reposition · use toolbar to scale &amp; rotate · arrow keys to nudge
                        </p>
                    </section>

                    {/* RIGHT: Options panel */}
                    <section className="options-panel">
                        <p className="options-row__label">Customise Your Order</p>

                        <div className="options-dropdowns">
                            <Select value={gsm} onChange={setGsm} options={['180 GSM', '200 GSM', '220 GSM']} placeholder="GSM" />
                            <Select value={material} onChange={setMaterial} options={['Cotton', 'Polyester', 'Blend']} placeholder="Material" />
                            <Select value={size} onChange={setSize} options={['XS', 'S', 'M', 'L', 'XL', 'XXL']} placeholder="Size" />
                            <Select value={color} onChange={setColor} options={['Black', 'White', 'Navy', 'Grey']} placeholder="Color" />
                            <div className="qty-control">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(q => q + 1)}>+</button>
                                <span className="qty-label">Qty</span>
                            </div>
                        </div>

                        {unitPrice > 0 && (
                            <div className="price-preview">
                                <span className="price-preview__label">Estimated Price</span>
                                <span className="price-preview__value">LKR {singleTotal.toLocaleString()}</span>
                            </div>
                        )}

                        {orderMode === MODE_SINGLE && (
                            <div className="single-order-actions">
                                <button className="btn-checkout btn-checkout--full"
                                    onClick={handleSingleCheckout} disabled={checkoutLoading}>
                                    {checkoutLoading ? 'Adding to Cart…' : 'Add to Cart'}
                                </button>
                                {addedToCart && (
                                    <p style={{ color: '#22a722', fontWeight: '500', marginTop: '8px', fontSize: '14px' }}>
                                        Added to cart!
                                    </p>
                                )}
                                <p className="single-order-hint">
                                    Ordering multiple sizes or colors?{' '}
                                    <button className="link-btn" onClick={() => setOrderMode(MODE_WHOLESALE)}>
                                        Switch to Wholesale
                                    </button>
                                </p>
                            </div>
                        )}

                        {orderMode === MODE_WHOLESALE && (
                            <div className="wholesale-actions">
                                <button className="btn-add-variation" onClick={handleAddVariation}>
                                    <Plus size={14} /> Add Variation
                                </button>

                                {variations.length > 0 && (
                                    <div className="variations-list">
                                        <p className="variations-list__title">Order Variations ({variations.length})</p>
                                        {variations.map((v, i) => (
                                            <div key={v.id} className="variation-item">
                                                <span className="variation-item__num">{i + 1}</span>
                                                <div className="variation-item__details">
                                                    <span>{v.size} · {v.color} · {v.material} · {v.gsm}</span>
                                                    <span className="variation-item__price">LKR {v.total.toLocaleString()}</span>
                                                </div>
                                                <div className="variation-item__qty">
                                                    <button onClick={() => handleVariationQty(v.id, v.qty - 1)}>−</button>
                                                    <span>{v.qty}</span>
                                                    <button onClick={() => handleVariationQty(v.id, v.qty + 1)}>+</button>
                                                </div>
                                                <button className="variation-item__remove" onClick={() => handleRemoveVariation(v.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="variations-grand-total">
                                            <span>Grand Total ({grandQty} items)</span>
                                            <span>LKR {grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {variations.length > 0 && (
                                    <button className="btn-checkout btn-checkout--full"
                                        onClick={() => setShowModal(true)} disabled={checkoutLoading}>
                                        {checkoutLoading ? 'Starting Payment…' : `Checkout (${variations.length} variation${variations.length > 1 ? 's' : ''})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Order Summary</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            {variations.map((v, i) => (
                                <div key={v.id} className="modal-variation-item">
                                    <span className="modal-variation-num">{i + 1}</span>
                                    <div className="modal-variation-details">
                                        <span className="modal-variation-label">{v.size} · {v.color} · {v.material} · {v.gsm}</span>
                                        <span className="modal-variation-sub">Qty: {v.qty} · LKR {v.total.toLocaleString()}</span>
                                    </div>
                                    <button className="modal-variation-remove" onClick={() => handleRemoveVariation(v.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <div className="modal-total">
                                <span>Grand Total</span>
                                <span>LKR {grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="modal-btn-confirm" onClick={handleWholesaleCheckout}
                                    disabled={checkoutLoading || variations.length === 0}>
                                    {checkoutLoading ? 'Processing…' : 'Confirm & Pay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Select({ value, onChange, options, placeholder }) {
    const isPlaceholder = value === placeholder;
    return (
        <div className="custom-select-wrapper">
            <select
                className={`custom-select ${isPlaceholder ? 'custom-select--placeholder' : 'custom-select--selected'}`}
                value={isPlaceholder ? '' : value}
                onChange={e => onChange(e.target.value || placeholder)}>
                <option value="" disabled hidden>{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="custom-select-arrow">▾</span>
        </div>
    );
}