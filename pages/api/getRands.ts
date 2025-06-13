import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  rands: number[];
  message: string;
};

const anu = {
  endpoint: 'https://api.quantumnumbers.anu.edu.au',
  params: {
    type: 'uint8',
    length: 1024,
  },
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_QRNG_API_KEY,
  },
};

const messages = {
  quantum: 'quantum random number set acquired',
  pseudo: 'pseudo random number set acquired',
};

// Generate random bytes using Web Crypto API
const generateRandomBytes = (length: number): number[] => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  /*if (process.env.NODE_ENV === 'development') {
    res.status(200).json({
      rands: generateRandomBytes(1024),
      message: messages.pseudo,
    });
    return;
  }*/
  
  try {
    const qrnd: {
      data: {
        type: string;
        length: number;
        data: number[];
        success: boolean;
      };
    } = await axios.get(anu.endpoint, {
      headers: anu.headers,
      params: anu.params,
      timeout: 2000,
    });
    
    res.status(200).json({
      rands: qrnd.data.data,
      message: messages.quantum,
    });
  } catch (e: any) {
    console.log(e);
    res.status(200).json({
      rands: generateRandomBytes(1024),
      message: `error: ${e.message}. ${messages.pseudo}`,
    });
  }
}
