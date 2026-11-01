const DeckStoreApp = (() => {
    'use strict';

    // Imagens realistas inseridas para demonstrar o visual final
    const products = [
        { id: 'RM-EBK-01', name: 'Livro: Crônicas e Bastidores', description: 'Histórias e lore cultural exclusivas da era de ouro do rádio.', price: 47.90, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400' },
        { id: 'RM-TSH-02', name: 'Camiseta: Bossa & Alma', description: 'Algodão premium 100%. Estampa sutil dos clássicos dos festivais.', price: 89.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400' },
        { id: 'RM-VNL-03', name: 'Vinil: Contar e Cantar', description: 'Curadoria em disco de 180g. Uma viagem sonora pela memória.', price: 249.90, image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=400' },
        { id: 'RM-BOX-04', name: 'Box: A História Completa', description: 'A experiência definitiva. Livro físico, vinil e encarte fotográfico.', price: 349.90, image: 'https://images.unsplash.com/photo-1611004944410-6819ce2f8319?q=80&w=400' }
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

    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) existingItem.qty += 1;
        else cart.push({ ...product, qty: 1 });
        saveCart();
        showToast(`"${product.name}" foi para o carrinho!`);
    };

    const changeQuantity = (productId, delta) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
            saveCart();
            renderCart();
        }
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    };

    const validateCPF = (cpf) => { /* Mantido íntegro do QA */
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const setupCheckoutListeners = () => { /* Mantido íntegro */
        const cepInput = document.getElementById('cep');
        const cpfInput = document.getElementById('cpf');
        const form = document.getElementById('checkout-form');
        if (!form) return;

        cepInput.addEventListener('blur', async (e) => {
            let cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                document.getElementById('cep-loading').classList.remove('hidden');
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        document.getElementById('address').value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                        document.getElementById('number').focus();
                    }
                } catch (error) {
                    showToast("Erro ao buscar CEP", true);
                } finally {
                    document.getElementById('cep-loading').classList.add('hidden');
                }
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cpfVal = cpfInput.value;
            if (!validateCPF(cpfVal)) {
                document.getElementById('cpf-error').classList.remove('hidden');
                cpfInput.classList.add('border-red-500');
                showToast("Por favor, corrija o CPF.", true);
                return;
            }
            document.getElementById('cpf-error').classList.add('hidden');
            cpfInput.classList.remove('border-red-500');

            if (cart.length === 0) return;

            const orderPayload = {
                customer: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    cpf: cpfVal.replace(/\D/g, ''),
                    phone: document.getElementById('phone').value,
                    address: `${document.getElementById('address').value}, Nº ${document.getElementById('number').value}`
                },
                items: cart.map(item => ({ id: item.id, qty: item.qty }))
            };
            processPayment(orderPayload);
        });
    };

    const processPayment = async (payload) => { /* Mantido íntegro */
        const overlay = document.getElementById('loading-overlay');
        const btn = document.getElementById('btn-pay');
        btn.disabled = true;
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);

        try {
            const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (data.init_point) {
                localStorage.removeItem('rm_cart');
                window.location.href = data.init_point;
            } else throw new Error(data.error);
        } catch (error) {
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            btn.disabled = false;
            showToast("Erro ao conectar com Mercado Pago.", true);
        }
    };

    const renderProducts = () => {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        grid.innerHTML = ''; 
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            const article = document.createElement('article');
            // Design premium aplicado no container do card
            article.className = "group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2 relative";
            
            article.innerHTML = `
                <div class="relative overflow-hidden aspect-[4/3]">
                    <img src="${product.image}" alt="Imagem" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors duration-300"></div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold mb-2 text-gray-900 leading-tight"></h3>
                    <p class="text-sm text-gray-500 mb-6 flex-grow leading-relaxed"></p>
                    <div class="flex flex-col mt-auto gap-4">
                        <span class="text-2xl font-black text-brand">${formatPrice(product.price)}</span>
                        <!-- Botão com destaque visual -->
                        <button class="add-btn w-full bg-accent text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all focus:ring-4 focus:ring-blue-100 outline-none flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Adicionar
                        </button>
                    </div>
                </div>
            `;
            article.querySelector('h3').textContent = product.name;
            article.querySelector('p').textContent = product.description;
            article.querySelector('.add-btn').addEventListener('click', () => addToCart(product.id));
            fragment.appendChild(article);
        });
        grid.appendChild(fragment);
    };

    const renderCart = () => { /* Mantido íntegro do QA */
        const container = document.getElementById('cart-container');
        if (!container) return;
        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = `<div class="w-full text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"><p class="text-gray-500 text-lg mb-6">Seu carrinho está vazio.</p><a href="index.html" class="bg-accent text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition">&larr; Voltar à loja</a></div>`;
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
                <div class="flex items-center gap-4 w-full sm:w-auto"><img src="${item.image}" alt="" class="w-20 h-20 rounded-lg object-cover shadow-sm">
                <div><h4 class="font-bold text-gray-900"></h4><span class="text-sm text-gray-500">${formatPrice(item.price)} un.</span></div></div>
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div class="flex items-center bg-gray-50 border border-gray-200 rounded-lg"><button class="btn-minus px-4 py-2 hover:bg-gray-200 rounded-l-lg transition font-bold text-gray-600">-</button><span class="px-4 font-bold text-gray-800">${item.qty}</span><button class="btn-plus px-4 py-2 hover:bg-gray-200 rounded-r-lg transition font-bold text-gray-600">+</button></div>
                <div class="font-black text-gray-900 min-w-[6rem] text-right text-lg">${formatPrice(itemTotal)}</div>
                <button class="btn-remove text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>
            `;
            itemCard.querySelector('h4').textContent = item.name;
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

    const renderCheckoutSummary = () => { /* Mantido íntegro do QA */
        const itemsContainer = document.getElementById('checkout-items');
        const totalContainer = document.getElementById('checkout-total');
        if (!itemsContainer || !totalContainer) return;

        if (cart.length === 0) {
            window.location.href = "index.html";
            return;
        }
        let subtotal = 0;
        itemsContainer.innerHTML = '';
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const row = document.createElement('div');
            row.className = "flex justify-between";
            row.innerHTML = `<span class="flex-grow text-gray-500 font-medium"></span><span class="font-bold text-gray-900">${formatPrice(item.price * item.qty)}</span>`;
            row.querySelector('span').textContent = `${item.qty}x ${item.name}`;
            itemsContainer.appendChild(row);
        });
        totalContainer.textContent = formatPrice(subtotal);
        setupCheckoutListeners(); 
    };

    return {
        init: () => {
            initCart();
            renderProducts(); 
            renderCart();     
            renderCheckoutSummary();
        }
    };
})();

document.addEventListener('DOMContentLoaded', DeckStoreApp.init);
