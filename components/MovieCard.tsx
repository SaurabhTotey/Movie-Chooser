import Image from "next/image";
import { FC, ReactNode } from "react";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/MovieCard.module.css";
import CollapsibleSection from "./CollapsibleSection";

interface MovieCardPropType {
	movie: MovieApiMovieInformation;
	children?: ReactNode;
}

const MovieCard: FC<MovieCardPropType> = ({ movie, children }) => {
	return (
		<CollapsibleSection isExpandedToBegin={true} title={movie.title} titleHeadingLevel={3}>
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
		</CollapsibleSection>
	);
};
export default MovieCard;
