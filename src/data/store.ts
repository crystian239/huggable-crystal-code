import codImg from "@/assets/games/cod.jpg";
import clashImg from "@/assets/games/clash.jpg";
import mcImg from "@/assets/games/minecraft.jpg";
import valorantImg from "@/assets/games/valorant.jpg";
import ffImg from "@/assets/games/freefire.jpg";
import fortniteImg from "@/assets/games/fortnite.jpg";
import robloxImg from "@/assets/games/roblox.jpg";

export interface Game {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  gameId: string;
  gameName: string;
  category: string;
  seller: Seller;
  images: string[];
  rating: number;
  sales: number;
  available: number;
  tag?: string;
  badge?: string;
  createdAt: string;
  features: string[];
  characteristics: { label: string; value: string }[];
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  sales: number;
  verified: boolean;
  memberSince: string;
  lastAccess: string;
  online: boolean;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  docsVerified: boolean;
  totalReviews: number;
}

export interface Review {
  id: string;
  user: string;
  text: string;
  rating: number;
  game: string;
  time: string;
  listingId?: string;
  type: "positive" | "neutral" | "negative";
  receivedAs: "comprador" | "vendedor";
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  slug: string;
}

export interface CartItem {
  listing: Listing;
  quantity: number;
}

export const games: Game[] = [
  { id: "cod", name: "Call of Duty", slug: "call-of-duty", image: codImg, subcategories: ["Contas", "Gold & Moedas", "Skins", "Serviços", "Elojob"] },
  { id: "clash", name: "Clash of Clans", slug: "clash-of-clans", image: clashImg, subcategories: ["Contas", "Gemas", "Serviços", "Clãs"] },
  { id: "minecraft", name: "Minecraft", slug: "minecraft", image: mcImg, subcategories: ["Contas Premium", "Servidores", "Mods", "Skins"] },
  { id: "valorant", name: "Valorant", slug: "valorant", image: valorantImg, subcategories: ["Contas", "Contas (email não confirmado)", "Skins", "Elojob", "Valorant Points", "Coach, Guias e eBooks"] },
  { id: "freefire", name: "Free Fire", slug: "free-fire", image: ffImg, subcategories: ["Contas", "Diamantes", "Skins", "Elojob", "Recarga"] },
  { id: "fortnite", name: "Fortnite", slug: "fortnite", image: fortniteImg, subcategories: ["Contas", "V-Bucks", "Skins", "Battle Pass", "Serviços"] },
  { id: "roblox", name: "Roblox", slug: "roblox", image: robloxImg, subcategories: ["Contas", "Robux", "Game Pass", "Itens", "Serviços"] },
  { id: "lol", name: "League of Legends", slug: "league-of-legends", image: valorantImg, subcategories: ["Contas", "RP", "Skins", "Elojob", "Coach"] },
  { id: "genshin", name: "Genshin Impact", slug: "genshin-impact", image: fortniteImg, subcategories: ["Contas", "Cristais", "Serviços", "Reroll"] },
  { id: "steam", name: "Steam", slug: "steam", image: mcImg, subcategories: ["Gift Cards", "Jogos", "Itens", "Contas"] },
  { id: "ps", name: "PlayStation", slug: "playstation", image: codImg, subcategories: ["Gift Cards", "Assinaturas", "Contas", "Jogos"] },
  { id: "xbox", name: "Xbox", slug: "xbox", image: robloxImg, subcategories: ["Gift Cards", "Game Pass", "Contas", "Jogos"] },
];

