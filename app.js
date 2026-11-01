const DeckStoreApp = (() => {
    'use strict';

    const products = [
        { id: 'RM-EBK-01', name: 'E-book: Crônicas e Bastidores da MPB', description: 'Histórias leves, lore cultural e curiosidades exclusivas da era de ouro do rádio.', price: 47.90, image: 'https://via.placeholder.com/400x400.png?text=E-book+Cronicas' },
        { id: 'RM-TSH-02', name: 'Camiseta Minimalista: Bossa & Alma', description: 'Algodão premium 100%. Estampa sutil com referência aos clássicos dos festivais.', price: 89.90, image: 'https://via.placeholder.com/400x400.png?text=Camiseta+Bossa' },
        { id: 'RM-VNL-03', name: 'Vinil de Colecionador: Contar e Cantar', description: 'Curadoria especial em disco de 180g. Uma viagem sonora pela memória cultural.', price: 249.90, image: 'https://via.placeholder.com/400x400.png?text=Vinil+Colecionador' },
        { id: 'RM-BOX-04', name: 'Box Acervo: A História Completa', description: 'A experiência definitiva. Inclui livro físico de pesquisa, vinil e encarte fotográfico.', price: 349.90, image: 'https://via.placeholder.com/400x400.png?text=Box+Acervo' }
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
        toast.className = `${isError ? 'bg-red-600' : 'bg-brand'} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 opacity-0 translate-y-4`;
        toast.textContent = message;
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
        showToast(`"${product.name}" adicionado!`);
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

    const validateCPF = (cpf) => {
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

    const setupCheckoutListeners = () => {
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

            if (cart.length === 0) {
                showToast("Seu carrinho está vazio!", true);
                setTimeout(() => window.location.href = "index.html", 2000);
                return;
            }

            const customerData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                cpf: cpfVal.replace(/\D/g, ''),
                phone: document.getElementById('phone').value,
                address: `${document.getElementById('address').value}, Nº ${document.getElementById('number').value} - ${document.getElementById('complement').value}`
            };

            const orderPayload = {
                customer: customerData,
                items: cart.map(item => ({ id: item.id, qty: item.qty }))
            };

            processPayment(orderPayload);
        });
    };

    const processPayment = async (payload) => {
        const overlay = document.getElementById('loading-overlay');
        const btn = document.getElementById('btn-pay');
        
        btn.disabled = true;
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.init_point) {
                localStorage.removeItem('rm_cart');
                window.location.href = data.init_point;
            } else {
                throw new Error(data.error || "Erro desconhecido");
            }

        } catch (error) {
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            btn.disabled = false;
            showToast("Erro ao conectar com Mercado Pago. Tente novamente.", true);
            console.error(error);
        }
    };

    const renderProducts = () => {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        grid.innerHTML = ''; 
        const fragment = document.createDocumentFragment();
        products.forEach(product => {
            const article = document.createElement('article');
            article.className = "bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col";
            article.innerHTML = `
                <img src="${product.image}" alt="Imagem" loading="lazy" width="400" height="400" class="w-full h-48 object-cover">
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="text-lg font-semibold mb-2 text-gray-800"></h3>
                    <p class="text-sm text-gray-500 mb-4 flex-grow"></p>
                    <div class="flex justify-between items-center mt-auto">
                        <span class="text-xl font-bold text-accent">${formatPrice(product.price)}</span>
                        <button class="add-btn bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition focus:ring-2 focus:ring-brand outline-none">Comprar</button>
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

    const renderCart = () => { 
        const container = document.getElementById('cart-container');
        if (!container) return;
        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = `<div class="w-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"><p class="text-gray-500 text-lg mb-4">Seu carrinho está vazio.</p><a href="index.html" class="text-accent font-semibold hover:underline">&larr; Voltar à loja</a></div>`;
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
                <div class="flex items-center gap-4 w-full sm:w-auto"><img src="${item.image}" alt="" class="w-20 h-20 rounded-md object-cover">
                <div><h4 class="font-semibold text-gray-800"></h4><span class="text-sm text-gray-500">${formatPrice(item.price)} un.</span></div></div>
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div class="flex items-center border border-gray-300 rounded-lg"><button class="btn-minus px-3 py-1 hover:bg-gray-100 rounded-l-lg">-</button><span class="px-4 font-medium text-gray-700">${item.qty}</span><button class="btn-plus px-3 py-1 hover:bg-gray-100 rounded-r-lg">+</button></div>
                <div class="font-bold text-gray-900 min-w-[5rem] text-right">${formatPrice(itemTotal)}</div>
                <button class="btn-remove text-red-500 hover:text-red-700 p-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>
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
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                <h3 class="text-xl font-bold border-b pb-4 mb-4 text-gray-900">Resumo</h3>
                <div class="flex justify-between mb-4 text-lg"><span class="text-gray-600">Subtotal:</span><span class="font-bold text-gray-900">${formatPrice(subtotal)}</span></div>
                <a href="checkout.html" class="block w-full bg-green-600 text-white text-center px-4 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-sm mt-6">Continuar para Pagamento</a>
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
            row.innerHTML = `<span class="flex-grow"></span><span class="font-medium text-gray-800">${formatPrice(item.price * item.qty)}</span>`;
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
