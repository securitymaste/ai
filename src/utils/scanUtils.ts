
// Generate port scan results like Nmap would produce
export const generatePortScanResults = (host: string) => {
  // Use the hostname to generate a deterministic set of results
  const hostSeed = hashString(host);
  const rand = seedRandom(hostSeed);
  
  // Common ports with their services
  const commonPorts = [
    { port: 21, service: "ftp", defaultVersion: "vsftpd 3.0.3" },
    { port: 22, service: "ssh", defaultVersion: "OpenSSH 8.2p1" },
    { port: 23, service: "telnet", defaultVersion: "Linux telnetd" },
    { port: 25, service: "smtp", defaultVersion: "Postfix smtpd" },
    { port: 53, service: "domain", defaultVersion: "ISC BIND 9.11.5" },
    { port: 80, service: "http", defaultVersion: "Apache httpd 2.4.41" },
    { port: 110, service: "pop3", defaultVersion: "Dovecot pop3d" },
    { port: 111, service: "rpcbind", defaultVersion: "2-4" },
    { port: 135, service: "msrpc", defaultVersion: "Microsoft Windows RPC" },
    { port: 139, service: "netbios-ssn", defaultVersion: "Samba smbd" },
    { port: 143, service: "imap", defaultVersion: "Dovecot imapd" },
    { port: 443, service: "https", defaultVersion: "nginx 1.18.0" },
    { port: 445, service: "microsoft-ds", defaultVersion: "Samba smbd" },
    { port: 993, service: "imaps", defaultVersion: "Dovecot imapd" },
    { port: 995, service: "pop3s", defaultVersion: "Dovecot pop3d" },
    { port: 1433, service: "ms-sql-s", defaultVersion: "Microsoft SQL Server 2019" },
    { port: 1521, service: "oracle", defaultVersion: "Oracle Database 19c" },
    { port: 3306, service: "mysql", defaultVersion: "MySQL 5.7.32" },
    { port: 3389, service: "ms-wbt-server", defaultVersion: "Microsoft Terminal Services" },
    { port: 5432, service: "postgresql", defaultVersion: "PostgreSQL 12.4" },
    { port: 5900, service: "vnc", defaultVersion: "VNC Server 4.1.1" },
    { port: 6379, service: "redis", defaultVersion: "Redis 6.0.9" },
    { port: 8080, service: "http-proxy", defaultVersion: "Apache Tomcat 9.0.37" },
    { port: 8443, service: "https-alt", defaultVersion: "Apache Tomcat 9.0.37" },
    { port: 9000, service: "cslistener", defaultVersion: "SonarQube" },
    { port: 9092, service: "XmlIpcRegSvc", defaultVersion: "Kafka" },
    { port: 9200, service: "wap-wsp", defaultVersion: "Elasticsearch 7.9.0" },
    { port: 27017, service: "mongod", defaultVersion: "MongoDB 4.4.1" }
  ];
  
  // Determine which ports to show as open based on target hostname
  const results = [];
  
  // Always include 80 and 443 for web applications
  results.push({
    port: 80,
    service: "http",
    state: "open",
    version: "Apache httpd 2.4.41"
  });
  
  results.push({
    port: 443,
    service: "https",
    state: "open",
    version: "nginx 1.18.0"
  });
  
  // Add SSH most of the time
  if (rand() < 0.9) {
    results.push({
      port: 22,
      service: "ssh",
      state: "open",
      version: "OpenSSH 8.2p1" + (rand() < 0.3 ? " Ubuntu Linux" : "")
    });
  }
  
  // Add between 5-10 more random ports
  const additionalPorts = Math.floor(rand() * 6) + 5;
  const shuffledPorts = [...commonPorts].sort(() => rand() - 0.5);
  
  for (let i = 0; i < additionalPorts && i < shuffledPorts.length; i++) {
    const port = shuffledPorts[i];
    
    // Skip ports we've already added
    if ([80, 443, 22].includes(port.port)) {
      continue;
    }
    
    // Determine if port is open, filtered, or closed
    let state;
    const stateRandom = rand();
    if (stateRandom < 0.7) state = "open";
    else if (stateRandom < 0.9) state = "filtered";
    else state = "closed";
    
    // For closed ports, continue to next port
    if (state === "closed") continue;
    
    // Add version variations
    let version = port.defaultVersion;
    // Sometimes add a different version number
    if (rand() < 0.4) {
      const versionNumber = Math.floor(rand() * 10) + 1;
      version = version.replace(/\d+\.\d+\.\d+/, `${versionNumber}.${Math.floor(rand() * 10)}.${Math.floor(rand() * 20)}`);
    }
    
    results.push({
      port: port.port,
      service: port.service,
      state,
      version
    });
  }
  
  // Sort by port number
  return results.sort((a, b) => a.port - b.port);
};

