import axios from "axios";

const tmdbApiKey = process.env.TMDB_KEY;

export class MovieApiMovieInformation {
	id: number;
	title: string;
	summary: string;
	posterPath: string;
	release: string;

	constructor(id: number, title: string, summary: string, posterPath: string, release: string) {
		this.id = id;
		this.title = title;
		this.summary = summary;
		this.posterPath = posterPath;
		this.release = release;
	}
}

// Query TMDB and get the search results in a more parseable format that only contains what we want.
// This has no safeguards in case TMDB fails or returns results in an odd format.
export const searchMovies = async (searchTerm: string) => {
	const response = await axios.get(
		`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&include_adult=true&query=${searchTerm}`,
	);
	return response.data.results.map(
		(result: any) =>
			new MovieApiMovieInformation(result.id, result.title, result.overview, result.poster_path, result.release_date),
	);
};

// TODO:
export const getMovieInformationFor = (id: number) => {};
