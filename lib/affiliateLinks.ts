interface AffiliateLink {
  platform: string
  url: string
}

export function insertAffiliateLinks(
  article: string,
  affiliateLinks: AffiliateLink[],
  productName: string
): string {
  let modifiedArticle = article

  // Create affiliate link buttons/sections
  const affiliateLinkHTML = generateAffiliateLinkHTML(affiliateLinks, productName)

  // Insert affiliate links in strategic positions
  // 1. After the introduction (first </p> tag)
  // 2. Before the conclusion
  // 3. In the middle of the article

  const paragraphs = modifiedArticle.split('</p>')
  const totalParagraphs = paragraphs.length

  if (totalParagraphs > 3) {
    // Insert after intro (after 2nd paragraph)
    if (paragraphs.length > 2) {
      paragraphs[2] += affiliateLinkHTML
    }

    // Insert in the middle
    const middleIndex = Math.floor(totalParagraphs / 2)
    if (paragraphs[middleIndex]) {
      paragraphs[middleIndex] += affiliateLinkHTML
    }

    // Insert before conclusion (before last 2 paragraphs)
    if (paragraphs.length > 4) {
      const beforeConclusionIndex = totalParagraphs - 3
      paragraphs[beforeConclusionIndex] += affiliateLinkHTML
    }
  } else {
    // For shorter articles, just add at the end
    paragraphs[paragraphs.length - 1] += affiliateLinkHTML
  }

  modifiedArticle = paragraphs.join('</p>')

  // Also insert inline text links for each platform
  affiliateLinks.forEach(link => {
    const platformName = link.platform
    const inlineLink = `<a href="${link.url}" target="_blank" rel="nofollow noopener" class="text-blue-600 hover:text-blue-800 font-semibold underline">${platformName}</a>`

    // Replace mentions of the platform name with affiliate links (first occurrence only)
    const regex = new RegExp(`\\b${platformName}\\b(?![^<]*>|[^<>]*<\\/a>)`, 'i')
    modifiedArticle = modifiedArticle.replace(regex, inlineLink)
  })

  return modifiedArticle
}

function generateAffiliateLinkHTML(affiliateLinks: AffiliateLink[], productName: string): string {
  if (affiliateLinks.length === 0) return ''

  const platformIcons: Record<string, string> = {
    'Amazon': '🛒',
    'Mercado Livre': '🛍️',
    'Shopee': '🏪',
    'Magalu': '🏬',
    'Clickbank': '💳',
    'Hotmart': '🔥',
    'Eduzz': '📱',
    'Kiwify': '🥝',
    'Braip': '🚀'
  }

  const buttonColors: Record<string, string> = {
    'Amazon': 'bg-yellow-500 hover:bg-yellow-600',
    'Mercado Livre': 'bg-yellow-400 hover:bg-yellow-500',
    'Shopee': 'bg-orange-500 hover:bg-orange-600',
    'Magalu': 'bg-blue-500 hover:bg-blue-600',
    'Clickbank': 'bg-green-600 hover:bg-green-700',
    'Hotmart': 'bg-red-500 hover:bg-red-600',
    'Eduzz': 'bg-purple-600 hover:bg-purple-700',
    'Kiwify': 'bg-green-500 hover:bg-green-600',
    'Braip': 'bg-indigo-600 hover:bg-indigo-700'
  }

  let html = `
    <div class="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
      <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">
        🔥 Onde Comprar - Melhores Ofertas
      </h3>
      <p class="text-center text-gray-600 mb-6">
        Confira as melhores ofertas para ${productName}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  `

  affiliateLinks.forEach(link => {
    const icon = platformIcons[link.platform] || '🛒'
    const color = buttonColors[link.platform] || 'bg-blue-600 hover:bg-blue-700'

    html += `
        <a href="${link.url}"
           target="_blank"
           rel="nofollow noopener sponsored"
           class="${color} text-white font-bold py-4 px-6 rounded-lg text-center transform transition hover:scale-105 shadow-md flex items-center justify-center gap-2">
          <span class="text-2xl">${icon}</span>
          <span>Ver em ${link.platform}</span>
        </a>
    `
  })

  html += `
      </div>
      <p class="text-xs text-gray-500 text-center mt-4">
        * Links de afiliado - Ao comprar através destes links, você apoia nosso trabalho sem pagar nada a mais por isso.
      </p>
    </div>
  `

  return html
}

export function generateAffiliateDisclosure(): string {
  return `
    <div class="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <p class="text-sm text-gray-700">
        <strong>Aviso:</strong> Este artigo contém links de afiliado. Isso significa que podemos receber uma comissão
        se você realizar uma compra através dos nossos links, sem custo adicional para você. Recomendamos apenas
        produtos e serviços que acreditamos serem valiosos para nossos leitores.
      </p>
    </div>
  `
}
