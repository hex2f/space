const nextMDX = require('@next/mdx')

const withMDX = nextMDX({
  // By default only the .mdx extension is supported.
  extension: /\.mdx?$/,
  options: {/* providerImportSource: …, otherOptions… */}
})


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos', 'xqpdfxsmgygtrgrdnizu.supabase.co'],
  }
}

module.exports =  withMDX({
  ...nextConfig,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
})
