import { MongoClient, MongoClientOptions } from 'mongodb';

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cachedClient) {
    return { client: cachedClient };
  }

  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  };

  // Remove TLS from URI and handle it via options
  const cleanUri = uri.replace(/&tls=true/gi, '').replace(/\?tls=true&?/gi, '?');
  
  const client = new MongoClient(cleanUri, options);
  
  try {
    await client.connect();
    cachedClient = client;
    return { client };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB. Check your connection string and network.');
  }
}
