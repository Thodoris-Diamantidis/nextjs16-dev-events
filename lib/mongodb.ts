import "server-only";

import mongoose, { type Mongoose } from "mongoose";

function getMongoDbUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // Fail fast in environments where the DB is required.
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  return uri;
}

const MONGODB_URI = getMongoDbUri();

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// In dev, Next.js hot-reloads modules. We cache the connection on `globalThis` to
// prevent creating a new connection on every reload.
type GlobalWithMongoose = typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const globalWithMongoose = globalThis as GlobalWithMongoose;

const cached: MongooseCache =
  globalWithMongoose.__mongooseCache ??
  (globalWithMongoose.__mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // `mongoose.connect()` returns the Mongoose instance once connected.
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // If the connection attempt failed, reset the promise so a subsequent call can retry.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
