import { ToWatchEntry } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../helpers/GetPrismaClient";
import { getMovieInformationFor, MovieApiMovieInformation } from "../../../helpers/MovieApiManager";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | MovieApiMovieInformation>) {
	// Validate request.
	if (!req.body.userIds) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Get the movie lists of all users specified in the request.
	const movieLists: ToWatchEntry[][] = await Promise.all(
		req.body.userIds.map(
			async (userId: number) =>
				await prisma.user
					.findUnique({
						where: {
							id: userId,
						},
					})
					.ToWatchEntry(),
		),
	);

	// Ensure that a movie can be chosen from the given users.
	const movieListWeightSums = movieLists.map((movieList) =>
		movieList.reduce((sum, currentEntry) => sum + currentEntry.weight, 0),
	);
	const usableMovieListIndices = Array.from(Array(movieLists.length).keys()).filter((i) => movieListWeightSums[i] > 0);
	if (usableMovieListIndices.length == 0) {
		res.status(400).json("There are no movies to select amongst the given users.");
		return;
	}

	// Choose a movie by first selecting a usable movie list and then selecting a movie from the movie list.
	const movieListIndexToUse = usableMovieListIndices[Math.floor(Math.random() * usableMovieListIndices.length)];
	const movieListToUse = movieLists[movieListIndexToUse];
	const movieListToUseTotalWeight = movieListWeightSums[movieListIndexToUse];
	let selectionValue = Math.random() * movieListToUseTotalWeight;
	let selectedMovie = null;
	for (let toWatchEntry of movieListToUse) {
		selectionValue -= toWatchEntry.weight;
		if (selectionValue <= 0) {
			selectedMovie = toWatchEntry.movieId;
			break;
		}
	}

	// Give the movie information for the selected movie.
	res.status(200).json(await getMovieInformationFor(selectedMovie!));
}
