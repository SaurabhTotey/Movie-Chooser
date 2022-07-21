import Image from "next/image";
import { FC } from "react";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/MovieCard.module.css";

interface MovieCardPropType {
	movie: MovieApiMovieInformation;
}

const MovieCard: FC<MovieCardPropType> = ({ movie }) => {
	return (
		<div className={style["movieCard"]}>
			<h3>{movie.title}</h3>
			{movie.posterPath && (
				<Image
					src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
					alt={`Poster for ${movie.title}.`}
					width={500}
					height={750}
				/>
			)}
			<p>{movie.summary}</p>
			<p>{movie.release}</p>
		</div>
	);
};
export default MovieCard;
