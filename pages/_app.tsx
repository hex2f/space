import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {MDXProvider} from '@mdx-js/react'
import { PropsWithChildren } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'
import Head from 'next/head'

const components = {
  h1: ({children}: PropsWithChildren) => <h1>{children}</h1>,
}

function BlogApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isBlogPost = router.pathname.startsWith('/blog/')
  const isScreenshot = (router.query['screenshot'] as string ?? '').startsWith('true')
  if (isBlogPost) {
    return (
      <MDXProvider components={components}>
        <Head>
          <title>{pageProps.title}</title>
          <meta name="og:title" content={pageProps.title} />
          <meta name="twitter:title" content={pageProps.title} />
          <meta name="twitter:creator" content="@leahlundqvist"></meta>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="og:url" content={`https://blog.leah.link${router.asPath}`} />
          <meta name="og:image" content={`https://blog-og-beige.vercel.app/api/screenshot?page=${encodeURIComponent('https://blog.leah.link'+router.asPath+'?screenshot=true')}`} />
        </Head>
        <div className={`relative flex flex-col ${isScreenshot && 'screenshot'}`}>
          <Link href={'/blog'}>
            <span className="text-gray-400 pointer absolute -top-8 hover:text-blue-500 cursor-pointer">{'../'}</span>
          </Link>
          <h1 className='include-in-screenshot'>{pageProps.title}</h1>
          <Component {...pageProps} />
          <Footer author={pageProps.author} published={pageProps.published} />
        </div>
      </MDXProvider>
    )
  } else {
    return (
      <div className='relative'>
        <Component {...pageProps} />
      </div>
    )
  }
}

export default BlogApp
