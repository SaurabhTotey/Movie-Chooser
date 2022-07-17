import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: rework the query to use prisma if possible: it's just a raw query
// TODO: this is untested
const deleteUnneededMovies = async () => {
	return prisma.$executeRaw`DELETE FROM "public"."Movie" AS movie WHERE NOT EXISTS (SELECT 1 FROM "public"."ToWatchEntry" WHERE "movieId" = movie.id)`;
};
export default deleteUnneededMovies;
