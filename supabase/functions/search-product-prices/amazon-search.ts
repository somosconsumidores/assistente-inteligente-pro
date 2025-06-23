
import { createAWSSignature } from './aws-signature.ts';
import type { PriceResult } from './types.ts';

// Real Amazon PA API search function
export const searchAmazonPA = async (
  productName: string,
  amazonAccessKeyId: string,
  amazonSecretAccessKey: string,
  amazonAssociateTag: string
): Promise<PriceResult[]> => {
  try {
    if (!amazonAccessKeyId || !amazonSecretAccessKey || !amazonAssociateTag) {
      console.log('Amazon PA API credentials not configured');
      return [];
    }

    console.log(`Searching Amazon PA API for: ${productName}`);
    
    const cleanQuery = productName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const requestPayload = {
      Keywords: cleanQuery,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ],
      SearchIndex: 'All',
      ItemCount: 10,
      PartnerTag: amazonAssociateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com.br'
    };

    const payload = JSON.stringify(requestPayload);
    const url = 'https://webservices.amazon.com.br/paapi5/searchitems';
    
    const now = new Date();
    const timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': 'webservices.amazon.com.br',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'X-Amz-Date': timeStamp,
      'Content-Encoding': 'amz-1.0'
    };

    const authorization = await createAWSSignature('POST', url, headers, payload, 'us-east-1', 'ProductAdvertisingAPI', amazonAccessKeyId, amazonSecretAccessKey);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Authorization': authorization
      },
      body: payload
    });

    if (!response.ok) {
      console.error(`Amazon PA API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Amazon PA API error details:', errorText);
      return [];
    }

    const data = await response.json();
    console.log(`Amazon PA API response received`);

    if (!data.SearchResult?.Items || data.SearchResult.Items.length === 0) {
      console.log('No products found on Amazon PA API');
      return [];
    }

    const priceResults: PriceResult[] = [];
    
    for (const item of data.SearchResult.Items) {
      try {
        const title = item.ItemInfo?.Title?.DisplayValue || 'Produto Amazon';
        const offers = item.Offers?.Listings?.[0];
        
        if (!offers?.Price?.Amount) continue;
        
        const price = parseFloat(offers.Price.Amount);
        const currency = offers.Price.Currency || 'BRL';
        const availability = offers.Availability?.Message || '';
        
        // Skip if price is invalid or item is unavailable
        if (price <= 0 || availability.toLowerCase().includes('indisponível')) continue;
        
        // Determine confidence based on availability and reviews
        let confidence: 'high' | 'medium' | 'low' = 'high'; // Amazon data is generally reliable
        
        if (availability.toLowerCase().includes('estoque limitado')) {
          confidence = 'medium';
        }

        priceResults.push({
          price: price,
          currency: currency,
          source: 'amazon-pa',
          store_name: 'Amazon Brasil',
          product_url: item.DetailPageURL || 'https://amazon.com.br',
          confidence,
          last_updated: new Date().toISOString()
        });
      } catch (itemError) {
        console.error('Error processing Amazon item:', itemError);
        continue;
      }
    }

    console.log(`Processed ${priceResults.length} valid price results from Amazon PA API`);
    return priceResults;
  } catch (error) {
    console.error('Error searching Amazon PA API:', error);
    return [];
  }
};
