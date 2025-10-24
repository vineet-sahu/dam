import cors, { CorsOptions } from "cors";

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:5174",
  process.env.FRONTEND_URL || "http://localhost:5173",
];

if (
  process.env.NODE_ENV === "production" &&
  process.env.PRODUCTION_FRONTEND_URL
) {
  allowedOrigins.push(process.env.PRODUCTION_FRONTEND_URL);
}

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
