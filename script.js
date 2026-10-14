const productsGrid = document.querySelector(".products-grid");
const perfumesGrid = document.querySelector(".perfumes-grid");
const cuponsGrid = document.getElementById("cuponsGrid");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sortSelect = document.getElementById("sortSelect");
const categoriesContainer = document.getElementById("categoriesList");
const priceChipsContainer = document.getElementById("priceChipsContainer");
const resultsCountEl = document.getElementById("resultsCount");
const emptyStateEl = document.getElementById("emptyState");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const productModal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const featuredSpotlight = document.getElementById("featuredSpotlight");

let activeCategory = "Todos";
let activePrice = "todos";
let searchQuery = "";
let currentSort = "padrao";

// ==========================================================================
// GESTÃO DE FAVORITOS (LOCALSTORAGE)
// ==========================================================================
const FAVORITOS_KEY = "achados_incriveis_favoritos";

function obterFavoritos() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITOS_KEY) || "[]");
    } catch {
        return [];
    }
}

function atualizarContadorFavoritos() {
    const favCountEl = document.getElementById("favCount");
    if (favCountEl) {
        const favs = obterFavoritos();
        favCountEl.textContent = favs.length;
    }
}

function alternarFavorito(nomeProduto) {
    let favs = obterFavoritos();
    const index = favs.indexOf(nomeProduto);
    if (index > -1) {
        favs.splice(index, 1);
        mostrarToast("Removido dos favoritos");
    } else {
        favs.push(nomeProduto);
        mostrarToast("Salvo nos favoritos! ❤️");
    }
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favs));
    atualizarContadorFavoritos();
    renderizarProdutos();
}

// ==========================================================================
// VISTOS RECENTEMENTE (LOCALSTORAGE)
// ==========================================================================
const RECENTES_KEY = "achados_incriveis_recentes";
const recentViewsSection = document.getElementById("recentViewsSection");
const recentViewsTrack = document.getElementById("recentViewsTrack");
const clearRecentBtn = document.getElementById("clearRecentBtn");

function obterRecentes() {
    try {
        return JSON.parse(localStorage.getItem(RECENTES_KEY) || "[]");
    } catch {
        return [];
    }
}

function salvarVistoRecentemente(produtoId) {
    const idNum = Number(produtoId);
    let recentes = obterRecentes().filter(id => id !== idNum);
    recentes.unshift(idNum);
    if (recentes.length > 8) recentes = recentes.slice(0, 8);
    localStorage.setItem(RECENTES_KEY, JSON.stringify(recentes));
    renderizarVistosRecentemente();
}

