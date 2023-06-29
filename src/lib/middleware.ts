import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
const corsOptions: any = Cors({
  origin: "*", // Replace * with the specific origin(s) allowed to access your API
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify the HTTP methods allowed
  allowedHeaders: ["Content-Type", "Authorization"], // Specify the allowed headers
});

export const runMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise<void>((resolve, reject) => {
    corsOptions(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
