import type { NextPage } from 'next'
import Image from 'next/image'
import Head from 'next/head'

import * as blog from './blog'
import Link from 'next/link'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface Music {
  title: string,
  artist: string,
  album: string,
  cover_url: string
}

function CurrentPlaying({music}: {
  music: Music
}) {
  const [supabase] = useState(createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcGRmeHNtZ3lndHJncmRuaXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjY5ODUwNDAsImV4cCI6MTk4MjU2MTA0MH0.aorF0EMSHjN1nXtBrhgK1-QAILV7XXW-HSBF0OA_g6Y'))

  const [playingStack, setPlayingStack] = useState<typeof music[]>([music])

  useEffect(() => {
    const channel = supabase
      .channel('music')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'music' }, async (payload: { new: typeof music }) => {
        const { data } = await supabase
          .storage
          .from('music')
          // @ts-ignore
          .getPublicUrl(payload.new.cover_hash + '/cover.png')
        setPlayingStack(playing => [...playing, {
          ...payload.new,
          cover_url: data.publicUrl
        }].slice(-3))
      })
      .subscribe()
      
    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  return (
    <div className={'relative aspect-square flex-1 h-full bg-slate-50'}>
      {playingStack.length > 0 && (
        playingStack.sort((a,b) => playingStack.indexOf(a) - playingStack.indexOf(b)).map((playing, i) => (
          <FadingInAlbumCover key={playing.title} i={i} playing={playing} />
        ))
      )}
    </div>
  )
}

function PopBar({ small, large }: { small: string, large: string }) {
  return (
    <div className='absolute pointer-events-none bottom-0 left-0 pt-3.5 w-full px-2.5 py-2 text-white bg-slate-700 bg-opacity-80 flex items-start justify-end flex-col translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-100'>
    <span className="text-sm transition-all delay-[60ms] duration-100 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">{small}</span>
    <span className="text-base transition-all delay-[50ms] duration-100 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 font-bold">{large}</span>
  </div>
  )
}

function FadingInAlbumCover({ playing, i }: { playing: Music, i: number }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`absolute top-0 left-0 aspect-square flex-1 h-full w-full translate-opacity duration-500 overflow-hidden ${loaded ? 'opacity-100' : 'opacity-0'} group`} style={{ zIndex: i }}>
      <Image alt={`${playing.title} by ${playing.artist}`} className={`z-0 rounded h-full w-full duration-500 transition-all ${loaded ? 'scale-100 blur-0' : 'scale-110 blur-sm'}`} width={600} height={600} src={playing.cover_url} onLoadingComplete={() => setLoaded(true)} />
      <PopBar small={playing.artist} large={playing.title} />
    </div>
  )
}


function Location({ location }: { location: { city: string, country: string } }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="aspect-square flex-1 h-full relative overflow-hidden group bg-slate-50">
      <Image alt={'map'} className={`h-full z-0 rounded ${loaded ? 'scale-100 opacity-100 blur-0' : 'scale-110 opacity-0 blur-md'} transform-gpu transition duration-700`} width={600} height={600} src={'/api/map-image'} onLoadingComplete={() => setLoaded(true)} />
      {/* <span className="absolute top-1/2 left-1/2 text-3xl -translate-x-1/2 -translate-y-1/2" style={{ filter: 'drop-shadow(0 0 0.3rem rgba(0,0,0,0.2))' }}>👩🏼‍💻</span> */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full h-6 w-6 shadow ${loaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} transform-gpu transition duration-700`}>
        <div className={`absolute top-1 left-1 bg-[#4E80EE] h-4 w-4 rounded-full ${loaded ? 'scale-100' : 'scale-0'} transition delay-300 duration-500`}></div>
      </div>
      <PopBar small={location.country} large={location.city} />
    </div>
  )
}

function ImageOfTheDay({ image }: { image: { url: string, title: string, description: string } }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`w-full object-fill relative group bg-slate-50`} style={{ aspectRatio: '3/5' }}>
      <Image alt={'image of the day'} className={`h-full rounded ${loaded ? 'scale-100 opacity-100 blur-0' : 'scale-110 opacity-0 blur-md'} delay-300 transform-gpu transition duration-700`} width={900} height={1500} src={image.url} layout='fill' objectFit='fill' onLoadingComplete={() => setLoaded(true)} />
      <PopBar small={image.description} large={''} />
    </div>
  )
}

const Index: NextPage<{
  recentPosts: blog.Post[],
  location: { city: string, country: string },
  music: {
    title: string,
    artist: string,
    album: string,
    cover_url: string
  }
}> = ({ recentPosts, location, music }) => {
  return (
    <div>
      <Head>
        <title>{"leah's space"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex md:flex-row flex-col">
          <h1 className={'text-3xl'}>leah&apos;s space</h1>
          <div className={'md:ml-6 flex gap-4 text-gray-700 dark:text-gray-300 mt-2'}>
            <span className='text-gray-300 md:inline hidden'>—</span>
            <Link className={'hover:text-blue-500'} href="/blog">blog</Link>
            <a className={'hover:text-blue-500'} href="https://github.com/leahlundqvist">github</a>
            <a className={'hover:text-blue-500'} href="https://www.linkedin.com/in/leahlundqvist/">linkedin</a>
          </div>
        </div>
        <div className='flex gap-2 mt-4'>
          <div className={'flex-[4]'}>
            <ImageOfTheDay image={{ url:'https://picsum.photos/900/1500', title: 'Image of the day', description: 'This is a random image at the moment. The idea is to start taking lots of images again and slapping them on here :)'}} />
          </div>

          <div className='flex-[5] flex flex-col gap-4'>
            <div className={'flex-1 px-2 py-1'}>
              <h2 className="text-lg mb-1">📝 recent blog posts</h2>
              {recentPosts.map(post => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                  <span className="cursor-pointer hover:text-blue-500 block">
                    <span className='text-gray-500 mr-4'>{new Date(post.published).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</span>
                    <span>{post.title}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className={'flex-0 flex gap-2'}>
              <Location location={location} />
              <CurrentPlaying music={music} />
            </div>
          </div>
        </div>
        <div className={'mt-8'}>
          {/* <div className={'mt-4 pb-4 border-b border-b-gray-100 dark:border-b-gray-800'}>
            <h2 className="text-lg mb-1">💫 fwens</h2>
          </div> */}
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  const supabase = createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', process.env.SUPABASE_ADMIN as string)

  const blogProps = await blog.getStaticProps()
  const recentPosts = Object.values(blogProps.props.postGroups).flat()
  const music = (await supabase.from('music').select('*').order('id', { ascending: false }).limit(1)).data?.[0]
  const albumCover = (await supabase.storage.from('music').getPublicUrl(music?.cover_hash + '/cover.png')).data.publicUrl
  const location = (await supabase.from('location').select('*')).data?.[0]
  console.log(location)
  const uniquePosts = recentPosts.filter((post, index) => recentPosts.findIndex(p => p.id === post.id) === index)
  return {
    props: {
      recentPosts: uniquePosts.slice(0, 10),
      location,
      music: {
        ...music,
        cover_url: albumCover
      }
    }
  }
}

export default Index