function renderizarVistosRecentemente() {
    if (!recentViewsSection || !recentViewsTrack || typeof produtos === "undefined") return;
    const recentes = obterRecentes();
    const produtosRecentes = recentes.map(id => produtos.find(p => p.id === id)).filter(Boolean);

    if (produtosRecentes.length === 0) {
        recentViewsSection.style.display = "none";
        return;
    }

    recentViewsSection.style.display = "block";
    recentViewsTrack.innerHTML = "";

    produtosRecentes.forEach(produto => {
        const item = document.createElement("div");
        item.className = "recent-card";
        item.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}" class="recent-card-img" loading="lazy">
            <h4 class="recent-card-title" title="${produto.nome}">${produto.nome}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 6px;">
                <span class="recent-card-price">${formatarPreco(produto.preco)}</span>
                <button type="button" class="card-review-btn" data-id="${produto.id}" style="font-size: 11px; padding: 3px 8px;">Ver</button>
            </div>
        `;
        recentViewsTrack.appendChild(item);
    });
}

if (clearRecentBtn) {
    clearRecentBtn.addEventListener("click", () => {
        localStorage.removeItem(RECENTES_KEY);
        renderizarVistosRecentemente();
        mostrarToast("Histórico limpo!");
    });
}

// ==========================================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO E TOAST
// ==========================================================================
function calcularDesconto(precoAntigo, preco) {
    if (!precoAntigo || precoAntigo <= preco) return 0;
    const desconto = ((precoAntigo - preco) / precoAntigo) * 100;
    return Math.round(desconto);
}

function formatarPreco(preco) {
    return preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarValor(preco) {
    return preco.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarToast(mensagem = "Link copiado com sucesso!") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function copiarParaAreaTransferencia(texto, mensagemSucesso = "Link copiado para a área de transferência!") {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast(mensagemSucesso);
        }).catch(() => {
            fallbackCopiar(texto, mensagemSucesso);
        });
    } else {
        fallbackCopiar(texto, mensagemSucesso);
    }
}

function fallbackCopiar(texto, mensagemSucesso = "Copiado com sucesso!") {
    const input = document.createElement("textarea");
    input.value = texto;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand("copy");
        mostrarToast(mensagemSucesso);
    } catch (e) {
        console.error("Não foi possível copiar:", e);
    }
    document.body.removeChild(input);
}

// ==========================================================================
// COMPARTILHAMENTO DE OFERTA NO WHATSAPP E TELEGRAM
// ==========================================================================
function gerarTextoCompartilhamento(produto) {
    const precoFormatado = formatarPreco(produto.preco);
    const precoAntigoFormatado = produto.precoAntigo ? ` (De ${formatarPreco(produto.precoAntigo)})` : '';
    return `🔥 *Achado Recomendado no Achados Incríveis!*\n\n📦 *${produto.nome}*\n💰 Por apenas *${precoFormatado}*${precoAntigoFormatado}\n\n🛒 Link direto com desconto: ${produto.link}\n\n✨ Veja mais ofertas e cupons em: https://siteonlinebr.github.io/Achados-Incriveis/`;
}

function gerarTextoTelegram(produto) {
    const precoFormatado = formatarPreco(produto.preco);
    const precoAntigo = produto.precoAntigo ? `~~De ${formatarPreco(produto.precoAntigo)}~~\n` : '';
    const desconto = calcularDesconto(produto.precoAntigo, produto.preco);
    const tagDesconto = desconto > 0 ? ` 🔥 *${desconto}% DE DESCONTO!*` : '';
    const pro = (produto.pros && produto.pros.length) ? `\n✅ *Destaque:* ${produto.pros[0]}` : '';

    return `🚨 *ACHADO IMPERDÍVEL NA SHOPEE!*${tagDesconto}

📦 *${produto.nome}*

⭐ Avaliação: *${produto.avaliacao || '4.8'}* (${produto.totalAvaliacoes || '1k+'} avaliações confirmadas)
${precoAntigo}💰 *Por apenas: ${precoFormatado}* ${produto.parcelamento ? `\n💳 Em até ${produto.parcelamento}` : ''}${pro}

🛒 *Compre com desconto pelo link oficial:*
👉 ${produto.link}

🏷️ *Dica:* Resgate seus cupons de frete grátis no app da Shopee antes de finalizar!
✨ Mais achados e cupons: https://siteonlinebr.github.io/Achados-Incriveis/`;
}

function compartilharNoWhatsApp(produto) {
    salvarVistoRecentemente(produto.id);
    const texto = gerarTextoCompartilhamento(produto);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

// ==========================================================================
// FILTROS E ORDENAÇÃO
// ==========================================================================
function filtrarEOrdenarProdutos() {
    const favs = obterFavoritos();

    let filtrados = produtos.filter((produto) => {
        // 1. Filtro por Categoria
        const catProduto = (produto.categoria || "").toLowerCase();
        let bateCategoria = true;

        if (activeCategory === "Favoritos") {
            bateCategoria = favs.includes(produto.nome);
        } else if (activeCategory !== "Todos") {
            if (activeCategory === "Casa") {
                bateCategoria = catProduto.includes("casa");
            } else if (activeCategory === "Beleza") {
                bateCategoria = catProduto.includes("beleza") || catProduto.includes("presente") || catProduto.includes("perfume");
            } else {
                bateCategoria = catProduto === activeCategory.toLowerCase();
            }
        }

        // 2. Filtro por Faixa de Preço
        let batePreco = true;
        if (activePrice === "30") {
            batePreco = produto.preco <= 30;
        } else if (activePrice === "50") {
            batePreco = produto.preco <= 50;
        } else if (activePrice === "100") {
            batePreco = produto.preco <= 100;
        } else if (activePrice === "100+") {
            batePreco = produto.preco > 100;
        }

        // 3. Filtro por Busca (suporta nome, categoria, código ex: #01, e id puro)
        let bateBusca = true;
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            const nome = (produto.nome || "").toLowerCase();
            const cat = catProduto;
            const cod = (produto.codigo || "").toLowerCase();
            const idStr = String(produto.id);

            // Permite buscar por #01, 01, 1, etc.
            const queryLimpa = query.replace("#", "").trim();

            bateBusca = nome.includes(query) ||
                        cat.includes(query) ||
                        cod.includes(query) ||
                        idStr === queryLimpa;
        }

        return bateCategoria && batePreco && bateBusca;
    });

    // Ordenação
    if (currentSort === "menor-preco") {
        filtrados.sort((a, b) => a.preco - b.preco);
    } else if (currentSort === "maior-preco") {
        filtrados.sort((a, b) => b.preco - a.preco);
    } else if (currentSort === "maior-desconto") {
        filtrados.sort((a, b) => {
            const descA = calcularDesconto(a.precoAntigo, a.preco);
            const descB = calcularDesconto(b.precoAntigo, b.preco);
            return descB - descA;
        });
    }

    return filtrados;
}

// ==========================================================================
// RENDERIZAÇÃO DOS PRODUTOS
// ==========================================================================
function renderizarProdutos() {
    if (!productsGrid) return;

    const lista = filtrarEOrdenarProdutos();
    const favs = obterFavoritos();
    productsGrid.innerHTML = "";

    // Atualiza contagem de resultados
    if (resultsCountEl) {
        if (activeCategory === "Favoritos") {
            resultsCountEl.textContent = `${lista.length} ${lista.length === 1 ? 'produto favoritado' : 'produtos favoritados'}`;
        } else if (lista.length === 0) {
            resultsCountEl.textContent = "Nenhum produto encontrado";
        } else if (lista.length === 1) {
            resultsCountEl.textContent = "1 achado encontrado";
        } else {
            resultsCountEl.textContent = `${lista.length} achados encontrados`;
        }
    }

    // Exibe ou oculta estado vazio
    if (lista.length === 0) {
        if (emptyStateEl) {
            emptyStateEl.style.display = "block";
            const emptyTitle = emptyStateEl.querySelector("h3");
            const emptyDesc = emptyStateEl.querySelector("p");

            if (activeCategory === "Favoritos") {
                if (emptyTitle) emptyTitle.textContent = "Nenhum favorito salvo ainda";
                if (emptyDesc) emptyDesc.textContent = "Clique no coraçãozinho ❤️ de qualquer produto para salvar aqui e ver mais tarde.";
            } else {
                if (emptyTitle) emptyTitle.textContent = "Nenhum achado encontrado";
                if (emptyDesc) emptyDesc.textContent = "Tente alterar os termos de busca, o filtro de preço ou a categoria.";
            }
        }
        return;
    } else {
        if (emptyStateEl) emptyStateEl.style.display = "none";
    }

    lista.forEach((produto) => {
        const card = document.createElement("article");
        card.classList.add("product-card");

        const desconto = calcularDesconto(produto.precoAntigo, produto.preco);
        const isFavorito = favs.includes(produto.nome);

        card.innerHTML = `
            <div class="product-image">
                <button type="button" class="fav-btn ${isFavorito ? 'active' : ''}" data-nome="${produto.nome}" title="${isFavorito ? 'Remover dos favoritos' : 'Favoritar produto'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="${isFavorito ? '#e11d48' : 'none'}" stroke="${isFavorito ? '#e11d48' : 'currentColor'}" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
                ${desconto > 0 ? `<span class="image-discount-badge">-${desconto}%</span>` : ""}
            </div>

            <div class="product-info">

                <div class="product-meta">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${produto.codigo ? `<span class="product-code-tag">${produto.codigo}</span>` : ""}
                        <span class="product-category">${produto.categoria}</span>
                    </div>
                    ${produto.cupom ? `<span class="coupon-pill">CUPOM</span>` : ""}
                </div>

                <h3 title="${produto.nome}">${produto.nome}</h3>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span class="product-rating-pill">⭐ ${produto.avaliacao || '4.8'} (${produto.totalAvaliacoes || '1k+'})</span>
                    <button type="button" class="card-review-btn" data-id="${produto.id}">
                        Ver análise ➔
                    </button>
                </div>

                <div class="price-box">
                    <div class="price-top-row">
                        ${produto.precoAntigo ? `
                            <span class="old-price">De ${formatarPreco(produto.precoAntigo)}</span>
                            <span class="discount-tag">${desconto}% OFF</span>
                        ` : (produto.precoNormal ? `
                            <span class="normal-price-tag">Outros: ${formatarPreco(produto.precoNormal)}</span>
                        ` : `
                            <span class="cash-deal-tag">Melhor Preço</span>
                        `)}
                    </div>

                    <div class="price-main-row">
                        <span class="price-currency">R$</span>
                        <span class="price-value">${formatarValor(produto.preco)}</span>
                    </div>

                    <div class="price-bottom-row">
                        ${produto.parcelamento ? `
                            <span class="installment">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                                ${produto.parcelamento}
                            </span>
                        ` : `
                            <span class="payment-hint">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                À vista / PIX
                            </span>
                        `}
                    </div>

                    ${produto.cupom ? `
                        <div class="coupon-box" title="Possui cupom de desconto">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="6" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                                <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                                <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                            </svg>
                            <span>CUPOM: <strong>${produto.cupom}</strong></span>
                        </div>
                    ` : ""}
                </div>

                <div class="product-actions">
                    ${produto.link ? `
                        <a href="${produto.link}" target="_blank" rel="noopener noreferrer" class="product-button product-buy-link" data-id="${produto.id}">
                            <span>VER OFERTA</span>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                        <button type="button" class="copy-link-btn" data-link="${produto.link}" title="Copiar link para enviar">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button type="button" class="share-whats-card-btn" data-id="${produto.id}" title="Mandar para o WhatsApp da família ou amigos">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.86-.38-4.11-1.09l-.29-.17-3.12.82.83-3.04-.19-.31a8.196 8.196 0 0 1-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                            </svg>
                        </button>
                    ` : ""}
                </div>

            </div>
        `;

        productsGrid.appendChild(card);
    });
}

// ==========================================================================
// CENTRAL DE CUPONS
// ==========================================================================
function renderizarCupons() {
    if (!cuponsGrid || typeof cuponsShopee === "undefined") return;

    cuponsGrid.innerHTML = "";

    cuponsShopee.forEach((cupom) => {
        const card = document.createElement("div");
        card.classList.add("cupom-card");

        card.innerHTML = `
            <div>
                <span class="cupom-badge">${cupom.badge}</span>
                <p class="cupom-discount">${cupom.desconto}</p>
                <h3 class="cupom-title">${cupom.titulo}</h3>
                <p class="cupom-desc">${cupom.descricao}</p>
            </div>
            <div class="cupom-actions">
                <div class="cupom-code-box" data-codigo="${cupom.codigo}" title="Clique para copiar o código">
                    ${cupom.codigo} 📋
                </div>
                <a href="${cupom.link}" target="_blank" rel="noopener noreferrer" class="cupom-go-btn" title="Ir para a Shopee">
                    Ativar
                </a>
            </div>
        `;

        cuponsGrid.appendChild(card);
    });
}

// ==========================================================================
// SEÇÃO DE PERFUMARIA
// ==========================================================================
function renderizarPerfumes() {
    if (!perfumesGrid || typeof perfumes === "undefined") return;

    perfumesGrid.innerHTML = "";

    perfumes.forEach((perfume) => {
        const card = document.createElement("article");
        card.classList.add("product-card");

        card.innerHTML = `
            <div class="product-image">
                <img src="${perfume.imagem}" alt="${perfume.nome}" loading="lazy">
            </div>

            <div class="product-info">
                <div class="product-meta">
                    <span class="product-category">${perfume.tipo}</span>
                </div>

                <h3 title="${perfume.nome}">${perfume.nome}</h3>

                <div class="price-box">
                    <div class="price-top-row">
                        <span class="normal-price-tag">Volume: ${perfume.quantidade}</span>
                    </div>

                    <div class="price-main-row">
                        <span class="price-currency">R$</span>
                        <span class="price-value">${formatarValor(perfume.preco)}</span>
                    </div>

                    <div class="price-bottom-row">
                        <span class="payment-hint">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Produto 100% Original
                        </span>
                    </div>
                </div>

                <div class="product-actions">
                    <a href="${perfume.link || 'https://wa.link/vvlu12'}" target="_blank" rel="noopener noreferrer" class="whatsapp-product-btn">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.86-.38-4.11-1.09l-.29-.17-3.12.82.83-3.04-.19-.31a8.196 8.196 0 0 1-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                        </svg>
                        <span>PEDIR NO WHATSAPP</span>
                    </a>
                </div>
            </div>
        `;

        perfumesGrid.appendChild(card);
    });
}

// ==========================================================================
// MODAL DE DETALHES
// ==========================================================================
function abrirModalProduto(id) {
    if (!productModal || !modalBody) return;

    const produto = produtos.find((p) => p.id === Number(id));
    if (!produto) return;

    salvarVistoRecentemente(produto.id);

    const desconto = calcularDesconto(produto.precoAntigo, produto.preco);

    // Texto de compartilhamento no WhatsApp
    const msgWhats = encodeURIComponent(gerarTextoCompartilhamento(produto));
    const whatsShareLink = `https://api.whatsapp.com/send?text=${msgWhats}`;

    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-img-wrapper">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>

            <div class="modal-details">
                <div class="modal-meta-top">
                    ${produto.codigo ? `<span class="product-code-tag">${produto.codigo}</span>` : ""}
                    <span class="product-category">${produto.categoria}</span>
                </div>

                <h2 id="modalTitle">${produto.nome}</h2>

                <div class="modal-rating-row">
                    <span>⭐ ${produto.avaliacao || '4.8'}</span>
                    <span style="color: #94a3b8; font-weight: 400;">(${produto.totalAvaliacoes || '1k+'} avaliações confirmadas)</span>
                </div>

                <div class="modal-price-box">
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="font-size: 26px; font-weight: 800; color: #38bdf8;">${formatarPreco(produto.preco)}</span>
                        ${desconto > 0 ? `<span class="discount-tag">${desconto}% OFF</span>` : ""}
                    </div>
                    ${produto.parcelamento ? `<p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">💳 Parcelamento: ${produto.parcelamento}</p>` : ""}
                    ${produto.cupom ? `<p style="font-size: 12px; color: #facc15; margin-top: 4px;">🏷️ Cupom disponível: ${produto.cupom}</p>` : ""}
                </div>

                <div class="modal-summary-box">
                    <p>${produto.resumo || 'Produto selecionado com excelente custo-benefício e ótimas avaliações na Shopee.'}</p>
                </div>

                ${produto.pros && produto.pros.length ? `
                    <div class="modal-verdict-title">Pontos Positivos:</div>
                    <ul class="modal-pros-list">
                        ${produto.pros.map((pro) => `<li><span>✓</span> <span>${pro}</span></li>`).join('')}
                    </ul>
                ` : ""}

                ${produto.contra ? `
                    <div class="modal-contra-box">
                        <span>ℹ️</span> <span><strong>Atenção:</strong> ${produto.contra}</span>
                    </div>
                ` : ""}

                <div class="modal-actions">
                    <a href="${produto.link}" target="_blank" rel="noopener noreferrer" class="modal-buy-btn">
                        <span>IR PARA A SHOPEE</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                    <a href="${whatsShareLink}" target="_blank" rel="noopener noreferrer" class="modal-share-btn" title="Compartilhar pelo WhatsApp">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.86-.38-4.11-1.09l-.29-.17-3.12.82.83-3.04-.19-.31a8.196 8.196 0 0 1-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                        </svg>
                        <span>WhatsApp</span>
                    </a>
                    <button type="button" class="modal-telegram-btn" data-id="${produto.id}" title="Copiar Post pronto para o Telegram com gatilhos e formatação">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z"/>
                        </svg>
                        <span>Post Telegram</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    productModal.style.display = "flex";
    productModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    if (!productModal) return;
    productModal.style.display = "none";
    productModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ==========================================================================
// CALCULADORA / SIMULADOR SHOPEE
// ==========================================================================
const calcCartValue = document.getElementById("calcCartValue");
const calcCouponSelect = document.getElementById("calcCouponSelect");
const calcShippingToggle = document.getElementById("calcShippingToggle");
const calcCoinsRange = document.getElementById("calcCoinsRange");
const calcCoinsValBadge = document.getElementById("calcCoinsValBadge");
const resSavingsAmount = document.getElementById("resSavingsAmount");
const resSavingsPercent = document.getElementById("resSavingsPercent");
const resOriginalVal = document.getElementById("resOriginalVal");
const resShippingDiscount = document.getElementById("resShippingDiscount");
const resCouponDiscount = document.getElementById("resCouponDiscount");
const resCoinsDiscount = document.getElementById("resCoinsDiscount");
const resFinalPrice = document.getElementById("resFinalPrice");
const calcShareWhatsBtn = document.getElementById("calcShareWhatsBtn");

function atualizarSimulador() {
    if (!calcCartValue) return;

    const cartVal = Math.max(0, parseFloat(calcCartValue.value) || 0);
    const shippingNominal = 20.00;
    const shippingDiscount = calcShippingToggle && calcShippingToggle.checked ? shippingNominal : 0;

    // Cupom
    const couponVal = calcCouponSelect ? calcCouponSelect.value : "10";
    let couponDiscount = 0;
    if (couponVal === "5") {
        couponDiscount = Math.min(10.00, cartVal * 0.05);
    } else if (couponVal === "10") {
        couponDiscount = Math.min(20.00, cartVal * 0.10);
    } else if (couponVal === "15") {
        couponDiscount = Math.min(30.00, cartVal * 0.15);
    } else if (couponVal === "fixo-10") {
        couponDiscount = Math.min(cartVal, 10.00);
    } else if (couponVal === "fixo-20") {
        couponDiscount = Math.min(cartVal, 20.00);
    }

    // Moedas
    const coinsCount = calcCoinsRange ? parseInt(calcCoinsRange.value, 10) || 0 : 0;
    const coinsNominal = coinsCount * 0.01;
    const maxCoinsDiscount = cartVal * 0.25;
    const coinsDiscount = Math.min(coinsNominal, maxCoinsDiscount);

    if (calcCoinsValBadge) {
        calcCoinsValBadge.textContent = `${coinsCount} moedas (= ${formatarPreco(coinsNominal)})`;
    }

    const totalOriginal = cartVal + shippingNominal;
    const totalSavings = shippingDiscount + couponDiscount + coinsDiscount;
    const finalVal = Math.max(0, totalOriginal - totalSavings);
    const savingsPercent = totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0;

    if (resOriginalVal) resOriginalVal.textContent = formatarPreco(totalOriginal);
    if (resShippingDiscount) resShippingDiscount.textContent = `- ${formatarPreco(shippingDiscount)}`;
    if (resCouponDiscount) resCouponDiscount.textContent = `- ${formatarPreco(couponDiscount)}`;
    if (resCoinsDiscount) resCoinsDiscount.textContent = `- ${formatarPreco(coinsDiscount)}`;
    if (resFinalPrice) resFinalPrice.textContent = formatarPreco(finalVal);
    if (resSavingsAmount) resSavingsAmount.textContent = formatarPreco(totalSavings);
    if (resSavingsPercent) resSavingsPercent.textContent = `(${savingsPercent}% de economia)`;
}

// Botões rápidos de valor da calculadora
document.querySelectorAll(".quick-val-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".quick-val-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (calcCartValue) {
            calcCartValue.value = parseFloat(btn.getAttribute("data-val")).toFixed(2);
            atualizarSimulador();
        }
    });
});

