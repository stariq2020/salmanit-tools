const dns = require('dns').promises;

// Global DNS resolvers to check propagation
const RESOLVERS = [
  { name: 'Google (US)',        ip: '8.8.8.8',         location: '🇺🇸 United States' },
  { name: 'Google Secondary',  ip: '8.8.4.4',         location: '🇺🇸 United States' },
  { name: 'Cloudflare (US)',    ip: '1.1.1.1',         location: '🇺🇸 United States' },
  { name: 'Cloudflare 2',      ip: '1.0.0.1',         location: '🇺🇸 United States' },
  { name: 'OpenDNS',           ip: '208.67.222.222',  location: '🇺🇸 United States' },
  { name: 'Quad9',             ip: '9.9.9.9',         location: '🇺🇸 United States' },
  { name: 'Verisign',         ip: '64.6.64.6',       location: '🇺🇸 United States' },
  { name: 'Comodo',            ip: '8.26.56.26',      location: '🇺🇸 United States' },
  { name: 'Level3',            ip: '209.244.0.3',     location: '🇺🇸 United States' },
  { name: 'DNS.Watch (DE)',    ip: '84.200.69.80',    location: '🇩🇪 Germany' },
  { name: 'Freenom (EU)',      ip: '80.80.80.80',     location: '🇳🇱 Netherlands' },
  { name: 'OpenNIC (FR)',      ip: '193.183.98.66',   location: '🇫🇷 France' },
  { name: 'Yandex (RU)',       ip: '77.88.8.8',       location: '🇷🇺 Russia' },
  { name: 'Neustar (US)',      ip: '156.154.70.1',    location: '🇺🇸 United States' },
  { name: 'SafeDNS (US)',      ip: '195.46.39.39',    location: '🇺🇸 United States' },
  { name: 'Hurricane Electric',ip: '74.82.42.42',     location: '🇺🇸 United States' },
];

const TYPE_MAP = {
  A:     'resolve4',
  AAAA:  'resolve6',
  MX:    'resolveMx',
  TXT:   'resolveTxt',
  NS:    'resolveNs',
  CNAME: 'resolveCname',
  SOA:   'resolveSoa',
};

async function queryResolver(resolver, domain, type) {
  const start = Date.now();
  const r = new dns.Resolver();
  r.setServers([resolver.ip]);

  try {
    const method = TYPE_MAP[type];
    if (!method) throw new Error('Unsupported type');

    let records = await r[method](domain);
    const ms = Date.now() - start;

    // Normalise output
    let values = [];
    if (type === 'MX') {
      values = records.map(r => `${r.priority} ${r.exchange}`);
    } else if (type === 'TXT') {
      values = records.map(r => Array.isArray(r) ? r.join('') : r);
    } else if (type === 'SOA') {
      values = [`${records.nsname} ${records.hostmaster} (serial: ${records.serial})`];
    } else if (Array.isArray(records)) {
      values = records.map(r => String(r));
    } else {
      values = [String(records)];
    }

    return { ...resolver, status: 'ok', values, ms };
  } catch(e) {
    const ms = Date.now() - start;
    const code = e.code || 'UNKNOWN';
    return { ...resolver, status: 'error', error: code === 'ENOTFOUND' ? 'Not found' : code === 'ENODATA' ? 'No records' : code, ms };
  }
}

exports.handler = async function(event) {
  const { domain, type = 'A' } = event.queryStringParameters || {};

  if (!domain) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing domain parameter' }) };
  }

  // Basic validation
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9][a-z0-9\-\.]{0,250}[a-z0-9]$/i.test(cleanDomain)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid domain name' }) };
  }

  const recordType = type.toUpperCase();
  if (!TYPE_MAP[recordType]) {
    return { statusCode: 400, body: JSON.stringify({ error: `Unsupported record type: ${type}` }) };
  }

  // Query all resolvers in parallel
  const results = await Promise.all(
    RESOLVERS.map(r => queryResolver(r, cleanDomain, recordType))
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ domain: cleanDomain, type: recordType, results })
  };
};