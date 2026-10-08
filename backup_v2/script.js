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
    let filtrados = produtos.filter((produto) => {
        // Filtro por Categoria
        const catProduto = (produto.categoria || "").toLowerCase();
        let bateCategoria = true;

        if (activeCategory !== "Todos") {
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
    productsGrid.innerHTML = "";

    // Atualiza contagem de resultados
    if (resultsCountEl) {
        if (lista.length === 0) {
            resultsCountEl.textContent = "Nenhum produto encontrado";
        } else if (lista.length === 1) {
            resultsCountEl.textContent = "1 achado encontrado";
        } else {
            resultsCountEl.textContent = `${lista.length} achados encontrados`;
        }
    }

    // Exibe ou oculta estado vazio
    if (lista.length === 0) {
        if (emptyStateEl) emptyStateEl.style.display = "block";
        return;
    } else {
        if (emptyStateEl) emptyStateEl.style.display = "none";
    }

    lista.forEach((produto) => {
        const card = document.createElement("article");
        card.classList.add("product-card");

        const desconto = calcularDesconto(produto.precoAntigo, produto.preco);

        card.innerHTML = `
            <div class="product-image">
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
                            Produto Original
                        </span>
                    </div>
                </div>

                <div class="product-actions">
                    <a href="${perfume.link || '#'}" class="product-button">
                        <span>VER PRODUTO</span>
                    </a>
                </div>
            </div>
        `;

        perfumesGrid.appendChild(card);
    });
}

// EVENT LISTENERS

// Copiar link via delegação de evento
if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".copy-link-btn");
        if (btn) {
            e.preventDefault();
            const link = btn.getAttribute("data-link");
            if (link) {
                copiarParaAreaTransferencia(link);
            }
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
document.addEventListener("DOMContentLoaded", () => {
    renderizarProdutos();
    renderizarPerfumes();
});

// Executa também imediatamente caso o DOM já esteja pronto
if (document.readyState === "interactive" || document.readyState === "complete") {
    renderizarProdutos();
    renderizarPerfumes();
}