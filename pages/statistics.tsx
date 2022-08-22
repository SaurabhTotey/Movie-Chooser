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
			const ratings: number[] = entries
				.map((watchedEntry) => watchedEntry.rating)
				.filter((rating) => rating || rating === 0);
			return [
				movieId,
				{
					averageRating: ratings.length ? average(ratings) : null,
					entries: entries,
					highestRating: ratings.length ? Math.max(...ratings) : null,
					lowestRating: ratings.length ? Math.min(...ratings) : null,
					medianRating: ratings.length ? median(ratings) : null,
					movie: entries[0].movie,
					ratings: ratings,
				},
			];
		}),
	);
	// God, what the fuck is this garbage... Forgive me...
	const [
		lowestRatedMovieEntries,
		highestRatedMovieEntries,
		leastControversialMovieEntries,
		mostControversialMovieEntries,
	] = allWatchedMovieIds.reduce(
		(
			[currentLowestRated, currentHighestRated, currentLeastControversial, currentMostControversial]: [
				any[],
				any[],
				any[],
				any[],
			],
			currentId,
		) => {
			const currentEntry = movieIdToWatchedInformation.get(currentId)!;
			if (!currentEntry.medianRating) {
				return [currentLowestRated, currentHighestRated, currentLeastControversial, currentMostControversial];
			}
			const currentLowestValue = currentLowestRated.length ? currentLowestRated[0].medianRating : 11;
			const currentHighestValue = currentHighestRated.length ? currentHighestRated[0].medianRating : -1;
			const rangeOf = (entry: any) => entry.highestRating - entry.lowestRating;
			const currentSmallestRange = currentLeastControversial.length ? rangeOf(currentLeastControversial[0]) : 11;
			const currentLargestRange = currentMostControversial.length ? rangeOf(currentMostControversial[0]) : -1;
			return [
				currentEntry.medianRating <= currentLowestValue
					? currentEntry.medianRating == currentLowestValue
						? [...currentLowestRated, currentEntry]
						: [currentEntry]
					: currentLowestRated,
				currentEntry.medianRating >= currentHighestValue
					? currentEntry.medianRating == currentHighestValue
						? [...currentHighestRated, currentEntry]
						: [currentEntry]
					: currentHighestRated,
				rangeOf(currentEntry) <= currentSmallestRange
					? rangeOf(currentEntry) == currentSmallestRange
						? [...currentLeastControversial, currentEntry]
						: [currentEntry]
					: currentLeastControversial,
				rangeOf(currentEntry) >= currentLargestRange
					? rangeOf(currentEntry) == currentLargestRange
						? [...currentMostControversial, currentEntry]
						: [currentEntry]
					: currentMostControversial,
			];
		},
		[[], [], [], []],
	);
	const personInformation = new Map(
		Object.keys(allUserInformation).map((userIdAsString) => {
			const userId = parseInt(userIdAsString);
			const allUserWatchedEntries = allWatchedEntries.filter((watchedEntry) => watchedEntry.userId == userId);
			const allPostedEntries = allWatchedEntries.filter((watchedEntry) => watchedEntry.originatorId == userId);
			const allUsableWatchedRatings = allUserWatchedEntries
				.map((watchedEntry) => watchedEntry.rating)
				.filter((rating) => rating || rating === 0);
			const allUsablePostedRatings = allPostedEntries
				.map((watchedEntry) => watchedEntry.rating)
				.filter((rating) => rating || rating === 0);
			return [
				userId,
				{
					allPostedEntries: allPostedEntries,
					allUsablePostedRatings: allUsablePostedRatings,
					allUsableWatchedRatings: allUsableWatchedRatings,
					allWatchedEntries: allUserWatchedEntries,
					averageUsableWatchedRating: allUsableWatchedRatings.length ? average(allUsableWatchedRatings) : null,
					averageUsablePostedRating: allUsablePostedRatings.length ? average(allUsablePostedRatings) : null,
					medianUsableWatchedRating: allUsableWatchedRatings.length ? median(allUsableWatchedRatings) : null,
					medianUsablePostedRating: allUsablePostedRatings.length ? median(allUsablePostedRatings) : null,
					averageWatchedControversiality: undefined,
					averagePostedControversiality: undefined,
					medianWatchedControversiality: undefined,
					medianPostedControversiality: undefined,
					lowestRatedWatchedEntries: undefined,
					highestRatedWatchedEntries: undefined,
					lowestRatedPostedEntries: undefined,
					highestRatedPostdEntries: undefined,
					leastControversialWatchedEntries: undefined,
					mostControversialWatchedEntries: undefined,
					leastControversialPostedEntries: undefined,
					mostControversialPostedEntries: undefined,
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
				<h4>Most Enjoyed Movie(s)</h4>
				{highestRatedMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Median rating: {movieEntry.medianRating}
					</MovieCard>
				))}
				<h4>Least Enjoyed Movie(s)</h4>
				{lowestRatedMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Median rating: {movieEntry.medianRating}
					</MovieCard>
				))}
				<h4>Most Controversial Movie(s)</h4>
				{mostControversialMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Rating range: {movieEntry.highestRating - movieEntry.lowestRating}
					</MovieCard>
				))}
				<h4>Least Controversial Movie(s)</h4>
				{leastControversialMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Rating range: {movieEntry.highestRating - movieEntry.lowestRating}
					</MovieCard>
				))}
				<h3>Statistics by Movie</h3>
				{allWatchedMovieIds.length ? (
					allWatchedMovieIds.map((movieId) => {
						const entry = movieIdToWatchedInformation.get(movieId)!;
						return (
							<MovieCard key={movieId} movie={entry.movie} titleHeadingLevel={4}>
								<p>Median Rating: {entry.medianRating || "no data"}</p>
								<p>Average Rating: {entry.averageRating || "no data"}</p>
								<p>Highest Rating: {entry.highestRating || "no data"}</p>
								<p>Lowest Rating: {entry.lowestRating || "no data"}</p>
							</MovieCard>
						);
					})
				) : (
					<p>No watched movies yet.</p>
				)}
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
