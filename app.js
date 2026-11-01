// ==========================================
// RM ContareCantar - Script Principal da Loja
// ==========================================

// Base de dados do acervo cultural (Discos, Livros e Edições Limitadas)
const products = [
    {
        id: "RM-001",
        name: "Livro: Crônicas e Bastidores",
        description: "Mergulhe nas histórias e lore cultural exclusivas da era de ouro da nossa música.",
        price: 149.90,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
        category: "Livros & Crônicas"
    },
    {
        id: "RM-002",
        name: "Vinil: Elis & Tom (Edição 180g)",
        description: "O encontro histórico remasterizado em alta fidelidade analógica. Peça de colecionador.",
        price: 199.90,
        image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=800",
        category: "Discos de Vinil"
    },
    {
        id: "RM-003",
        name: "Box Bossa Nova: Uma História",
        description: "Edição comemorativa limitada contendo livro de arte e livreto documental.",
        price: 348.90,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800",
        category: "Box de Colecionador"
    },
    {
        id: "RM-004",
        name: "Rádio Vintage AM/FM Retrô",
        description: "Design clássico inspirado nos anos 60 com tecnologia moderna de som e Bluetooth.",
        price: 288.90,
        image: "https://images.unsplash.com/photo-1526657782461-9fe13402a841?q=80&w=800",
        category: "Edições Limitadas"
    }
];

// Formata valores para o padrão Real Brasileiro (R$)
function formatPrice(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Renderiza a vitrine de produtos no index-master.html
function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach(product => {
        const article = document.createElement('article');
        // Garantindo classes limpas com fundo branco e visibilidade total do texto
        article.className = "group bg-surface rounded-2xl shadow-md overflow-hidden border border-ink/10 flex flex-col card-editorial";
        
        article.innerHTML = `
            <a href="product.html?id=${product.id}" class="block relative overflow-hidden aspect-[4/3] bg-canvas">
                <img src="${product.image}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            </a>
            <div class="p-6 flex flex-col flex-grow justify-between">
                <div>
                    <a href="product.html?id=${product.id}">
                        <!-- TÍTULO FORÇADO COM TEXT-INK (Carvão escuro) para visibilidade permanente -->
                        <h3 class="font-serif text-2xl mb-2 text-ink hover:text-gold transition-colors">${product.name}</h3>
                    </a>
                    <p class="text-muted text-xs mb-4 leading-relaxed line-clamp-2">${product.description}</p>
                </div>
                
                <div class="flex flex-col gap-3 pt-4 border-t border-ink/5 mt-auto">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] uppercase tracking-widest text-muted">Valor</span>
                        <span class="text-xl font-bold text-ink">${formatPrice(product.price)}</span>
                    </div>
                    <button onclick="addToCart('${product.id}')" class="w-full bg-gold text-white text-center py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-ink transition-colors block shadow-sm cursor-pointer">
                        Garantir o meu
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(article);
    });
}

// Função simulada de Adicionar ao Carrinho com Toast
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Recupera carrinho atual do localStorage ou cria array vazio
    let cart = JSON.parse(localStorage.getItem('rm_cart')) || [];
    cart.push(product);
    localStorage.setItem('rm_cart', JSON.stringify(cart));

    updateCartCount();
    showToast(`"${product.name}" foi adicionado ao carrinho!`);
}

// Atualiza o contador de itens no cabeçalho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('rm_cart')) || [];
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = cart.length;
    }
}

// Sistema de Alertas Toast Flutuantes
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = "bg-ink text-white text-xs px-5 py-3 rounded-xl shadow-2xl border border-gold/40 flex items-center gap-3 animate-fade-in pointer-events-auto";
    toast.innerHTML = `<span class="text-gold font-bold">✦</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// Inicializa as funções ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});
