import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

export async function spellCheck(text: string): Promise<string> {
  try {
    // Use ChatGPT to perform spell checking and grammar correction
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional proofreader. Fix any spelling, grammar, and punctuation errors in the provided text. Maintain the original HTML structure and formatting. Return ONLY the corrected text without any explanations.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    return completion.choices[0].message.content || text
  } catch (error) {
    console.error('Spell check error:', error)
    return text // Return original text if spell check fails
  }
}

// Alternative: Simple spell check without API (basic implementation)
export function basicSpellCheck(text: string): string {
  // Common spelling corrections
  const corrections: Record<string, string> = {
    'teh': 'the',
    'adn': 'and',
    'recieve': 'receive',
    'occured': 'occurred',
    'seperate': 'separate',
    'definately': 'definitely',
    'goverment': 'government',
    'recomend': 'recommend',
    'accomodate': 'accommodate',
    'untill': 'until',
    'wich': 'which',
    'wiht': 'with',
  }

  let correctedText = text

  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    correctedText = correctedText.replace(regex, correct)
  }

  return correctedText
}
