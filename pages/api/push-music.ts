import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', process.env.SUPABASE_ADMIN as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    res.status(401).send('Unauthorized')
    return
  }

  const artist = req.headers['artist']
  const album = req.headers['album']
  const title = req.headers['title']
  
  console.log({ artist, album, title })

  //sha256 of artist + album + title
  const cover_hash = crypto.createHash('sha256').update(`${artist}${album}${title}`).digest('hex')

  try {
    // wait for the cover to be uploaded
    setTimeout(async () => {
      let { data, error } = await supabase
        .from('music')
        .select('cover_hash')
        .order('id', { ascending: false })
        .limit(1)
      
      if (data?.[0].cover_hash === cover_hash) {
        return
      }

      await supabase
        .from('music')
        .insert({ cover_hash, artist, album, title })
    }, 5000)

    const { data } = await supabase
      .storage
      .from('music')
      .list(cover_hash)

    if (data?.length ?? 0 > 0) {
      res.send('ok')
    } else {
      res.send(cover_hash)
    }
  } catch (e) {
    console.log('error', e)
    res.send(cover_hash)
  }
}