import db from "../../db/db.js";

export default {
  Query: {
    //SECTION user geting movies
    getmovies: async (_, __) => {
      try {
        const movies = await db.movie.findMany();
        //return if all OK
        return movies;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
