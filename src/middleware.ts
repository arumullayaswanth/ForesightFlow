import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'te', 'ta', 'mr', 'kn', 'ml', 'ur'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|hi|te|ta|mr|kn|ml|ur)/:path*']
};