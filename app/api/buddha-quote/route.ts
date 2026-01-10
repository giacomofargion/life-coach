import { NextResponse } from 'next/server';

// Force dynamic rendering - prevents Next.js from caching this route
export const dynamic = 'force-dynamic';

/**
 * Proxy route for Buddha Quotes API
 * Fetches a random quote from https://buddha-api.com/api/random
 * Since CORS is disabled on the external API, we proxy it server-side
 */
export async function GET() {
  try {
    const response = await fetch('https://buddha-api.com/api/random', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add cache-busting to ensure fresh fetch
      cache: 'no-store',
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Buddha Quotes API returned status ${response.status}`);
    }

    const data = await response.json();

    // Normalize various response formats to a consistent structure
    let quote: string;
    let author: string | undefined;

    // Handle different possible response formats
    if (Array.isArray(data)) {
      // If response is an array, take the first item
      const firstItem = data[0];
      if (typeof firstItem === 'string') {
        quote = firstItem;
      } else if (firstItem && typeof firstItem === 'object') {
        quote = firstItem.quote || firstItem.text || firstItem.message || String(firstItem);
        author = firstItem.author || firstItem.source;
      } else {
        throw new Error('Unexpected array format');
      }
    } else if (typeof data === 'string') {
      // If response is a direct string
      quote = data;
    } else if (data && typeof data === 'object') {
      // If response is an object
      quote = data.quote || data.text || data.message || String(data);
      author = data.author || data.source;
    } else {
      throw new Error('Unexpected response format');
    }

    // Validate that we have a quote
    if (!quote || quote.trim().length === 0) {
      throw new Error('Quote is empty');
    }

    return NextResponse.json(
      { quote: quote.trim(), author: author?.trim() },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store', // Fetch fresh quote each time
        },
      }
    );
  } catch (error) {
    // Log error for debugging but return a graceful fallback
    console.error('Error fetching Buddha quote:', error);

    // Return a fallback inspirational message instead of failing
    return NextResponse.json(
      {
        quote: 'Each moment is a choice. What feels right for you now?',
        author: null,
      },
      { status: 200 } // Return 200 so the component doesn't treat it as an error
    );
  }
}