if (calcCartValue) calcCartValue.addEventListener("input", atualizarSimulador);
if (calcCouponSelect) calcCouponSelect.addEventListener("change", atualizarSimulador);
if (calcShippingToggle) calcShippingToggle.addEventListener("change", atualizarSimulador);
if (calcCoinsRange) calcCoinsRange.addEventListener("input", atualizarSimulador);

if (calcShareWhatsBtn) {
    calcShareWhatsBtn.addEventListener("click", () => {
        const cartVal = parseFloat(calcCartValue.value) || 0;
        const savings = resSavingsAmount ? resSavingsAmount.textContent : "R$ 30,00";
        const finalPrice = resFinalPrice ? resFinalPrice.textContent : "R$ 90,00";

        const msg = `⚡ *Simulação de Economia Shopee no Achados Incríveis!*\n\n🛒 Valor do pedido: ${formatarPreco(cartVal)}\n💰 Você economiza: *${savings}* com cupom e frete grátis\n🏷️ Total final estimado: *${finalPrice}*\n\nResgate seus cupons aqui: https://siteonlinebr.github.io/Achados-Incriveis/#calculadora`;

        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    });
}

// ==========================================================================
// SUGESTÕES RÁPIDAS (IDEIAS DIRETAS)
// ==========================================================================
const quickSuggestions = document.getElementById("quickSuggestions");
if (quickSuggestions) {
    quickSuggestions.addEventListener("click", (e) => {
        const chip = e.target.closest(".suggestion-chip");
        if (!chip) return;

        quickSuggestions.querySelectorAll(".suggestion-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        const preset = chip.getAttribute("data-preset");
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        if (clearSearchBtn) clearSearchBtn.style.display = "none";

        if (preset === "baratinhos") {
            activePrice = "30";
            activeCategory = "Todos";
            currentSort = "padrao";
        } else if (preset === "descontos") {
            activePrice = "todos";
            activeCategory = "Todos";
            currentSort = "maior-desconto";
            if (sortSelect) sortSelect.value = "maior-desconto";
        } else if (preset === "natal") {
            activePrice = "todos";
            activeCategory = "Todos";
            searchQuery = "natal";
            if (searchInput) searchInput.value = "natal";
            if (clearSearchBtn) clearSearchBtn.style.display = "block";
            currentSort = "padrao";
        } else if (preset === "pets") {
            activePrice = "todos";
            activeCategory = "Pets";
            currentSort = "padrao";
        } else if (preset === "casa") {
            activePrice = "todos";
            activeCategory = "Casa";
            currentSort = "padrao";
        } else if (preset === "presentes") {
            activePrice = "todos";
            activeCategory = "Beleza";
            currentSort = "padrao";
        } else if (preset === "oficina") {
            activePrice = "todos";
            activeCategory = "Ferramentas";
            currentSort = "padrao";
        }

        // Sincroniza classes ativas
        if (categoriesContainer) {
            categoriesContainer.querySelectorAll(".category").forEach(b => {
                b.classList.toggle("active", b.getAttribute("data-category") === activeCategory);
            });
        }
        if (priceChipsContainer) {
            priceChipsContainer.querySelectorAll(".price-chip").forEach(c => {
                c.classList.toggle("active", c.getAttribute("data-price") === activePrice);
            });
        }

        renderizarProdutos();
        const prods = document.querySelector(".products");
        if (prods) prods.scrollIntoView({ behavior: "smooth" });
    });
}

// ==========================================================================
// FAQ ACCORDION
// ==========================================================================
const faqAccordion = document.querySelector(".faq-accordion");
if (faqAccordion) {
    faqAccordion.addEventListener("click", (e) => {
        const questionBtn = e.target.closest(".faq-question");
        if (!questionBtn) return;
        const item = questionBtn.closest(".faq-item");
        if (!item) return;

        const wasActive = item.classList.contains("active");
        faqAccordion.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
        if (!wasActive) {
            item.classList.add("active");
        }
    });
}

// ==========================================================================
// VOLTAR AO TOPO
// ==========================================================================
const backToTopBtn = document.getElementById("backToTopBtn");
window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 350) {
        backToTopBtn.style.display = "flex";
    } else {
        backToTopBtn.style.display = "none";
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ==========================================================================
// PWA (PROGRESSIVE WEB APP)
// ==========================================================================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((err) => {
            console.log("ServiceWorker registration skipped:", err);
        });
    });
}

