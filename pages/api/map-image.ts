import jwa from 'jwa'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
const { sign } = jwa('ES256')

const keyId = process.env.APPLE_KEY_ID as string
const teamId = process.env.APPLE_TEAM_ID as string
const privKey = process.env.APPLE_PRIVATE_KEY as string

import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', process.env.SUPABASE_ADMIN as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const location = (await supabase.from('location').select('*')).data?.[0]
  const location_string = `${location?.city ?? "stockholm"}, ${location?.country ?? "sweden"}`

  const params = Object.entries({
    z: 12,
    poi: 0,
    scale: 1,
    teamId, keyId,
    center: location_string,
    t: 'mutedStandard',
    size: '600x600',
    colorScheme: 'light',
  }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')

  const path = `/api/v1/snapshot?${params}`
  const signature = sign(path, privKey)

  const image = await (await fetch(`https://snapshot.apple-mapkit.com${path}&signature=${signature}`)).arrayBuffer()

  res.setHeader('Content-Type', 'image/png')
  res.send(Buffer.from(image))
}