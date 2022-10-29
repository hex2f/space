import {Writable} from 'stream';

import formidable from 'formidable';
import {NextApiRequest, NextApiResponse, PageConfig} from 'next';

import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xqpdfxsmgygtrgrdnizu.supabase.co', process.env.SUPABASE_ADMIN as string)

const formidableConfig = {
    keepExtensions: true,
    maxFileSize: 25_000_000,
    maxFieldsSize: 25_000_000,
    maxFields: 7,
    allowEmptyFiles: false,
    multiples: false,
};

function formidablePromise(
    req: NextApiRequest,
    opts?: Parameters<typeof formidable>[0]
): Promise<{fields: formidable.Fields; files: formidable.Files}> {
    return new Promise((accept, reject) => {
        const form = formidable(opts);

        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            return accept({fields, files});
        });
    });
}

const fileConsumer = <T = unknown>(acc: T[]) => {
    const writable = new Writable({
        write: (chunk, _enc, next) => {
            acc.push(chunk);
            next();
        },
    });

    return writable;
};

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    res.status(401).send('Unauthorized')
    return
  }

  if (req.method !== 'POST') return res.status(404).end();

  try {
    const chunks: never[] = [];

    const hash = req.query.hash as string;

    const {files} = await formidablePromise(req, {
      ...formidableConfig,
      // consume this, otherwise formidable tries to save the file to disk
      fileWriteStreamHandler: () => fileConsumer(chunks),
    });

    const {file} = files;

    const fileData = Buffer.concat(chunks); // or is it from? I always mix these up

    const {data, error} = await supabase.storage
      .from('music')
      .upload(hash+'/cover.png', fileData, {
        contentType: 'image/png',
        upsert: true,
      })
    
    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({error: 'Internal Server Error'});
  }
}

export const config: PageConfig = {
    api: {
        bodyParser: false,
    },
};

export default handler;