let deferredPwaPrompt = null;
const pwaBanner = document.getElementById("pwaBanner");
const pwaInstallHeaderBtn = document.getElementById("pwaInstallHeaderBtn");
const pwaInstallActionBtn = document.getElementById("pwaInstallActionBtn");
const pwaCloseBannerBtn = document.getElementById("pwaCloseBannerBtn");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    if (pwaInstallHeaderBtn) pwaInstallHeaderBtn.style.display = "inline-flex";
    const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
    if (pwaBanner && !dismissed) {
        pwaBanner.style.display = "flex";
    }
});

function dispararInstalacaoPwa() {
    if (!deferredPwaPrompt) {
        mostrarToast("Para salvar o atalho, use 'Adicionar à tela inicial' no menu do seu navegador! 📲");
        return;
    }
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
            mostrarToast("Aplicativo instalado com sucesso! 🎉");
        }
        deferredPwaPrompt = null;
        if (pwaBanner) pwaBanner.style.display = "none";
        if (pwaInstallHeaderBtn) pwaInstallHeaderBtn.style.display = "none";
    });
}

if (pwaInstallActionBtn) pwaInstallActionBtn.addEventListener("click", dispararInstalacaoPwa);
if (pwaInstallHeaderBtn) pwaInstallHeaderBtn.addEventListener("click", dispararInstalacaoPwa);
if (pwaCloseBannerBtn) {
    pwaCloseBannerBtn.addEventListener("click", () => {
        if (pwaBanner) pwaBanner.style.display = "none";
        sessionStorage.setItem("pwa_banner_dismissed", "true");
    });
}

