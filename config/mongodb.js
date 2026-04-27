import { MongoClient, ServerApiVersion } from 'mongodb'

let client

/**
 * Atlas / MongoDB তে কানেক্ট করে (Stable API v1)।
 * @param {string} uri — সম্পূর্ণ connection string (.env এর MONGODB_URI)
 */
export async function connectMongo(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is missing — add it to .env')
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  await client.connect()
  await client.db('admin').command({ ping: 1 })
  console.log('Pinged your deployment. You successfully connected to MongoDB!')

  return client
}

export function getMongoClient() {
  if (!client) {
    throw new Error('MongoClient is not connected yet — call connectMongo first')
  }
  return client
}

export async function closeMongo() {
  if (client) {
    await client.close()
    client = undefined
    console.log('MongoDB connection closed')
  }
}
