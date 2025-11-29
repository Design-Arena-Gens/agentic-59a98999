export function optimizeSEO(
  article: string,
  keywords: string[],
  topic: string,
  geoLocation?: string
): string {
  let optimizedArticle = article

  // Add meta tags if not present
  if (!article.includes('<meta') && !article.includes('<!-- SEO')) {
    const metaTags = generateMetaTags(article, keywords, topic, geoLocation)
    optimizedArticle = metaTags + '\n\n' + optimizedArticle
  }

  // Add schema.org structured data
  const schemaMarkup = generateSchemaMarkup(article, topic, geoLocation)
  optimizedArticle = optimizedArticle + '\n\n' + schemaMarkup

  // Optimize heading structure
  optimizedArticle = optimizeHeadingStructure(optimizedArticle, keywords)

  // Add internal linking suggestions
  optimizedArticle = addInternalLinkingComments(optimizedArticle)

  // Add keyword density optimization
  optimizedArticle = ensureKeywordPresence(optimizedArticle, keywords)

  // Add alt text to images if missing
  optimizedArticle = optimizeImageAltText(optimizedArticle, keywords)

  // Add reading time estimate
  optimizedArticle = addReadingTime(optimizedArticle)

  return optimizedArticle
}

function generateMetaTags(article: string, keywords: string[], topic: string, geoLocation?: string): string {
  // Extract first paragraph for meta description
  const firstParagraphMatch = article.match(/<p[^>]*>(.*?)<\/p>/s)
  const firstParagraph = firstParagraphMatch ? firstParagraphMatch[1].replace(/<[^>]+>/g, '').substring(0, 155) : topic

  const metaDescription = `${firstParagraph}... ${geoLocation ? `Informações para ${geoLocation}.` : ''}`
  const metaKeywords = keywords.join(', ')

  return `<!-- SEO Meta Tags -->
<!--
  Title: ${topic}
  Meta Description: ${metaDescription}
  Keywords: ${metaKeywords}
  ${geoLocation ? `Geo-Target: ${geoLocation}` : ''}
-->
<meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}" />
<meta name="keywords" content="${metaKeywords}" />
<meta property="og:title" content="${topic}" />
<meta property="og:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${topic}" />
<meta name="twitter:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
${geoLocation ? `<meta name="geo.region" content="${geoLocation}" />` : ''}
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://yourdomain.com/article-url" />`
}

function generateSchemaMarkup(article: string, topic: string, geoLocation?: string): string {
  const datePublished = new Date().toISOString()

  return `
<!-- Schema.org Structured Data for SEO -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${topic.replace(/"/g, '\\"')}",
  "datePublished": "${datePublished}",
  "dateModified": "${datePublished}",
  "author": {
    "@type": "Person",
    "name": "AI Content Generator"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Site Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png"
    }
  },
  "description": "Comprehensive article about ${topic}",
  ${geoLocation ? `"contentLocation": {
    "@type": "Place",
    "name": "${geoLocation}"
  },` : ''}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://yourdomain.com/article-url"
  }
}
</script>`
}

function optimizeHeadingStructure(article: string, keywords: string[]): string {
  let optimized = article

  // Ensure H1 is present and contains primary keyword
  if (!article.includes('<h1') && keywords.length > 0) {
    const h1Match = article.match(/<h2[^>]*>(.*?)<\/h2>/)
    if (h1Match) {
      optimized = optimized.replace(h1Match[0], h1Match[0].replace('h2', 'h1'))
    }
  }

  return optimized
}

function addInternalLinkingComments(article: string): string {
  return article + `\n\n<!-- Internal Linking Suggestions:
- Link to related articles about similar topics
- Add contextual links to category pages
- Include navigation to main topic hub
- Cross-reference other product reviews if applicable
-->`
}

function ensureKeywordPresence(article: string, keywords: string[]): string {
  // This is a simple check - in production you'd want more sophisticated analysis
  let modified = article

  keywords.forEach((keyword, index) => {
    const regex = new RegExp(keyword, 'gi')
    const matches = article.match(regex)

    if (!matches || matches.length < 2) {
      // Add comment suggesting keyword inclusion
      modified += `\n<!-- SEO Note: Consider adding more instances of "${keyword}" naturally throughout the content -->`
    }
  })

  return modified
}

function optimizeImageAltText(article: string, keywords: string[]): string {
  let optimized = article

  // Find images without alt text and add suggestions
  const imgRegex = /<img([^>]*?)(?:alt=["']([^"']*)["'])?([^>]*?)>/gi
  let match

  while ((match = imgRegex.exec(article)) !== null) {
    const fullMatch = match[0]
    const altText = match[2]

    if (!altText || altText.trim() === '') {
      // Suggest adding alt text with keywords
      const suggestion = keywords[0] || 'relevant keyword'
      const improvedImg = fullMatch.replace('<img', `<img alt="${suggestion}"`)

      optimized = optimized.replace(fullMatch, improvedImg)
    }
  }

  return optimized
}

function addReadingTime(article: string): string {
  // Estimate reading time (average 200 words per minute)
  const text = article.replace(/<[^>]+>/g, '')
  const wordCount = text.split(/\s+/).length
  const readingTimeMinutes = Math.ceil(wordCount / 200)

  const readingTimeBadge = `
<div class="flex items-center gap-2 text-gray-600 text-sm mb-6">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
  <span>Tempo de leitura: ${readingTimeMinutes} ${readingTimeMinutes === 1 ? 'minuto' : 'minutos'}</span>
  <span class="mx-2">•</span>
  <span>${wordCount} palavras</span>
</div>`

  // Insert after the first h1 or at the beginning
  const h1Match = article.match(/<h1[^>]*>.*?<\/h1>/s)
  if (h1Match) {
    return article.replace(h1Match[0], h1Match[0] + '\n' + readingTimeBadge)
  }

  return readingTimeBadge + '\n' + article
}

export function generateSEOReport(article: string, keywords: string[]): {
  wordCount: number
  keywordDensity: Record<string, number>
  headingCount: { h1: number; h2: number; h3: number }
  imageCount: number
  imagesWithAlt: number
  internalLinks: number
  externalLinks: number
} {
  const text = article.replace(/<[^>]+>/g, '')
  const wordCount = text.split(/\s+/).length

  const keywordDensity: Record<string, number> = {}
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi')
    const matches = article.match(regex)
    keywordDensity[keyword] = matches ? (matches.length / wordCount) * 100 : 0
  })

  const h1Count = (article.match(/<h1/g) || []).length
  const h2Count = (article.match(/<h2/g) || []).length
  const h3Count = (article.match(/<h3/g) || []).length

  const imageCount = (article.match(/<img/g) || []).length
  const imagesWithAlt = (article.match(/<img[^>]+alt=/g) || []).length

  const internalLinks = (article.match(/<a[^>]+href=["']\/[^"']*["']/g) || []).length
  const externalLinks = (article.match(/<a[^>]+href=["']https?:\/\//g) || []).length

  return {
    wordCount,
    keywordDensity,
    headingCount: { h1: h1Count, h2: h2Count, h3: h3Count },
    imageCount,
    imagesWithAlt,
    internalLinks,
    externalLinks
  }
}
