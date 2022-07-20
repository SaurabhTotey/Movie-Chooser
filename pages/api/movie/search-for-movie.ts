import type { NextApiRequest, NextApiResponse } from "next";
import { MovieApiMovieInformation, searchMovies } from "../../../helpers/MovieApiManager";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | MovieApiMovieInformation[]>) {
	// Validate request.
	if (req.method != "GET" || !req.query.searchTerm) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Forward request to the MovieApiManager and return the results.
	try {
		res.status(200).json(await searchMovies(req.query.searchTerm.toString()));
	} catch (e) {
		res.status(500).json("Couldn't query for movies.");
	}
}