const sellers: Seller[] = [
  { id: "s1", name: "ProGamer99", avatar: "P", rating: 4.9, sales: 127, verified: true, memberSince: "2023-03-15", lastAccess: "em 5 minutos", online: true, positiveReviews: 124, neutralReviews: 2, negativeReviews: 1, emailVerified: true, phoneVerified: true, docsVerified: true, totalReviews: 127 },
  { id: "s2", name: "FFKing", avatar: "F", rating: 4.7, sales: 89, verified: true, memberSince: "2023-06-20", lastAccess: "em 30 minutos", online: true, positiveReviews: 85, neutralReviews: 3, negativeReviews: 1, emailVerified: true, phoneVerified: true, docsVerified: false, totalReviews: 89 },
  { id: "s3", name: "CardMaster", avatar: "C", rating: 5.0, sales: 342, verified: true, memberSince: "2022-11-01", lastAccess: "em 2 minutos", online: true, positiveReviews: 340, neutralReviews: 2, negativeReviews: 0, emailVerified: true, phoneVerified: true, docsVerified: true, totalReviews: 342 },
  { id: "s4", name: "BlockStore", avatar: "B", rating: 4.8, sales: 215, verified: true, memberSince: "2023-01-10", lastAccess: "em 1 hora", online: false, positiveReviews: 210, neutralReviews: 3, negativeReviews: 2, emailVerified: true, phoneVerified: true, docsVerified: true, totalReviews: 215 },
  { id: "s5", name: "VBucksBR", avatar: "V", rating: 4.6, sales: 56, verified: false, memberSince: "2024-02-14", lastAccess: "em 3 horas", online: false, positiveReviews: 52, neutralReviews: 3, negativeReviews: 1, emailVerified: true, phoneVerified: false, docsVerified: false, totalReviews: 56 },
  { id: "s6", name: "WarZoneKing", avatar: "W", rating: 4.9, sales: 73, verified: true, memberSince: "2023-08-05", lastAccess: "em 15 minutos", online: true, positiveReviews: 71, neutralReviews: 1, negativeReviews: 1, emailVerified: true, phoneVerified: true, docsVerified: true, totalReviews: 73 },
  { id: "s7", name: "MDLonely", avatar: "M", rating: 4.8, sales: 63, verified: true, memberSince: "2023-05-12", lastAccess: "em 20 minutos", online: true, positiveReviews: 60, neutralReviews: 2, negativeReviews: 1, emailVerified: true, phoneVerified: true, docsVerified: false, totalReviews: 63 },
  { id: "s8", name: "Nakassunakassu", avatar: "N", rating: 4.5, sales: 18, verified: false, memberSince: "2024-06-01", lastAccess: "em 2 horas", online: false, positiveReviews: 16, neutralReviews: 1, negativeReviews: 1, emailVerified: true, phoneVerified: false, docsVerified: false, totalReviews: 18 },
];

