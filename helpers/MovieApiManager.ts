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
		`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${searchTerm}`,
	);
	return response.data.results.map(
		(result: any) =>
			new MovieApiMovieInformation(result.id, result.title, result.overview, result.poster_path, result.release_date),
	);
};

// Query TMDB about a specific movie and get its information based on its TMDB ID.
// TODO: this perhaps can be cached in memory so that we don't need a network request for commonly requested movies
export const getMovieInformationFor = async (id: number) => {
	const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}`);
	return new MovieApiMovieInformation(
		response.data.id,
		response.data.title,
		response.data.overview,
		response.data.poster_path,
		response.data.release_date,
	);
};
