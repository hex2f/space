import type { NextPage } from 'next'
import Head from 'next/head'
import fs from 'fs/promises'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useMemo } from 'react'

export interface Post {
  id: string
  title: string
  published: number
}

const Index: NextPage<{ postGroups: Record<string, Post[]> }> = ({ postGroups }) => {
  const keys = useMemo(() => Object.keys(postGroups).filter(x => x !== 'pinned').sort((a,b) => Number(b) - Number(a)), [postGroups])
  return (
    <div>
      <Head>
        <title>{"leah's blog"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex md:flex-row flex-col">
          <h1 className={'text-3xl'}>leah&apos;s blog</h1>
          <div className={'md:ml-6 flex gap-4 text-gray-700 dark:text-gray-300 mt-2'}>
            <span className='text-gray-300 md:inline hidden'>—</span>
            <Link className={'hover:text-blue-500'} href="/">space</Link>
            <a className={'hover:text-blue-500'} href="https://github.com/leahlundqvist">github</a>
            <a className={'hover:text-blue-500'} href="https://www.linkedin.com/in/leahlundqvist/">linkedin</a>
          </div>
        </div>
        <div className={'mt-8'}>
          <div className={'mt-4 pb-4 border-b border-b-gray-100 dark:border-b-gray-800'}>
            <h2 className="text-lg mb-1">📌 Pinned</h2>
            {postGroups.pinned.length > 0 && postGroups.pinned.map(post => (
              <Link href={`/blog/${post.id}`} key={post.id}>
                <span className="cursor-pointer hover:text-blue-500 block">
                  <span className='text-gray-500 mr-4'>{new Date(post.published).toLocaleDateString()}</span>
                    <span>{post.title}</span>
                </span>
              </Link>
            ))}
          </div>
          {keys.map(key => (
            <div key={key} className={'mt-4'}>
              <h2 className="text-lg mb-1">{key}</h2>
              {postGroups[key].map(post => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                  <span className="cursor-pointer hover:text-blue-500 block">
                    <span className='text-gray-500 mr-4'>{new Date(post.published).toLocaleDateString()}</span>
                    <span>{post.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const postFiles = (await fs.readdir('./pages/blog')).filter(dir => dir.endsWith('.mdx'))
  const postGroups: Record<string, Post[]> = {pinned:[]}
  const pinnedJson = JSON.parse(await fs.readFile('./pages/blog/pinned.json', 'utf-8'))
  for (const fileName of postFiles) {
    try {
      const id = fileName.replace('.mdx', '')
      const post = await import(`../../pages/blog/${fileName}`)
      const metadata = post.getStaticProps().props
      const key = new Date(metadata.published).getFullYear()
      if (!postGroups[key]) postGroups[key] = []
      postGroups[key].push({ ...metadata, id })
      if (pinnedJson.includes(id)) postGroups.pinned.push({ ...metadata, id })
    } catch(e) {
      console.warn(`Failed to load post ${fileName}`, e)
    }
  }
  for (const key in postGroups) {
    postGroups[key] = postGroups[key].sort((a, b) => b.published - a.published)
  }

  return {
    props: { postGroups }
  }
}

export default Index
