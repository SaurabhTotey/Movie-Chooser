import Image from "next/image";
import { FC, ReactNode } from "react";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/MovieCard.module.css";

interface MovieCardPropType {
	movie: MovieApiMovieInformation;
	children?: ReactNode;
}

// TOOD: make this a collapsible section that is expanded by default
const MovieCard: FC<MovieCardPropType> = ({ movie, children }) => {
	return (
		<div className={style["movieCard"]}>
			<h3 className={style["movieCardTitle"]}>{movie.title}</h3>
			<div className={style["movieCardImageContainerContainer"]}>
				{movie.posterPath && (
					<div className={style["movieCardImageContainer"]}>
						<Image
							alt={`Poster for ${movie.title}.`}
							height={750}
							layout="responsive"
							src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
							width={500}
						/>
					</div>
				)}
			</div>
			<div className={style["movieCardInformationContainer"]}>
				<p>{movie.summary}</p>
				{movie.release && <p>Release: {new Intl.DateTimeFormat("en-US").format(new Date(movie.release))}</p>}
			</div>
			{children && <hr />}
			{children}
		</div>
	);
};
export default MovieCard;
