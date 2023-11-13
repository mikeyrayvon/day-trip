import axios from "axios";
import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  rands: number[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (process.env.NODE_ENV === "development") {
    res.status(200).json({ rands: Array.from(randomBytes(1024).values()) });
  }
  try {
    const qrnd: {
      type: string;
      length: number;
      data: number[];
      success: boolean;
    } = await axios.get("https://api.quantumnumbers.anu.edu.au", {
      headers: {
        "x-api-key": process.env.API_KEY,
      },
      params: {
        length: 1024,
        type: "uint8",
      },
      timeout: 2000,
    });
    res.status(200).json({ rands: qrnd.data });
  } catch (e: any) {
    res.status(200).json({ rands: Array.from(randomBytes(1024).values()) });
  }
}
