import { NextApiRequest, NextApiResponse } from 'next'

import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', process.env.SUPABASE_ADMIN as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    res.status(401).send('Unauthorized')
    return
  }

  const city = req.headers['city']
  const country = req.headers['country']
  
  console.log({ city, country })

  await supabase
    .from('location')
    .delete()
    .neq('id', 0)

  await supabase
    .from('location')
    .insert({ city, country })

  res.send('ok')
}