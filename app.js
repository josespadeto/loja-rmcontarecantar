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
        toast.className = `${isError ? 'bg-red-600' : 'bg-brand'} text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 opacity-0 translate-y-4 font-medium flex items-center gap-3 border ${isError ? 'border-red-500' : 'border-gray-700'}`;
        toast.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${message}`;
        
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

    // --- RENDERIZAÇÃO DA VITRINE (index.html) ---
    const renderProducts = () => {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        grid.innerHTML = ''; 
        
        products.forEach(product => {
            const article = document.createElement('article');
            article.className = "group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2";
            
            // O card inteiro agora é um link para a product.html
            article.innerHTML = `
                <a href="product.html?id=${product.id}" class="block relative overflow-hidden aspect-[4/3]">
                    <img src="${product.image}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors duration-300"></div>
                </a>
                <div class="p-6 flex flex-col flex-grow">
                    <a href="product.html?id=${product.id}"><h3 class="text-xl font-bold mb-2 text-gray-900 leading-tight hover:text-accent transition">${product.name}</h3></a>
                    <p class="text-sm text-gray-500 mb-6 flex-grow leading-relaxed line-clamp-2">${product.description}</p>
                    <div class="flex flex-col mt-auto gap-4">
                        <span class="text-2xl font-black text-brand">${formatPrice(product.price)}</span>
                        <a href="product.html?id=${product.id}" class="w-full bg-accent text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-center">Ver Detalhes</a>
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

        // Pega o ID da URL (ex: ?id=RM-EBK-01)
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (!product) {
            container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold">Produto não encontrado</h2><a href="index.html" class="text-accent mt-4 inline-block">Voltar ao Acervo</a></div>`;
            return;
        }

        container.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-12 lg:gap-20">
                <!-- Imagem Gigante -->
                <div class="lg:w-1/2">
                    <div class="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                        <img src="${product.image}" class="w-full h-auto object-cover hover:scale-105 transition-transform duration-700">
                    </div>
                </div>
                
                <!-- Detalhes e Compra -->
                <div class="lg:w-1/2 flex flex-col justify-center">
                    <span class="text-highlight font-bold tracking-widest text-sm uppercase mb-3">Edição Limitada</span>
                    <h1 class="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">${product.name}</h1>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">${product.description}</p>
                    
                    <div class="text-5xl font-black text-brand mb-10">${formatPrice(product.price)}</div>
                    
                    <div class="flex gap-4">
                        <input type="number" id="qty-input" value="1" min="1" class="w-24 px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:border-accent focus:outline-none transition">
                        <button id="add-to-cart-btn" class="flex-grow bg-accent text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                    
                    <div class="mt-8 pt-8 border-t border-gray-200 flex items-center gap-4 text-sm text-gray-500">
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>Pagamento Seguro e Processamento Imediato no Laboratório.</span>
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
            showToast(`${qty}x "${product.name}" adicionado!`);
        });
    };

    // --- CARRINHO & CHECKOUT (Restante do Código Mantido, apenas Simulador no Final) ---
    const changeQuantity = (productId, delta) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
            saveCart();
            renderCart();
            renderCheckoutSummary(); // Atualiza se estiver no checkout
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
            container.innerHTML = `<div class="w-full text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"><p class="text-gray-500 text-lg mb-6">Seu carrinho está vazio.</p><a href="index.html" class="bg-accent text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition">&larr; Voltar ao Acervo</a></div>`;
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
            itemCard.className = "flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4";
            itemCard.innerHTML = `
                <div class="flex items-center gap-4 w-full sm:w-auto"><img src="${item.image}" class="w-20 h-20 rounded-lg object-cover shadow-sm">
                <div><h4 class="font-bold text-gray-900">${item.name}</h4><span class="text-sm text-gray-500">${formatPrice(item.price)} un.</span></div></div>
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div class="flex items-center bg-gray-50 border border-gray-200 rounded-lg"><button class="btn-minus px-4 py-2 hover:bg-gray-200 rounded-l-lg transition font-bold text-gray-600">-</button><span class="px-4 font-bold text-gray-800">${item.qty}</span><button class="btn-plus px-4 py-2 hover:bg-gray-200 rounded-r-lg transition font-bold text-gray-600">+</button></div>
                <div class="font-black text-gray-900 min-w-[6rem] text-right text-lg">${formatPrice(itemTotal)}</div>
                <button class="btn-remove text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>
            `;
            itemCard.querySelector('.btn-minus').addEventListener('click', () => changeQuantity(item.id, -1));
            itemCard.querySelector('.btn-plus').addEventListener('click', () => changeQuantity(item.id, 1));
            itemCard.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));
            itemsWrapper.appendChild(itemCard);
        });

        const summaryWrapper = document.createElement('div');
        summaryWrapper.className = "lg:w-1/3";
        summaryWrapper.innerHTML = `
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 class="text-xl font-black border-b border-gray-100 pb-4 mb-6 text-gray-900">Resumo da Compra</h3>
                <div class="flex justify-between mb-8 text-xl"><span class="text-gray-600">Total:</span><span class="font-black text-brand">${formatPrice(subtotal)}</span></div>
                <a href="checkout.html" class="block w-full bg-accent text-white text-center px-4 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 hover:shadow-lg transition">Avançar para Pagamento</a>
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
        if (cart.length === 0) { window.location.href = "index.html"; return; }

        let subtotal = 0;
        itemsContainer.innerHTML = '';
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const row = document.createElement('div');
            row.className = "flex justify-between items-center";
            row.innerHTML = `<span class="flex-grow text-gray-600 font-medium">${item.qty}x ${item.name}</span><span class="font-bold text-gray-900">${formatPrice(item.price * item.qty)}</span>`;
            itemsContainer.appendChild(row);
        });
        totalContainer.textContent = formatPrice(subtotal);

        // Simulador de Formulário (Ignora validação de CPF real para fluidez de teste)
        const form = document.getElementById('checkout-form');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                processPaymentMock();
            });
        }
    };

    // --- SIMULADOR DE SUCESSO (Sem Vercel/Sem Mercado Pago) ---
    const processPaymentMock = () => {
        const overlay = document.getElementById('loading-overlay');
        const btn = document.getElementById('btn-pay');
        
        btn.disabled = true;
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);

        // Finge que está pensando por 2 segundos
        setTimeout(() => {
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            
            // Esvazia o carrinho e joga pra Home com mensagem de sucesso
            localStorage.removeItem('rm_cart');
            cart = [];
            
            document.querySelector('main').innerHTML = `
                <div class="text-center py-32">
                    <div class="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h1 class="text-5xl font-black text-gray-900 mb-4">Pagamento Simulado!</h1>
                    <p class="text-xl text-gray-500 mb-8">No mundo real, o cliente receberia um e-mail agora.</p>
                    <a href="index.html" class="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition">Voltar ao Início</a>
                </div>
            `;
            updateCartCount();
        }, 2000);
    };

    return {
        init: () => {
            initCart();
            renderProducts(); 
            renderProductPage(); // Chama a nova lógica
            renderCart();     
            renderCheckoutSummary();
        }
    };
})();

document.addEventListener('DOMContentLoaded', DeckStoreApp.init);
