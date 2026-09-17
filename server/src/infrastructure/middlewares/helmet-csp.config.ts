import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';

const isProduction = () => process.env.NODE_ENV === 'production';

const cspDirectives = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

export function helmetCspConfig(): HelmetOptions {
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: cspDirectives,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProduction()
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: 'deny' },
    crossOriginEmbedderPolicy: false,
    originAgentCluster: true,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    xPoweredBy: false,
  };
}

export function helmetMiddleware() {
  return helmet(helmetCspConfig());
}
