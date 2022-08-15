import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import getEverythingAsServerSideProp from "../helpers/GetEverythingAsServerSideProp";

const average = (numbers: number[]) => numbers.reduce((sum, current) => sum + current, 0) / numbers.length;

const median = (numbers: number[]) => {
	const sorted = Array.from(numbers).sort((a, b) => a - b);
	const middleIndex = Math.floor(sorted.length / 2);
	return sorted.length % 2 == 0 ? (sorted[middleIndex - 1] + sorted[middleIndex]) / 2 : sorted[middleIndex];
};

// TODO: give aspects of this page different looks when there is no content.
function Statistics({
	allUserInformation,
	userClientInfo,
}: InferGetServerSidePropsType<typeof getEverythingAsServerSideProp>) {
	const allWatchedEntries = Object.keys(allUserInformation).flatMap((userId) =>
		allUserInformation[userId].alreadyWatchedList.map((entry: any) => {
			return {
				userId: parseInt(userId),
				...entry,
			};
		}),
	);
	const allWatchedMovieIds: number[] = Array.from(new Set(allWatchedEntries.map((entry) => entry.movie.id)));
	const movieIdToWatchedInformation = new Map(
		allWatchedMovieIds.map((movieId) => {
			const entries = allWatchedEntries.filter((watchedEntry) => watchedEntry.movie.id == movieId);
			const ratings: number[] = entries.map((watchedEntry) => watchedEntry.rating).filter((rating) => rating || rating === 0);
			return [
				movieId,
				{
					entries: entries,
					ratings: ratings,
					movie: entries[0].movie,
					medianRating: ratings.length ? median(ratings) : null,
					averageRating: ratings.length ? average(ratings) : null,
				},
			];
		}),
	);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2>Movie Statistics</h2>
				<h3>Highlights</h3>
				<h4>Most Enjoyed Movie</h4>
				TODO: movie with highest median rating
				<h4>Least Enjoyed Movie</h4>
				TODO: movie with lowest median rating
				<h4>Most Controversial Movie</h4>
				TODO: movie with highest rating range
				<h4>Least Controversial Movie</h4>
				TODO: movie with lowest rating range
				<h3>Statistics by Movie</h3>
				{allWatchedMovieIds.map((movieId) => {
					const entry = movieIdToWatchedInformation.get(movieId)!;
					return (
						<MovieCard key={movieId} movie={entry.movie} titleHeadingLevel={4}>
							<p>Median Rating: {entry.medianRating || "no data"}</p>
							<p>Average Rating: {entry.averageRating || "no data"}</p>
							<p>Highest Rating: {entry.ratings.length ? Math.max(...entry.ratings) : "no data"}</p>
							<p>Lowest Rating: {entry.ratings.length ? Math.min(...entry.ratings) : "no data"}</p>
						</MovieCard>
					);
				})}
				<h2>Person Statistics</h2>
				<h3>Highlights</h3>
				<h4>Person Who Enjoys Movies the Most</h4>
				TODO: person who rates movies the highest on average
				<h4>Person Who Enjoys Movies the Least</h4>
				TODO: person who rates movies the lowest on average
				<h4>Person Who Posts the Most Enjoyable Movies</h4>
				TODO: person who has the highest average rating on their posted movies
				<h4>Person Who Posts the Least Enjoyable Movies</h4>
				TODO: person who has the lowest average rating on their posted movies
				<h4>Person Who Posts the Most Controversial Movies</h4>
				TODO: person who has the highest rating range on average for their posted movies
				<h4>Person Who Posts the Least Controversial Movies</h4>
				TODO: person who has the lowest rating range on average for their posted movies
				<h3>Statistics by Person</h3>
				TODO: show each person&apos;s highest rating, lowest rating, median rating, average rating, number of chosen
				movies, number of watched movies, most controversial rating (largest deviation from the median), best posted
				movie, worst posted movie, average posted movie rating, most controversial posted movie, least controversial
				posted movie, and average posted movie controversiality
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getEverythingAsServerSideProp;
export default Statistics;