// Generate security headers assessment
export const generateSecurityHeadersResults = () => {
  const headers = [
    {
      name: "Content-Security-Policy",
      present: Math.random() > 0.5,
      value: "default-src 'self'; script-src 'self' https://trusted-cdn.com",
      description: "Helps prevent Cross-Site-Scripting (XSS) and data injection attacks",
      recommendation: "Implement a strict Content-Security-Policy header"
    },
    {
      name: "X-XSS-Protection",
      present: Math.random() > 0.3,
      value: "1; mode=block",
      description: "Stops pages from loading when browsers detect reflected XSS attacks",
      recommendation: "Enable X-XSS-Protection with mode=block"
    },
    {
      name: "X-Frame-Options",
      present: Math.random() > 0.4,
      value: "SAMEORIGIN",
      description: "Protects against clickjacking attacks",
      recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN"
    },
    {
      name: "X-Content-Type-Options",
      present: Math.random() > 0.5,
      value: "nosniff",
      description: "Prevents browsers from interpreting files as a different MIME type",
      recommendation: "Set X-Content-Type-Options to nosniff"
    },
    {
      name: "Strict-Transport-Security",
      present: Math.random() > 0.6,
      value: "max-age=31536000; includeSubDomains",
      description: "Enforces secure (HTTPS) connections to the server",
      recommendation: "Implement HSTS with a long max-age"
    },
    {
      name: "Referrer-Policy",
      present: Math.random() > 0.7,
      value: "strict-origin-when-cross-origin",
      description: "Controls how much referrer information is sent with requests",
      recommendation: "Set a restrictive Referrer-Policy"
    },
    {
      name: "Permissions-Policy",
      present: Math.random() > 0.8,
      value: "camera=(), microphone=(), geolocation=()",
      description: "Controls which browser features can be used on the page",
      recommendation: "Implement a Permissions-Policy to restrict unnecessary features"
    },
    {
      name: "X-Permitted-Cross-Domain-Policies",
      present: Math.random() > 0.75,
      value: "none",
      description: "Controls which cross-domain policies the browser should respect",
      recommendation: "Set X-Permitted-Cross-Domain-Policies to none"
    },
    {
      name: "Access-Control-Allow-Origin",
      present: Math.random() > 0.6,
      value: "*",
      description: "Specifies which domains can access your API (CORS)",
      recommendation: "Specify exact domains instead of using wildcard *"
    },
    {
      name: "Cache-Control",
      present: Math.random() > 0.4,
      value: "no-store, max-age=0",
      description: "Controls how the page is cached by browsers and proxies",
      recommendation: "Use no-store for sensitive information"
    },
    {
      name: "Clear-Site-Data",
      present: Math.random() > 0.9,
      value: "\"cache\", \"cookies\", \"storage\"",
      description: "Clears browsing data (cookies, storage, etc.) associated with the site",
      recommendation: "Use on logout endpoints to clear sensitive data"
    },
    {
      name: "Cross-Origin-Embedder-Policy",
      present: Math.random() > 0.85,
      value: "require-corp",
      description: "Controls which resources can be loaded from other origins",
      recommendation: "Implement COEP for stronger isolation"
    },
    {
      name: "Cross-Origin-Opener-Policy",
      present: Math.random() > 0.85,
      value: "same-origin",
      description: "Controls how a document interacts with cross-origin windows",
      recommendation: "Implement COOP for stronger isolation"
    },
    {
      name: "Cross-Origin-Resource-Policy",
      present: Math.random() > 0.8,
      value: "same-origin",
      description: "Controls which websites can include your resources",
      recommendation: "Implement CORP for stronger isolation"
    }
  ];
  
  // Add random success/fail status for each header
  return headers;
};

// Generate SQL injection payloads that were successful
export const generateSuccessfulPayloads = () => {
  const possiblePayloads = [
    "' OR '1'='1", 
    "' OR 1=1 -- -", 
    "' UNION SELECT 1,2,3--+",
    "' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(VERSION(),FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.TABLES GROUP BY x)a) -- -",
    ",(select * from (select(sleep(5)))a)",
    "'; DROP TABLE users; --",
    "' UNION SELECT username,password,1 FROM users--",
    "admin' --",
    "' OR ''='",
    "1' ORDER BY 3--+",
    "' OR 'x'='x",
    "1-false",
    "1-true",
    "' AND MID(VERSION(),1,1) = '5';",
    "';WAITFOR DELAY '0:0:30'--",
    "' AND id IS NULL; --",
    "1 AND (SELECT * FROM Users) = 1",
    "' UNION SELECT sum(columnname) from tablename --"
  ];
  
  // Select 2-4 random payloads
  const payloadCount = 2 + Math.floor(Math.random() * 3);
  const selectedPayloads = [];
  
  for (let i = 0; i < payloadCount; i++) {
    const randomIndex = Math.floor(Math.random() * possiblePayloads.length);
    selectedPayloads.push(possiblePayloads[randomIndex]);
    // Remove the selected payload to avoid duplicates
    possiblePayloads.splice(randomIndex, 1);
  }
  
  return selectedPayloads;
};

// Ensure consistent results for the same URL
const urlResultsCache = new Map();

export const getCachedResults = (url: string, scanType: string) => {
  const cacheKey = `${url}-${scanType}`;
  if (urlResultsCache.has(cacheKey)) {
    return urlResultsCache.get(cacheKey);
  }
  return null;
};

export const cacheResults = (url: string, scanType: string, results: any) => {
  const cacheKey = `${url}-${scanType}`;
  urlResultsCache.set(cacheKey, results);
};

// Helper functions for deterministic results
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function seedRandom(seed: number) {
  // Simple seeded random function
  let state = Math.abs(seed);
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}
