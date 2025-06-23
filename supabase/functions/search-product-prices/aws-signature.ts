
// AWS Signature V4 implementation
export const createAWSSignature = async (
  method: string,
  url: string,
  headers: Record<string, string>,
  payload: string,
  region: string = 'us-east-1',
  service: string = 'ProductAdvertisingAPI',
  accessKeyId: string,
  secretAccessKey: string
): Promise<string> => {
  const algorithm = 'AWS4-HMAC-SHA256';
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  
  // Create canonical request
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQuerystring = '';
  
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
    .join('');
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const stringToSign = [
    algorithm,
    timeStamp,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('AWS4' + key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(dateStamp)));
    
    const kRegion = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kDate),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(regionName)));
    
    const kService = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kRegion),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(serviceName)));
    
    const kSigning = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kService),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode('aws4_request')));
    
    return new Uint8Array(kSigning);
  };
  
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await crypto.subtle.importKey(
    'raw',
    signingKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(stringToSign)))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return authorizationHeader;
};
