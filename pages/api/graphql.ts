import { ApolloServer, gql } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";

// Define your schema
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Define your resolvers
const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

// Create Apollo Server instance
const apolloServer = new ApolloServer({ typeDefs, resolvers });

// Disable bodyParser to allow Apollo Server to handle requests
export const config = {
  api: {
    bodyParser: false,
  },
};

// Start Apollo Server
const startServer = apolloServer.start();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }

  await startServer;
  return apolloServer.createHandler({ path: "/api/graphql" })(req, res);
};
