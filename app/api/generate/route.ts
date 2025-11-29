import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { scrapeProductInfo } from '@/lib/scraper'
import { spellCheck } from '@/lib/spellcheck'
import { generateImage } from '@/lib/nanoBanana'
import { insertAffiliateLinks } from '@/lib/affiliateLinks'
import { optimizeSEO } from '@/lib/seoOptimizer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

export async function POST(request: NextRequest) {
  try {
    const {
      articleType,
      topic,
      productUrl,
      keywords,
      geoLocation,
      affiliateLinks,
      customReviews,
      generateImages
    } = await request.json()

    let productInfo = null
    if (articleType === 'review' && productUrl) {
      productInfo = await scrapeProductInfo(productUrl)
    }

    // Build the prompt for ChatGPT
    let prompt = `You are an expert content writer specializing in SEO-optimized blog articles.

Task: Write a comprehensive, engaging ${articleType === 'review' ? 'product review' : 'blog'} article about: "${topic}"

${geoLocation ? `Target Audience: ${geoLocation}` : ''}
${keywords.length > 0 ? `SEO Keywords to include naturally: ${keywords.join(', ')}` : ''}

${productInfo ? `
Product Information:
- Name: ${productInfo.name}
- Description: ${productInfo.description}
- Features: ${productInfo.features.join(', ')}
- Price: ${productInfo.price}
- Specifications: ${JSON.stringify(productInfo.specifications)}
` : ''}

${customReviews ? `
Include these customer reviews in the article:
${customReviews}
` : ''}

Requirements:
1. Write a complete HTML article with proper structure (h1, h2, h3, p, ul, ol tags)
2. Include a compelling introduction and conclusion
3. Use SEO best practices with keyword optimization
4. Add meta description and title tags at the beginning
5. For product reviews: Include pros and cons, detailed analysis, and buying recommendations
6. Make the content engaging, informative, and trustworthy
7. Use proper headings hierarchy (H1 for title, H2 for main sections, H3 for subsections)
8. Include call-to-action sections where affiliate links will be placed
9. Add image placeholders with descriptive alt text: [IMAGE: description]
10. Write in a conversational but professional tone
11. Include FAQ section if relevant
12. Add schema markup suggestions in HTML comments

${geoLocation ? `Tailor the content for ${geoLocation} audience, including local considerations, pricing in local currency, and regional preferences.` : ''}

Format: Return ONLY the HTML content, starting with meta tags in HTML comments, then the article body.`

    // Generate article with ChatGPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content writer who creates comprehensive, engaging, and well-structured blog articles optimized for search engines and user engagement.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    let article = completion.choices[0].message.content || ''

    // Spell check the article
    article = await spellCheck(article)

    // Generate images if requested
    if (generateImages && process.env.NANO_BANANA_API_KEY) {
      const imageMatches = article.match(/\[IMAGE: ([^\]]+)\]/g)
      if (imageMatches) {
        for (const match of imageMatches) {
          const description = match.replace('[IMAGE: ', '').replace(']', '')
          try {
            const imageUrl = await generateImage(description)
            article = article.replace(
              match,
              `<img src="${imageUrl}" alt="${description}" class="w-full h-auto rounded-lg shadow-lg my-4" />`
            )
          } catch (error) {
            console.error('Image generation error:', error)
            // Keep placeholder if image generation fails
            article = article.replace(
              match,
              `<div class="bg-gray-200 p-8 rounded-lg my-4 text-center text-gray-600">[Image: ${description}]</div>`
            )
          }
        }
      }
    } else {
      // Replace image placeholders with styled divs
      article = article.replace(
        /\[IMAGE: ([^\]]+)\]/g,
        '<div class="bg-gray-200 p-8 rounded-lg my-4 text-center text-gray-600">[Image: $1]</div>'
      )
    }

    // Insert affiliate links
    if (affiliateLinks && affiliateLinks.length > 0) {
      article = insertAffiliateLinks(article, affiliateLinks, productInfo?.name || topic)
    }

    // Apply SEO optimizations
    article = optimizeSEO(article, keywords, topic, geoLocation)

    return NextResponse.json({ article })
  } catch (error: any) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    )
  }
}
