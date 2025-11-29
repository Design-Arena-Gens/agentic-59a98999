'use client'

import { useState } from 'react'
import { FileText, Link, MapPin, Globe, Image, Star, CheckCircle } from 'lucide-react'

interface AffiliateLink {
  platform: string
  url: string
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [articleType, setArticleType] = useState<'general' | 'review'>('general')
  const [topic, setTopic] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [keywords, setKeywords] = useState('')
  const [geoLocation, setGeoLocation] = useState('')
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [customReviews, setCustomReviews] = useState('')
  const [generatedArticle, setGeneratedArticle] = useState('')
  const [generateImages, setGenerateImages] = useState(true)

  const affiliatePlatforms = [
    'Amazon', 'Mercado Livre', 'Shopee', 'Magalu',
    'Clickbank', 'Hotmart', 'Eduzz', 'Kiwify', 'Braip'
  ]

  const addAffiliateLink = () => {
    setAffiliateLinks([...affiliateLinks, { platform: 'Amazon', url: '' }])
  }

  const updateAffiliateLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...affiliateLinks]
    updated[index][field] = value
    setAffiliateLinks(updated)
  }

  const removeAffiliateLink = (index: number) => {
    setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index))
  }

  const generateArticle = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleType,
          topic,
          productUrl,
          keywords: keywords.split(',').map(k => k.trim()),
          geoLocation,
          affiliateLinks,
          customReviews,
          generateImages
        })
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedArticle(data.article)
      }
    } catch (error) {
      alert('Error generating article: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle)
    alert('Article copied to clipboard!')
  }

  const downloadArticle = () => {
    const blob = new Blob([generatedArticle], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `article-${Date.now()}.html`
    a.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Blog Article Generator
          </h1>
          <p className="text-xl text-gray-600">
            SEO-optimized articles with product reviews and affiliate links
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Article Configuration</h2>

            {/* Article Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="inline mr-2" size={18} />
                Article Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setArticleType('general')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    articleType === 'general'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  General Article
                </button>
                <button
                  onClick={() => setArticleType('review')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    articleType === 'review'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Product Review
                </button>
              </div>
            </div>

            {/* Topic */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic / Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., Best Wireless Headphones 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Product URL (for reviews) */}
            {articleType === 'review' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Link className="inline mr-2" size={18} />
                  Product URL (Amazon, ML, etc.)
                </label>
                <input
                  type="text"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.com/product/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* SEO Keywords */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Globe className="inline mr-2" size={18} />
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="wireless headphones, bluetooth, noise canceling"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* GEO Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={18} />
                Target Location (GEO)
              </label>
              <input
                type="text"
                value={geoLocation}
                onChange={(e) => setGeoLocation(e.target.value)}
                placeholder="E.g., Brazil, São Paulo, USA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Generate Images */}
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateImages}
                  onChange={(e) => setGenerateImages(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  <Image className="inline mr-2" size={18} />
                  Generate Images with Nano Banana
                </span>
              </label>
            </div>

            {/* Custom Reviews */}
            {articleType === 'review' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Star className="inline mr-2" size={18} />
                  Custom Reviews (optional)
                </label>
                <textarea
                  value={customReviews}
                  onChange={(e) => setCustomReviews(e.target.value)}
                  placeholder="Add custom reviews here, one per line..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Affiliate Links */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Affiliate Links
              </label>
              {affiliateLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <select
                    value={link.platform}
                    onChange={(e) => updateAffiliateLink(index, 'platform', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {affiliatePlatforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateAffiliateLink(index, 'url', e.target.value)}
                    placeholder="Affiliate URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeAffiliateLink(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addAffiliateLink}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                + Add Affiliate Link
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateArticle}
              disabled={loading || !topic}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Generating Article...
                </span>
              ) : (
                'Generate Article'
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Generated Article</h2>
              {generatedArticle && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadArticle}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>

            {!generatedArticle && !loading && (
              <div className="text-center py-20 text-gray-400">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your generated article will appear here</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your article...</p>
              </div>
            )}

            {generatedArticle && (
              <div className="prose max-w-none">
                <div
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatedArticle }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <CheckCircle className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-bold mb-2">SEO Optimized</h3>
            <p className="text-gray-600">Articles optimized for search engines with proper keyword placement and meta tags</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <MapPin className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-bold mb-2">GEO Targeting</h3>
            <p className="text-gray-600">Content tailored for specific geographic locations and regional preferences</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Link className="text-purple-600 mb-3" size={32} />
            <h3 className="text-lg font-bold mb-2">Affiliate Ready</h3>
            <p className="text-gray-600">Seamlessly integrate affiliate links from multiple platforms</p>
          </div>
        </div>
      </div>
    </main>
  )
}