// ==========================================================================
// CLIQUES NOS CARDS DE PRODUTOS
// ==========================================================================
if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
        // Favorito
        const favBtn = e.target.closest(".fav-btn");
        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            const nome = favBtn.getAttribute("data-nome");
            if (nome) alternarFavorito(nome);
            return;
        }

        // Copiar link
        const copyBtn = e.target.closest(".copy-link-btn");
        if (copyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const link = copyBtn.getAttribute("data-link");
            if (link) copiarParaAreaTransferencia(link);
            return;
        }

        // WhatsApp direto
        const whatsBtn = e.target.closest(".share-whats-card-btn");
        if (whatsBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = whatsBtn.getAttribute("data-id");
            const prod = produtos.find(p => p.id === Number(id));
            if (prod) compartilharNoWhatsApp(prod);
            return;
        }

        // Ver análise (Modal)
        const reviewBtn = e.target.closest(".card-review-btn");
        if (reviewBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = reviewBtn.getAttribute("data-id");
            if (id) abrirModalProduto(id);
            return;
        }

        // Clique no botão "Ver Oferta" salva no recente
        const buyLink = e.target.closest(".product-buy-link");
        if (buyLink) {
            const id = buyLink.getAttribute("data-id");
            if (id) salvarVistoRecentemente(id);
        }
    });
}

