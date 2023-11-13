import axios from "axios";
import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  rands: number[];
  message: string;
};

const messages = {
  quantum: "quantum random number set acquired",
  pseudo: "pseudo random number set acquired",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (process.env.NODE_ENV === "development") {
    res.status(200).json({
      rands: Array.from(randomBytes(1024).values()),
      message: messages.pseudo,
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
    } = await axios.get("https://api.quantumnumbers.anu.edu.au", {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_QRNG_API_KEY,
      },
      params: {
        length: 1024,
        type: "uint8",
      },
      timeout: 2000,
    });
    res.status(200).json({
      rands: qrnd.data.data,
      message: messages.quantum,
    });
  } catch (e: any) {
    res.status(200).json({
      rands: Array.from(randomBytes(1024).values()),
      message: `error: ${e.message}. ${messages.pseudo}`,
    });
  }
}
