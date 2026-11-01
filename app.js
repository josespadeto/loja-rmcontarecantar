const DeckStoreApp = (() => {
    'use strict';

    const products = [
        { id: 'RM-EBK-01', name: 'Livro: Crônicas e Bastidores', description: 'Mergulhe nas histórias e lore cultural exclusivas da era de ouro do rádio. Uma leitura leve, porém rica em detalhes históricos que não se encontram em biografias tradicionais.', price: 47.90, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800' },
        { id: 'RM-TSH-02', name: 'Camiseta: Bossa & Alma', description: 'Vestuário que canta. Algodão premium 100%, com caimento perfeito. Estampa sutil em silk screen fazendo referência aos grandes festivais de música popular brasileira.', price: 89.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800' },
        { id: 'RM-VNL-03', name: 'Vinil: Contar e Cantar', description: 'A experiência analógica suprema. Curadoria exclusiva prensada em disco de 180g. Uma viagem sonora pela nossa memória, com encarte duplo contendo letras e fotos de acervo.', price: 249.90, image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800' },
        { id: 'RM-BOX-04', name: 'Box: A História Completa', description: 'A experiência definitiva de colecionador. Inclui o livro físico de pesquisa, o vinil especial de 180g, um pôster exclusivo e um encarte fotográfico em alta resolução.', price: 349.90, image: 'https://images.unsplash.com/photo-1611004944410-6819ce2f8319?q=80&w=800' }
    ];

    let cart = [];

    const initCart = () => {
        try { cart = JSON.parse(localStorage.getItem('rm_cart')) || []; } catch (e) { cart = []; }
        updateCartCount();
    };

    const saveCart = () => {
        localStorage.setItem('rm_cart', JSON.stringify(cart));
        updateCartCount();
    };

    const updateCartCount = () => {
        const count = cart.reduce((total, item) => total + item.qty, 0);
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = count;
    };

    const formatPrice = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const showToast = (message, isError = false) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `${isError ? 'bg-red-600' : 'bg-surface border border-gold/30'} text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 opacity-0 translate-y-4 font-medium flex items-center gap-3`;
        toast.innerHTML = `<svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${message}`;
        
        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-4');
            toast.classList.add('opacity-100', 'translate-y-0');
        });
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // --- RENDERIZAÇÃO DA VITRINE (Com botões permanentemente visíveis) ---
    const renderProducts = () => {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        grid.innerHTML = ''; 
        
        products.forEach(product => {
            const article = document.createElement('article');
            article.className = "group bg-surface rounded-2xl shadow-xl overflow-hidden border border-white/10 flex flex-col transform transition-all duration-300 hover:border-gold/50";
            
            article.innerHTML = `
                <a href="product.html?id=${product.id}" class="block relative overflow-hidden aspect-[4/3] bg-black/40">
                    <img src="${product.image}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                </a>
                <div class="p-8 flex flex-col flex-grow justify-between">
                    <div>
                        <a href="product.html?id=${product.id}">
                            <h3 class="font-serif text-2xl mb-3 text-white hover:text-gold transition-colors">${product.name}</h3>
                        </a>
                        <p class="text-muted text-sm mb-6 leading-relaxed line-clamp-2">${product.description}</p>
                    </div>
                    
                    <div class="flex flex-col gap-4 pt-4 border-t border-white/10 mt-auto">
                        <div class="flex items-center justify-between">
                            <span class="text-xs uppercase tracking-widest text-muted">Valor</span>
                            <span class="text-2xl font-bold text-white">${formatPrice(product.price)}</span>
                        </div>
                        <!-- Botão fixo e sempre visível -->
                        <a href="product.html?id=${product.id}" class="w-full bg-white text-black text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold transition-colors block">
                            Ver Detalhes da Obra
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(article);
        });
    };

    // --- RENDERIZAÇÃO DA PÁGINA DO PRODUTO (product.html) ---
    const renderProductPage = () => {
        const container = document.getElementById('product-container');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (!product) {
            container.innerHTML = `<div class="text-center py-32"><h2 class="font-serif text-3xl mb-4 text-white">Obra não encontrada</h2><a href="index-master.html" class="text-gold underline text-sm tracking-widest uppercase">Voltar ao Acervo</a></div>`;
            return;
        }

        container.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-16 items-center">
                <div class="lg:w-1/2 w-full">
                    <div class="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] bg-surface">
                        <img src="${product.image}" class="w-full h-full object-cover">
                    </div>
                </div>
                
                <div class="lg:w-1/2 w-full flex flex-col justify-center">
                    <span class="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Edição de Colecionador</span>
                    <h1 class="font-serif text-5xl lg:text-6xl text-white mb-6 leading-tight">${product.name}</h1>
                    <p class="text-muted text-base lg:text-lg mb-8 leading-relaxed font-light">${product.description}</p>
                    
                    <div class="text-4xl font-bold text-white mb-10">${formatPrice(product.price)}</div>
                    
                    <div class="flex flex-col sm:flex-row gap-4">
                        <input type="number" id="qty-input" value="1" min="1" class="w-full sm:w-28 px-4 py-4 bg-surface border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-gold focus:outline-none transition">
                        <button id="add-to-cart-btn" class="flex-grow bg-gold text-black px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            const qty = parseInt(document.getElementById('qty-input').value) || 1;
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) existingItem.qty += qty;
            else cart.push({ ...product, qty: qty });
            saveCart();
            showToast(`${qty}x "${product.name}" adicionado ao carrinho!`);
        });
    };

    const changeQuantity = (productId, delta) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
            saveCart();
            renderCart();
            renderCheckoutSummary();
        }
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        renderCheckoutSummary();
    };

    const renderCart = () => { 
        const container = document.getElementById('cart-container');
        if (!container) return;
        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = `<div class="w-full text-center py-24 bg-surface rounded-3xl border border-white/10"><p class="text-muted text-lg mb-6">Seu carrinho está vazio.</p><a href="index-master.html" class="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gold transition">&larr; Voltar ao Acervo</a></div>`;
            return;
        }
        let subtotal = 0;
        const fragment = document.createDocumentFragment();
        const itemsWrapper = document.createElement('div');
        itemsWrapper.className = "lg:w-2/3 flex flex-col gap-4";

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            const itemCard = document.createElement('div');
            itemCard.className = "flex flex-col sm:flex-row items-center justify-between bg-surface p-6 rounded-2xl border border-white/10 gap-4";
            itemCard.innerHTML = `
                <div class="flex items-center gap-4 w-full sm:w-auto"><img src="${item.image}" class="w-20 h-20 rounded-xl object-cover border border-white/10">
                <div><h4 class="font-serif text-xl text-white">${item.name}</h4><span class="text-xs text-muted tracking-widest uppercase">${formatPrice(item.price)} un.</span></div></div>
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div class="flex items-center bg-black/40 border border-white/20 rounded-xl"><button class="btn-minus px-4 py-2 hover:bg-white/10 rounded-l-xl transition font-bold text-white">-</button><span class="px-4 font-bold text-white">${item.qty}</span><button class="btn-plus px-4 py-2 hover:bg-white/10 rounded-r-xl transition font-bold text-white">+</button></div>
                <div class="font-bold text-white min-w-[6rem] text-right text-lg">${formatPrice(itemTotal)}</div>
                <button class="btn-remove text-muted hover:text-red-400 p-2 rounded-lg transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>
            `;
            itemCard.querySelector('.btn-minus').addEventListener('click', () => changeQuantity(item.id, -1));
            itemCard.querySelector('.btn-plus').addEventListener('click', () => changeQuantity(item.id, 1));
            itemCard.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));
            itemsWrapper.appendChild(itemCard);
        });

        const summaryWrapper = document.createElement('div');
        summaryWrapper.className = "lg:w-1/3";
        summaryWrapper.innerHTML = `
            <div class="bg-surface p-8 rounded-3xl border border-white/10 sticky top-32">
                <h3 class="font-serif text-2xl border-b border-white/10 pb-4 mb-6 text-white">Resumo da Compra</h3>
                <div class="flex justify-between mb-8 text-xl"><span class="text-muted text-sm uppercase tracking-widest">Total</span><span class="font-bold text-white">${formatPrice(subtotal)}</span></div>
                <a href="checkout.html" class="block w-full bg-gold text-black text-center px-4 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition">Avançar para Pagamento</a>
            </div>
        `;
        fragment.appendChild(itemsWrapper);
        fragment.appendChild(summaryWrapper);
        container.appendChild(fragment);
    };

    const renderCheckoutSummary = () => {
        const itemsContainer = document.getElementById('checkout-items');
        const totalContainer = document.getElementById('checkout-total');
        if (!itemsContainer || !totalContainer) return;
        if (cart.length === 0) { window.location.href = "index-master.html"; return; }

        let subtotal = 0;
        itemsContainer.innerHTML = '';
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const row = document.createElement('div');
            row.className = "flex justify-between items-center";
            row.innerHTML = `<span class="flex-grow text-muted text-sm">${item.qty}x ${item.name}</span><span class="font-bold text-white">${formatPrice(item.price * item.qty)}</span>`;
            itemsContainer.appendChild(row);
        });
        totalContainer.textContent = formatPrice(subtotal);

        const form = document.getElementById('checkout-form');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                processPaymentMock();
            });
        }
    };

    const processPaymentMock = () => {
        const overlay = document.getElementById('loading-overlay');
        const btn = document.getElementById('btn-pay');
        
        if(btn) btn.disabled = true;
        if(overlay) {
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        }

        setTimeout(() => {
            if(overlay) {
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
            
            localStorage.removeItem('rm_cart');
            cart = [];
            
            const mainContent = document.querySelector('main');
            if(mainContent) {
                mainContent.innerHTML = `
                    <div class="text-center py-32">
                        <div class="w-24 h-24 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/30">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h1 class="font-serif text-5xl text-white mb-4">Simulação Concluída</h1>
                        <p class="text-muted text-lg mb-8 max-w-md mx-auto">O fluxo do laboratório estático funcionou perfeitamente. Os dados simulados foram processados.</p>
                        <a href="index-master.html" class="bg-white text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gold transition inline-block">Retornar ao Acervo</a>
                    </div>
                `;
            }
            updateCartCount();
        }, 2000);
    };

    return {
        init: () => {
            initCart();
            renderProducts(); 
            renderProductPage();
            renderCart();     
            renderCheckoutSummary();
        }
    };
})();

document.addEventListener('DOMContentLoaded', DeckStoreApp.init);
