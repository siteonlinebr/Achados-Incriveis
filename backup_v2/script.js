const productsGrid = document.querySelector(".products-grid");
const perfumesGrid = document.querySelector(".perfumes-grid");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sortSelect = document.getElementById("sortSelect");
const categoriesContainer = document.getElementById("categoriesList");
const resultsCountEl = document.getElementById("resultsCount");
const emptyStateEl = document.getElementById("emptyState");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

let activeCategory = "Todos";
let searchQuery = "";
let currentSort = "padrao";

// GESTÃO DE FAVORITOS (LOCALSTORAGE)
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

function copiarParaAreaTransferencia(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast("Link copiado para a área de transferência!");
        }).catch(() => {
            fallbackCopiar(texto);
        });
    } else {
        fallbackCopiar(texto);
    }
}

function fallbackCopiar(texto) {
    const input = document.createElement("textarea");
    input.value = texto;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand("copy");
        mostrarToast("Link copiado!");
    } catch (e) {
        console.error("Não foi possível copiar:", e);
    }
    document.body.removeChild(input);
}

function filtrarEOrdenarProdutos() {
    const favs = obterFavoritos();

    let filtrados = produtos.filter((produto) => {
        // Filtro por Categoria
        const catProduto = (produto.categoria || "").toLowerCase();
        let bateCategoria = true;

        if (activeCategory === "Favoritos") {
            bateCategoria = favs.includes(produto.nome);
        } else if (activeCategory !== "Todos") {
            if (activeCategory === "Casa") {
                bateCategoria = catProduto.includes("casa");
            } else {
                bateCategoria = catProduto === activeCategory.toLowerCase();
            }
        }

        // Filtro por Busca
        let bateBusca = true;
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            const nome = (produto.nome || "").toLowerCase();
            const cat = catProduto;
            bateBusca = nome.includes(query) || cat.includes(query);
        }

        return bateCategoria && bateBusca;
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
                if (emptyDesc) emptyDesc.textContent = "Não encontramos nenhum produto com esse termo ou categoria.";
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
                    <span class="product-category">${produto.categoria}</span>
                    ${produto.cupom ? `<span class="coupon-pill">CUPOM</span>` : ""}
                </div>

                <h3 title="${produto.nome}">${produto.nome}</h3>

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
                        <a href="${produto.link}" target="_blank" rel="noopener noreferrer" class="product-button">
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
                    ` : ""}
                </div>

            </div>
        `;

        productsGrid.appendChild(card);
    });
}

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

// EVENT LISTENERS

// Copiar link e Favoritos via delegação de evento
if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
        // Favorito
        const favBtn = e.target.closest(".fav-btn");
        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            const nome = favBtn.getAttribute("data-nome");
            if (nome) {
                alternarFavorito(nome);
            }
            return;
        }

        // Copiar link
        const copyBtn = e.target.closest(".copy-link-btn");
        if (copyBtn) {
            e.preventDefault();
            const link = copyBtn.getAttribute("data-link");
            if (link) {
                copiarParaAreaTransferencia(link);
            }
            return;
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

// Busca por Texto
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
        if (categoriesContainer) {
            categoriesContainer.querySelectorAll(".category").forEach((b) => {
                b.classList.toggle("active", b.getAttribute("data-category") === "Todos");
            });
        }

        renderizarProdutos();
    });
}

// INICIALIZAÇÃO
function inicializarApp() {
    atualizarContadorFavoritos();

    // Ler parâmetros da URL para busca ou categoria direta
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const buscaParam = urlParams.get("busca");
        const catParam = urlParams.get("categoria");

        if (buscaParam) {
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
    } catch (e) {
        console.warn("Erro ao ler parâmetros da URL:", e);
    }

    renderizarProdutos();
    renderizarPerfumes();
}

document.addEventListener("DOMContentLoaded", inicializarApp);

if (document.readyState === "interactive" || document.readyState === "complete") {
    inicializarApp();
}