// Copiar código do cupom na Central de Cupons
if (cuponsGrid) {
    cuponsGrid.addEventListener("click", (e) => {
        const codeBox = e.target.closest(".cupom-code-box");
        if (codeBox) {
            const codigo = codeBox.getAttribute("data-codigo");
            if (codigo) {
                copiarParaAreaTransferencia(codigo, `Cupom "${codigo}" copiado com sucesso! 🏷️`);
            }
        }
    });
}

// Botão de análise no card de Destaque da Semana
if (featuredSpotlight) {
    featuredSpotlight.addEventListener("click", (e) => {
        const reviewBtn = e.target.closest(".spotlight-btn-review");
        if (reviewBtn) {
            const id = reviewBtn.getAttribute("data-id");
            if (id) abrirModalProduto(id);
        }
    });
}

// Filtro de Categorias
if (categoriesContainer) {
    categoriesContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".category");
        if (!btn) return;

        categoriesContainer.querySelectorAll(".category").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        activeCategory = btn.getAttribute("data-category") || "Todos";
        renderizarProdutos();
    });
}

// Filtro de Faixa de Preço
if (priceChipsContainer) {
    priceChipsContainer.addEventListener("click", (e) => {
        const chip = e.target.closest(".price-chip");
        if (!chip) return;

        priceChipsContainer.querySelectorAll(".price-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");

        activePrice = chip.getAttribute("data-price") || "todos";
        renderizarProdutos();
    });
}