export const listings: Listing[] = [
  {
    id: "l1", title: "Conta Valorant - Radiante S8 - Full Skins", description: "Conta Valorant rank Radiante na Season 8. Possui mais de 50 skins, incluindo coleções completas de Protocolo, Spectrum e RGX. Nível 200+, todos os agentes desbloqueados. Full acesso com email alterável.\n\n*Faca - Ion, karambit 2.0, butterfly e outras de passes\n*Vandal - Ancífogo, Origem, sublime, sentinelas da luz e outras de passes\n*Phantom - Glitchpop, brinquedo, ZEDD, Oni e outras de passes\n*Operator - Ion e Glitchpop\n*Spectre - singularidade e Brinquedo", price: 450, gameId: "valorant", gameName: "Valorant", category: "Contas", seller: sellers[0], images: [valorantImg, codImg, fortniteImg, ffImg], rating: 4.9, sales: 127, available: 1, tag: "Destaque", badge: "radiante", createdAt: "2026-03-24",
    features: ["Rank Radiante", "50+ Skins", "Nível 200+", "Full Acesso", "Email alterável"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Procedência", value: "Revenda > Possui dados de recuperação" }, { label: "Rank", value: "Radiante" }, { label: "Nível", value: "200+" }]
  },
  {
    id: "l2", title: "Conta Free Fire - Level 80+ com Skins Raras", description: "Conta Free Fire nível 80+ com diversas skins raras incluindo pacotes de evento limitado. Possui diamantes acumulados e personagens desbloqueados.", price: 89.9, gameId: "freefire", gameName: "Free Fire", category: "Contas", seller: sellers[1], images: [ffImg, valorantImg], rating: 4.7, sales: 89, available: 1, tag: "Popular", createdAt: "2026-03-23",
    features: ["Level 80+", "Skins Raras", "Personagens desbloqueados", "Full Acesso"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Level", value: "80+" }, { label: "Procedência", value: "Conta própria" }]
  },
  {
    id: "l3", title: "Gift Card Steam R$100 - Entrega Imediata", description: "Gift Card Steam no valor de R$100,00. Entrega instantânea por email após confirmação do pagamento. Código válido para a loja brasileira.", price: 85, gameId: "steam", gameName: "Steam", category: "Gift Cards", seller: sellers[2], images: [mcImg], rating: 5.0, sales: 342, available: 15, tag: "Melhor preço", createdAt: "2026-03-24",
    features: ["R$100 em créditos", "Entrega imediata", "Loja BR", "Código digital"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Gift Card" }, { label: "Valor", value: "R$ 100,00" }, { label: "Região", value: "Brasil" }]
  },
  {
    id: "l4", title: "Conta Minecraft Premium Java + Bedrock", description: "Conta Minecraft Premium com acesso Java e Bedrock. Migrada para Microsoft, full acesso. Inclui capa personalizada e skins exclusivas.", price: 29.9, gameId: "minecraft", gameName: "Minecraft", category: "Contas Premium", seller: sellers[3], images: [mcImg, robloxImg], rating: 4.8, sales: 215, available: 3, tag: "Oferta", createdAt: "2026-03-22",
    features: ["Java + Bedrock", "Full Acesso", "Capa personalizada", "Conta Microsoft"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Edição", value: "Java + Bedrock" }, { label: "Procedência", value: "Conta própria" }]
  },
  {
    id: "l5", title: "1000 V-Bucks Fortnite - Código Digital", description: "Código de 1000 V-Bucks para Fortnite. Resgate instantâneo na loja do jogo. Compatível com todas as plataformas.", price: 39.9, gameId: "fortnite", gameName: "Fortnite", category: "V-Bucks", seller: sellers[4], images: [fortniteImg], rating: 4.6, sales: 56, available: 8, createdAt: "2026-03-24",
    features: ["1000 V-Bucks", "Código digital", "Todas plataformas", "Resgate instantâneo"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Moeda Virtual" }, { label: "Quantidade", value: "1000 V-Bucks" }]
  },
  {
    id: "l6", title: "Conta CoD MW3 - Prestige Master + DM Ultra", description: "Conta Call of Duty Modern Warfare 3 com Prestige Master, camuflagem DM Ultra desbloqueada. Possui diversos blueprints e operadores.", price: 199, gameId: "cod", gameName: "Call of Duty", category: "Contas", seller: sellers[5], images: [codImg, valorantImg, fortniteImg], rating: 4.9, sales: 73, available: 1, tag: "Destaque", createdAt: "2026-03-23",
    features: ["Prestige Master", "DM Ultra", "Blueprints", "Operadores", "Full Acesso"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Prestige", value: "Master" }, { label: "Procedência", value: "Conta própria" }]
  },
  {
    id: "l7", title: "Conta Valorant - Diamante 1 - MMR Alto - Sem Skins - Full Acesso", description: "Conta Valorant rank Diamante 1 com MMR alto. Sem skins premium. Ideal para quem quer subir de rank rapidamente.", price: 89.9, gameId: "valorant", gameName: "Valorant", category: "Contas", seller: sellers[6], images: [valorantImg, codImg], rating: 4.8, sales: 63, available: 1, createdAt: "2026-03-24",
    features: ["Diamante 1", "MMR Alto", "Full Acesso", "Email alterável"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Rank", value: "Diamante 1" }, { label: "Procedência", value: "Revenda > Possui dados de recuperação" }]
  },
  {
    id: "l8", title: "Conta Valorant (2400$ investidos) Kit Kuronami e forrada de skin", description: "Conta com mais de R$2.400 investidos. Coleção Kuronami completa, várias skins premium. Rank Ascendente.", price: 900, gameId: "valorant", gameName: "Valorant", category: "Contas", seller: sellers[7], images: [valorantImg, ffImg, codImg], rating: 4.5, sales: 18, available: 1, tag: "Destaque", createdAt: "2026-03-22",
    features: ["R$2400 investidos", "Kit Kuronami", "Rank Ascendente", "Skins Premium"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Investido", value: "R$ 2.400,00" }, { label: "Rank", value: "Ascendente" }]
  },
  {
    id: "l9", title: "Elojob Valorant - Do Bronze ao Diamante", description: "Serviço de Elojob profissional. Subimos sua conta do Bronze até Diamante com segurança. Prazo de 3-5 dias.", price: 150, gameId: "valorant", gameName: "Valorant", category: "Elojob", seller: sellers[0], images: [valorantImg], rating: 4.9, sales: 45, available: 5, createdAt: "2026-03-24",
    features: ["Bronze ao Diamante", "3-5 dias", "Seguro", "Profissional"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Serviço" }, { label: "Prazo", value: "3-5 dias" }]
  },
  {
    id: "l10", title: "Clash of Clans - CV15 Full - Muros Máximos", description: "Conta Clash of Clans com Centro de Vila 15 totalmente upado. Todos os muros no nível máximo, heróis nível 80+, tropas full.", price: 350, gameId: "clash", gameName: "Clash of Clans", category: "Contas", seller: sellers[2], images: [clashImg, mcImg], rating: 5.0, sales: 28, available: 1, tag: "Destaque", createdAt: "2026-03-23",
    features: ["CV15 Full", "Muros Máximos", "Heróis 80+", "Tropas Full"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "CV", value: "15 Full" }, { label: "Procedência", value: "Conta própria" }]
  },
  {
    id: "l11", title: "2000 Robux - Código Instantâneo", description: "Código de 2000 Robux para Roblox. Entrega instantânea após confirmação. Válido para qualquer conta.", price: 59.9, gameId: "roblox", gameName: "Roblox", category: "Robux", seller: sellers[3], images: [robloxImg], rating: 4.8, sales: 180, available: 25, tag: "Popular", createdAt: "2026-03-24",
    features: ["2000 Robux", "Entrega instantânea", "Código digital", "Qualquer conta"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Moeda Virtual" }, { label: "Quantidade", value: "2000 Robux" }]
  },
  {
    id: "l12", title: "Gift Card PlayStation R$250", description: "Gift Card PSN no valor de R$250. Código digital com entrega imediata. Válido para PS4 e PS5 na loja brasileira.", price: 220, gameId: "ps", gameName: "PlayStation", category: "Gift Cards", seller: sellers[2], images: [codImg], rating: 5.0, sales: 156, available: 10, tag: "Melhor preço", createdAt: "2026-03-24",
    features: ["R$250 em créditos", "PS4 e PS5", "Loja BR", "Entrega imediata"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Gift Card" }, { label: "Valor", value: "R$ 250,00" }, { label: "Plataforma", value: "PS4 / PS5" }]
  },
  {
    id: "l13", title: "Xbox Game Pass Ultimate - 1 Mês", description: "Assinatura Xbox Game Pass Ultimate por 1 mês. Acesso a centenas de jogos no Xbox e PC. Inclui Xbox Live Gold.", price: 29.9, gameId: "xbox", gameName: "Xbox", category: "Game Pass", seller: sellers[4], images: [robloxImg], rating: 4.6, sales: 92, available: 20, createdAt: "2026-03-23",
    features: ["1 mês", "Xbox + PC", "Centenas de jogos", "Xbox Live Gold incluso"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Assinatura" }, { label: "Duração", value: "1 mês" }]
  },
  {
    id: "l14", title: "Conta Fortnite - 200+ Skins + Galaxy", description: "Conta Fortnite com mais de 200 skins incluindo a rara Galaxy. Possui vários emotes, picaretas e planadores exclusivos.", price: 680, gameId: "fortnite", gameName: "Fortnite", category: "Contas", seller: sellers[5], images: [fortniteImg, codImg, valorantImg], rating: 4.9, sales: 34, available: 1, tag: "Destaque", createdAt: "2026-03-22",
    features: ["200+ Skins", "Skin Galaxy", "Emotes exclusivos", "Full Acesso"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Skins", value: "200+" }, { label: "Procedência", value: "Conta própria" }]
  },
  {
    id: "l15", title: "Conta Free Fire - Colecionador - 100+ Skins", description: "Conta colecionador Free Fire com mais de 100 skins, incluindo diversas lendárias e de eventos limitados. Level 75.", price: 250, gameId: "freefire", gameName: "Free Fire", category: "Contas", seller: sellers[1], images: [ffImg, robloxImg], rating: 4.7, sales: 41, available: 1, createdAt: "2026-03-23",
    features: ["100+ Skins", "Skins Lendárias", "Level 75", "Eventos limitados"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Conta" }, { label: "Skins", value: "100+" }, { label: "Level", value: "75" }]
  },
  {
    id: "l16", title: "Coach Valorant - Sessão 1 hora - Imortal+", description: "Sessão de coaching de 1 hora com jogador Imortal+. Análise de gameplay, posicionamento e mentalidade competitiva.", price: 60, gameId: "valorant", gameName: "Valorant", category: "Coach, Guias e eBooks", seller: sellers[0], images: [valorantImg], rating: 4.9, sales: 89, available: 10, createdAt: "2026-03-24",
    features: ["1 hora", "Jogador Imortal+", "Análise completa", "Via Discord"],
    characteristics: [{ label: "Tipo do Anúncio", value: "Serviço" }, { label: "Duração", value: "1 hora" }, { label: "Rank do Coach", value: "Imortal+" }]
  },
];

export const reviews: Review[] = [
  { id: "r1", user: "Lucas M.", text: "Comprei minha conta Valorant aqui, entrega super rápida e tudo certinho. Recomendo demais!", rating: 5, game: "Valorant", time: "2 horas atrás", listingId: "l1", type: "positive", receivedAs: "comprador" },
  { id: "r2", user: "Ana C.", text: "Gift card Steam chegou no e-mail em menos de 5 minutos. Melhor site pra isso!", rating: 5, game: "Steam", time: "5 horas atrás", listingId: "l3", type: "positive", receivedAs: "comprador" },
  { id: "r3", user: "Pedro H.", text: "Vendedor muito atencioso, conta Fortnite exatamente como descrita. Voltarei a comprar.", rating: 4, game: "Fortnite", time: "1 dia atrás", listingId: "l14", type: "positive", receivedAs: "comprador" },
  { id: "r4", user: "Julia S.", text: "Já é minha terceira compra aqui, nunca tive problema. Suporte excelente!", rating: 5, game: "Free Fire", time: "2 dias atrás", listingId: "l2", type: "positive", receivedAs: "comprador" },
  { id: "r5", user: "Matheus R.", text: "Conta Clash of Clans veio exatamente como descrita. CV15 perfeito, super satisfeito!", rating: 5, game: "Clash of Clans", time: "3 horas atrás", listingId: "l10", type: "positive", receivedAs: "comprador" },
  { id: "r6", user: "Fernanda L.", text: "Elojob feito com profissionalismo. Subiram minha conta sem problemas.", rating: 5, game: "Valorant", time: "1 dia atrás", listingId: "l9", type: "positive", receivedAs: "comprador" },
  { id: "r7", user: "Gabriel T.", text: "Robux entregue instantaneamente. Processo super simples.", rating: 4, game: "Roblox", time: "4 horas atrás", listingId: "l11", type: "positive", receivedAs: "comprador" },
  { id: "r8", user: "Camila B.", text: "Conta Minecraft premium funcionando perfeitamente. Ótimo preço!", rating: 5, game: "Minecraft", time: "6 horas atrás", listingId: "l4", type: "positive", receivedAs: "comprador" },
  { id: "r9", user: "Rafael D.", text: "Demorou um pouco mais que o esperado mas chegou.", rating: 3, game: "Valorant", time: "1 dia atrás", listingId: "l7", type: "neutral", receivedAs: "comprador" },
  { id: "r10", user: "Bom vendedor", text: "bom comprador", rating: 5, game: "Valorant", time: "22/03/26 às 15:49", listingId: "l1", type: "positive", receivedAs: "vendedor" },
];

export const blogPosts: BlogPost[] = [
  { id: "b1", title: "Os melhores jogos gratuitos para jogar em 2026", excerpt: "Descubra os jogos free-to-play mais populares do momento e como economizar nas compras in-game.", image: fortniteImg, author: "EzGamer", authorAvatar: "EZ", date: "24/03/2026", readTime: "5 min", slug: "melhores-jogos-gratuitos-2026" },
  { id: "b2", title: "Como proteger sua conta gamer de hackers", excerpt: "Dicas essenciais de segurança para manter suas contas de jogos seguras contra invasões.", image: valorantImg, author: "EzGamer", authorAvatar: "EZ", date: "22/03/2026", readTime: "4 min", slug: "proteger-conta-gamer-hackers" },
  { id: "b3", title: "Guia completo: Como vender itens digitais com segurança", excerpt: "Tudo o que você precisa saber para começar a vender seus itens digitais na EzGamer.", image: codImg, author: "EzGamer", authorAvatar: "EZ", date: "20/03/2026", readTime: "6 min", slug: "guia-vender-itens-digitais" },
  { id: "b4", title: "Fortnite anuncia crossover épico para abril", excerpt: "Novas skins, emotes e itens exclusivos chegam ao Fortnite com colaboração inédita.", image: fortniteImg, author: "EzGamer", authorAvatar: "EZ", date: "19/03/2026", readTime: "3 min", slug: "fortnite-crossover-abril" },
  { id: "b5", title: "Valorant: Novo agente revelado na Season 9", excerpt: "Conheça as habilidades e o gameplay do novo agente que chega ao Valorant.", image: valorantImg, author: "EzGamer", authorAvatar: "EZ", date: "18/03/2026", readTime: "5 min", slug: "valorant-novo-agente-s9" },
  { id: "b6", title: "Gift Cards: Como economizar nas suas compras", excerpt: "Aprenda truques para conseguir os melhores preços em gift cards para suas plataformas favoritas.", image: mcImg, author: "EzGamer", authorAvatar: "EZ", date: "17/03/2026", readTime: "4 min", slug: "gift-cards-economizar" },
];

export function getListingsByGame(gameId: string): Listing[] {
  return listings.filter((l) => l.gameId === gameId);
}

export function getListingsByCategory(category: string): Listing[] {
  return listings.filter((l) => l.category.toLowerCase() === category.toLowerCase());
}

export function searchListings(query: string): Listing[] {
  const q = query.toLowerCase();
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.gameName.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.seller.name.toLowerCase().includes(q)
  );
}

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function getSellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getSellerListings(sellerId: string): Listing[] {
  return listings.filter((l) => l.seller.id === sellerId);
}

export function getRelatedListings(listing: Listing, limit = 6): Listing[] {
  return listings
    .filter((l) => l.id !== listing.id && (l.gameId === listing.gameId || l.category === listing.category))
    .slice(0, limit);
}
