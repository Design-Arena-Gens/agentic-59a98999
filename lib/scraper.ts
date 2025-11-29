import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ProductInfo {
  name: string
  description: string
  price: string
  features: string[]
  specifications: Record<string, string>
  images: string[]
  rating?: string
  reviewCount?: string
}

export async function scrapeProductInfo(url: string): Promise<ProductInfo> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const hostname = new URL(url).hostname

    let productInfo: ProductInfo = {
      name: '',
      description: '',
      price: '',
      features: [],
      specifications: {},
      images: []
    }

    // Amazon scraping
    if (hostname.includes('amazon')) {
      productInfo.name = $('#productTitle').text().trim() || $('h1.a-size-large').text().trim()
      productInfo.description = $('#feature-bullets ul li').map((_, el) => $(el).text().trim()).get().join('. ')
      productInfo.price = $('.a-price .a-offscreen').first().text().trim() || $('.a-price-whole').first().text().trim()
      productInfo.features = $('#feature-bullets ul li span.a-list-item').map((_, el) => $(el).text().trim()).get()
      productInfo.rating = $('span.a-icon-alt').first().text().trim()
      productInfo.reviewCount = $('#acrCustomerReviewText').first().text().trim()

      // Specifications
      $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').each((_, el) => {
        const key = $(el).find('th').text().trim()
        const value = $(el).find('td').text().trim()
        if (key && value) {
          productInfo.specifications[key] = value
        }
      })

      // Images
      productInfo.images = $('#altImages ul li img').map((_, el) => $(el).attr('src') || '').get()
    }

    // Mercado Livre scraping
    else if (hostname.includes('mercadolivre') || hostname.includes('mercadolibre')) {
      productInfo.name = $('.ui-pdp-title').text().trim()
      productInfo.description = $('.ui-pdp-description__content').text().trim()
      productInfo.price = $('.andes-money-amount__fraction').first().text().trim()
      productInfo.features = $('.ui-pdp-highlights__list li').map((_, el) => $(el).text().trim()).get()
      productInfo.rating = $('.ui-pdp-review__rating').text().trim()

      // Specifications
      $('.andes-table tbody tr').each((_, el) => {
        const key = $(el).find('.andes-table__column--left').text().trim()
        const value = $(el).find('.andes-table__column--right').text().trim()
        if (key && value) {
          productInfo.specifications[key] = value
        }
      })
    }

    // Shopee scraping
    else if (hostname.includes('shopee')) {
      productInfo.name = $('._3STPwE').text().trim() || $('span[class*="title"]').first().text().trim()
      productInfo.description = $('._2aZyWI').text().trim()
      productInfo.price = $('._3n5NQx').text().trim()
      productInfo.rating = $('._3y5XOB').text().trim()
    }

    // Magazine Luiza scraping
    else if (hostname.includes('magazineluiza')) {
      productInfo.name = $('h1[data-testid="heading-product-title"]').text().trim()
      productInfo.description = $('.description__container-text').text().trim()
      productInfo.price = $('[data-testid="price-value"]').text().trim()
      productInfo.features = $('.description__list-item').map((_, el) => $(el).text().trim()).get()
    }

    // Generic fallback scraping
    else {
      productInfo.name = $('h1').first().text().trim() || $('title').text().trim()
      productInfo.description = $('meta[name="description"]').attr('content') ||
                                $('meta[property="og:description"]').attr('content') ||
                                $('p').first().text().trim()

      // Try to find price
      const priceSelectors = ['.price', '[class*="price"]', '[data-price]', '.product-price']
      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim()
        if (priceText) {
          productInfo.price = priceText
          break
        }
      }

      // Get images
      productInfo.images = $('img[src*="product"], img[class*="product"]')
        .map((_, el) => $(el).attr('src') || '')
        .get()
    }

    // Clean up empty values
    if (!productInfo.name) {
      productInfo.name = 'Product'
    }
    if (!productInfo.description) {
      productInfo.description = 'No description available'
    }
    if (!productInfo.price) {
      productInfo.price = 'Price not available'
    }

    return productInfo
  } catch (error) {
    console.error('Error scraping product:', error)

    // Return minimal product info on error
    return {
      name: 'Product',
      description: 'Unable to fetch product details automatically. Please verify the product URL.',
      price: 'N/A',
      features: [],
      specifications: {},
      images: []
    }
  }
}