// Busca por Texto ou Código
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;

        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery ? "block" : "none";
        }

        renderizarProdutos();
    });
}

// Botão de Limpar Busca
if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderizarProdutos();
    });
}

// Ordenação
if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderizarProdutos();
    });
}

// Reset do Estado Vazio
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        searchQuery = "";
        if (clearSearchBtn) clearSearchBtn.style.display = "none";

        activeCategory = "Todos";
        activePrice = "todos";

        if (categoriesContainer) {
            categoriesContainer.querySelectorAll(".category").forEach((b) => {
                b.classList.toggle("active", b.getAttribute("data-category") === "Todos");
            });
        }

        if (priceChipsContainer) {
            priceChipsContainer.querySelectorAll(".price-chip").forEach((c) => {
                c.classList.toggle("active", c.getAttribute("data-price") === "todos");
            });
        }

        renderizarProdutos();
    });
}

// Fechamento do Modal
if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", fecharModal);
}

if (productModal) {
    productModal.addEventListener("click", (e) => {
        if (e.target === productModal) {
            fecharModal();
            return;
        }

        const teleBtn = e.target.closest(".modal-telegram-btn");
        if (teleBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = teleBtn.getAttribute("data-id");
            const prod = produtos.find(p => p.id === Number(id));
            if (prod) {
                const texto = gerarTextoTelegram(prod);
                copiarParaAreaTransferencia(texto, "Post para o Telegram copiado com sucesso! ✈️");
            }
            return;
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && productModal && productModal.style.display === "flex") {
        fecharModal();
    }
});

// ==========================================================================
// INICIALIZAÇÃO DO APP
// ==========================================================================
function inicializarApp() {
    atualizarContadorFavoritos();

    // Ler parâmetros da URL para busca direta, código ou categoria
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const buscaParam = urlParams.get("busca");
        const catParam = urlParams.get("categoria");
        const codigoParam = urlParams.get("codigo") || urlParams.get("id");
        const precoParam = urlParams.get("preco");

        if (codigoParam) {
            searchQuery = codigoParam.startsWith("#") ? codigoParam : `#${codigoParam.padStart(2, "0")}`;
            if (searchInput) searchInput.value = searchQuery;
            if (clearSearchBtn) clearSearchBtn.style.display = "block";
        } else if (buscaParam) {
            searchQuery = buscaParam;
            if (searchInput) searchInput.value = buscaParam;
            if (clearSearchBtn) clearSearchBtn.style.display = "block";
        }

        if (catParam && categoriesContainer) {
            const btnCat = categoriesContainer.querySelector(`[data-category="${catParam}"]`);
            if (btnCat) {
                categoriesContainer.querySelectorAll(".category").forEach((b) => b.classList.remove("active"));
                btnCat.classList.add("active");
                activeCategory = catParam;
            }
        }

        if (precoParam && priceChipsContainer) {
            const chipPreco = priceChipsContainer.querySelector(`[data-price="${precoParam}"]`);
            if (chipPreco) {
                priceChipsContainer.querySelectorAll(".price-chip").forEach((c) => c.classList.remove("active"));
                chipPreco.classList.add("active");
                activePrice = precoParam;
            }
        }
    } catch (e) {
        console.warn("Erro ao ler parâmetros da URL:", e);
    }

    renderizarProdutos();
    renderizarCupons();
    renderizarPerfumes();
    renderizarVistosRecentemente();
    atualizarSimulador();
}

document.addEventListener("DOMContentLoaded", inicializarApp);

if (document.readyState === "interactive" || document.readyState === "complete") {
    inicializarApp();
}