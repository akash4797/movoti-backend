import users from "./users.js";
import movies from "./movies.js";

export default {
  User: {
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
  Query: {
    ...users.Query,
    ...movies.Query,
  },
  Mutation: {
    ...users.Mutation,
  },
};
