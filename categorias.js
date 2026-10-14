// ==========================================================================
// DEPARTAMENTOS E CATEGORIAS OFICIAIS SHOPEE (LINKS DE AFILIADO)
// ==========================================================================
const categoriasShopee = [
    {
        id: "gaming",
        nome: "Games & Consoles",
        nomeOriginal: "Gaming & Consoles",
        icone: "🎮",
        descricao: "Consoles, controles, headsets, cadeiras e setup gamer",
        link: "https://s.shopee.com.br/4LK9EZoR2K",
        comissao: "3%",
        badge: "Mais Vendidos"
    },
    {
        id: "celulares",
        nome: "Celulares & Gadgets",
        nomeOriginal: "Mobile & Gadgets",
        icone: "📱",
        descricao: "Smartphones, capas, carregadores turbo e suportes",
        link: "https://s.shopee.com.br/1VzxrMzDmZ",
        comissao: "3%",
        badge: "Alta Procura"
    },
    {
        id: "audio",
        nome: "Fones & Caixas de Som",
        nomeOriginal: "Audio",
        icone: "🎧",
        descricao: "Fones bluetooth TWS, headsets e caixas de som potentes",
        link: "https://s.shopee.com.br/2gBvFVumPu",
        comissao: "3%",
        badge: "Frete Grátis"
    },
    {
        id: "eletro",
        nome: "Eletrodomésticos & Cozinha",
        nomeOriginal: "Home Appliances",
        icone: "🏠",
        descricao: "Air fryers, cafeteiras, aspiradores e utilidades para o lar",
        link: "https://s.shopee.com.br/1gJO3fyaRY",
        comissao: "3%",
        badge: "Até 60% OFF"
    },
    {
        id: "relogios",
        nome: "Relógios & Smartwatches",
        nomeOriginal: "Watches",
        icone: "⌚",
        descricao: "Smartbands, relógios analógicos e digitais à prova d'água",
        link: "https://s.shopee.com.br/3B8BqQssOz",
        comissao: "3%",
        badge: "Tendência"
    },
    {
        id: "beleza",
        nome: "Beleza & Cosméticos",
        nomeOriginal: "Beauty",
        icone: "💄",
        descricao: "Maquiagem, skincare, perfumes importados e cuidados",
        link: "https://s.shopee.com.br/50Zq1nltgO",
        comissao: "3%",
        badge: "Viral TikTok"
    },
    {
        id: "pets",
        nome: "Pet Shop & Animais",
        nomeOriginal: "Pets",
        icone: "🐾",
        descricao: "Comedouros, brinquedos, caminhas e acessórios para cães e gatos",
        link: "https://s.shopee.com.br/5AtGE6lGLR",
        comissao: "3%",
        badge: "Favorito"
    },
    {
        id: "saude",
        nome: "Saúde & Cuidados Pessoais",
        nomeOriginal: "Health",
        icone: "🩺",
        descricao: "Massageadores, termômetros, balanças e bem-estar",
        link: "https://s.shopee.com.br/20wESHxJla",
        comissao: "3%",
        badge: "Essencial"
    },
    {
        id: "moda-fem",
        nome: "Roupas Femininas",
        nomeOriginal: "Women Clothes",
        icone: "👗",
        descricao: "Vestidos, conjuntos, blusas e últimas novidades de moda",
        link: "https://s.shopee.com.br/3LRc2jsF3y",
        comissao: "3%",
        badge: "Novidades"
    },
    {
        id: "calcados-fem",
        nome: "Calçados Femininos",
        nomeOriginal: "Women Shoes",
        icone: "👠",
        descricao: "Tênis casuais, saltos, rasteirinhas e sandálias",
        link: "https://s.shopee.com.br/3Vl2F2rbj1",
        comissao: "3%",
        badge: "Moda"
    },
    {
        id: "bolsas-fem",
        nome: "Bolsas Femininas",
        nomeOriginal: "Women Bags",
        icone: "👜",
        descricao: "Bolsas tiracolo, carteiras e bolsas para o dia a dia",
        link: "https://s.shopee.com.br/3qNsdeqL33",
        comissao: "3%",
        badge: "Top Ofertas"
    },
    {
        id: "moda-masc",
        nome: "Roupas Masculinas",
        nomeOriginal: "Men Clothes",
        icone: "👔",
        descricao: "Camisetas básicas, camisas sociais, bermudas e calças",
        link: "https://s.shopee.com.br/1qcoFyxx6b",
        comissao: "3%",
        badge: "Custo-Benefício"
    },
    {
        id: "calcados-masc",
        nome: "Calçados Masculinos",
        nomeOriginal: "Men Shoes",
        icone: "👟",
        descricao: "Tênis esportivos, chuteiras, sapatênis e sapatos",
        link: "https://s.shopee.com.br/1LgXf3zr7W",
        comissao: "3%",
        badge: "Conforto"
    },
    {
        id: "bolsas-masc",
        nome: "Mochilas & Bolsas Masculinas",
        nomeOriginal: "Men Bags",
        icone: "🎒",
        descricao: "Mochilas para notebook, shoulder bags e carteiras",
        link: "https://s.shopee.com.br/30ole7tVjw",
        comissao: "3%",
        badge: "Resistente"
    },
    {
        id: "acessorios",
        nome: "Acessórios de Moda",
        nomeOriginal: "Fashion Accessories",
        icone: "💍",
        descricao: "Óculos de sol, colares, anéis, cintos e bijuterias",
        link: "https://s.shopee.com.br/2BFeeawgQd",
        comissao: "3%",
        badge: "Baratinhos"
    },
    {
        id: "mamae-bebe",
        nome: "Mamãe e Bebê",
        nomeOriginal: "Mom & Baby",
        icone: "👶",
        descricao: "Enxoval, mamadeiras, chupetas e cuidados para o bebê",
        link: "https://s.shopee.com.br/4fwzdBnAMM",
        comissao: "3%",
        badge: "Amor & Cuidado"
    },
    {
        id: "moda-infantil",
        nome: "Moda Infantil & Crianças",
        nomeOriginal: "Baby & Kids Fashion",
        icone: "🧸",
        descricao: "Roupas fofas, conjuntos infantis e calçados para os pequenos",
        link: "https://s.shopee.com.br/4qGPpUmX1P",
        comissao: "3%",
        badge: "Família"
    },
    {
        id: "alimentos",
        nome: "Alimentos & Bebidas",
        nomeOriginal: "Food & Beverages",
        icone: "🍫",
        descricao: "Chocolates, snacks, cafés gourmets, doces e bebidas",
        link: "https://s.shopee.com.br/2qVLRou94x",
        comissao: "3%",
        badge: "Gostosuras"
    },
    {
        id: "viagem",
        nome: "Malas & Viagem",
        nomeOriginal: "Travel & Luggage",
        icone: "🧳",
        descricao: "Malas de rodinha, organizadores de mala e almofadas de pescoço",
        link: "https://s.shopee.com.br/3g4SRLqyO0",
        comissao: "3%",
        badge: "Pronto p/ Viajar"
    }
];
