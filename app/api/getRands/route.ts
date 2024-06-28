import axios from 'axios';
import { randomBytes } from 'crypto';

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

export const GET = async () => {
  let rands = Array.from(randomBytes(1024).values());
  let message = messages.pseudo;

  if (process.env.NODE_ENV === 'development') {
    return Response.json({
      rands,
      message,
    });
  }
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

    rands = qrnd.data.data;
    message = messages.quantum;
  } catch (e: any) {
    message = `error: ${e.message}. ${messages.pseudo}`;
  }

  return Response.json({
    rands,
    message,
  });
};
