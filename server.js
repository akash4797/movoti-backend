import { ApolloServer } from "apollo-server-express";
import resolvers from "./graphql/resolvers/index.js";
import typeDefs from "./graphql/typedefs.js";
import express from "express";
import jwt from "jsonwebtoken";
import { contextMiddleware } from "./utils/contextMiddleware.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from "http";

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const server = new ApolloServer({
    schema,
    context: contextMiddleware,
    cache: "bounded",
    // csrfPrevention: true,
    // introspection: false,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.json());

  app.get("/verify", (req, res) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      //NOTE throw error if not valid token
      if (err) return res.status(401).json({ msg: "Unauthorized" });
      //NOTE return valid
      res.status(200).json({ msg: "Authorized", user: decoded });
    });
  });

  httpServer.listen(process.env.PORT, () => {
    console.log(`🚀 Server ready at ${process.env.PORT}`);
  });
}

startServer().catch((e) => {
  console.log(e);
});
