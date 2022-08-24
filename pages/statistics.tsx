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

enum ExtremeValue {
	MAX,
	MIN,
	MEDIAN,
}

const getExtremeValues = <T,>(values: T[], key: (_: T) => number | null, extremeValueType: ExtremeValue) => {
	const valueKeys = values.map(key).filter((value) => value || value === 0) as number[];
	if (!valueKeys.length) {
		return [];
	}

	let bingoValues: number[] = [];
	if (extremeValueType == ExtremeValue.MAX) {
		bingoValues = [Math.max(...valueKeys)];
	} else if (extremeValueType == ExtremeValue.MIN) {
		bingoValues = [Math.min(...valueKeys)];
	} else {
		const sorted = Array.from(valueKeys).sort((a, b) => a - b);
		const middleIndex = Math.floor(sorted.length / 2);
		if (sorted.length % 2 == 0 && valueKeys[middleIndex - 1] != valueKeys[middleIndex]) {
			bingoValues = [valueKeys[middleIndex - 1], valueKeys[middleIndex]];
		} else {
			bingoValues = [valueKeys[middleIndex]];
		}
	}

	return values.filter((value) => bingoValues.includes(key(value)));
};

const numericValueOrDefault = (value: any, defaultValue: any) => (value || value === 0 ? value : defaultValue);

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
	const allWatchedInformation = Array.from(movieIdToWatchedInformation.values());
	const lowestRatedMovieEntries = getExtremeValues(
		allWatchedInformation,
		(entry) => entry.medianRating,
		ExtremeValue.MIN,
	);
	const highestRatedMovieEntries = getExtremeValues(
		allWatchedInformation,
		(entry) => entry.medianRating,
		ExtremeValue.MAX,
	);
	const leastControversialMovieEntries = getExtremeValues(
		allWatchedInformation,
		(entry) => (entry.medianRating ? entry.highestRating! - entry.lowestRating! : null),
		ExtremeValue.MIN,
	);
	const mostControversialMovieEntries = getExtremeValues(
		allWatchedInformation,
		(entry) => (entry.medianRating ? entry.highestRating! - entry.lowestRating! : null),
		ExtremeValue.MAX,
	);
	const personInformation = new Map(
		Object.keys(allUserInformation).map((userIdAsString) => {
			const userId = parseInt(userIdAsString);
			const allUserWatchedEntries = allWatchedEntries.filter((watchedEntry) => watchedEntry.userId == userId);
			const allPostedEntries = allWatchedEntries.filter((watchedEntry) => watchedEntry.originatorId == userId);
			const allPostedMovieIds = Array.from(new Set(allPostedEntries.map((watchedEntry) => watchedEntry.movie.id)));
			const postedMovieIdToMovieInformation = new Map(
				allPostedMovieIds.map((movieId) => {
					const entries = allWatchedEntries.filter(
						(watchedEntry) => watchedEntry.movie.id == movieId && watchedEntry.originatorId == userId,
					);
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
			const allUserPostedEntries = Array.from(postedMovieIdToMovieInformation.values());
			const allUsableWatchedRatings = allUserWatchedEntries
				.map((watchedEntry) => watchedEntry.rating)
				.filter((rating) => rating || rating === 0);
			const allUsablePostedRatings = allUserPostedEntries
				.map((watchedEntry) => watchedEntry.medianRating)
				.filter((rating) => rating || rating === 0) as number[];
			const allUsablePostedControversialities = allUserPostedEntries
				.filter((watchedEntry) => watchedEntry.medianRating || watchedEntry.medianRating === 0)
				.map((watchedEntry) => watchedEntry.highestRating! - watchedEntry.lowestRating!);
			return [
				userId,
				{
					allPostedEntries: allPostedEntries,
					allUsablePostedRatings: allUsablePostedRatings,
					allUsableWatchedRatings: allUsableWatchedRatings,
					allWatchedEntries: allUserWatchedEntries,
					allUserPostedEntries: allUserPostedEntries,
					averageWatchedRating: allUsableWatchedRatings.length ? average(allUsableWatchedRatings) : null,
					averagePostedRating: allUsablePostedRatings.length ? average(allUsablePostedRatings) : null,
					medianWatchedRatingEntries: getExtremeValues(
						allUserWatchedEntries,
						(entry) => entry.rating,
						ExtremeValue.MEDIAN,
					),
					medianPostedRatingEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MEDIAN,
					),
					ratingControversiality: allUsableWatchedRatings.length
						? Math.max(...allUsableWatchedRatings) - Math.min(...allUsableWatchedRatings)
						: null,
					averagePostedControversiality: allUsablePostedControversialities.length
						? average(allUsablePostedControversialities)
						: null,
					medianPostedControversialityEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => (entry.medianRating ? entry.highestRating! - entry.lowestRating! : null),
						ExtremeValue.MEDIAN,
					),
					lowestRatedWatchedEntries: getExtremeValues(allUserWatchedEntries, (entry) => entry.rating, ExtremeValue.MIN),
					highestRatedWatchedEntries: getExtremeValues(
						allUserWatchedEntries,
						(entry) => entry.rating,
						ExtremeValue.MAX,
					),
					lowestRatedPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MIN,
					),
					highestRatedPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MAX,
					),
					leastControversialPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => (entry.medianRating ? entry.highestRating! - entry.lowestRating! : null),
						ExtremeValue.MIN,
					),
					mostControversialPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => (entry.medianRating ? entry.highestRating! - entry.lowestRating! : null),
						ExtremeValue.MIN,
					),
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
						Rating range: {movieEntry.highestRating! - movieEntry.lowestRating!}
					</MovieCard>
				))}
				<h4>Least Controversial Movie(s)</h4>
				{leastControversialMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Rating range: {movieEntry.highestRating! - movieEntry.lowestRating!}
					</MovieCard>
				))}
				<h3>Statistics by Movie</h3>
				{allWatchedMovieIds.length ? (
					allWatchedMovieIds.map((movieId) => {
						const entry = movieIdToWatchedInformation.get(movieId)!;
						return (
							<MovieCard key={movieId} movie={entry.movie} titleHeadingLevel={4}>
								<p>Median Rating: {numericValueOrDefault(entry.medianRating, "no data")}</p>
								<p>Average Rating: {numericValueOrDefault(entry.averageRating, "no data")}</p>
								<p>Highest Rating: {numericValueOrDefault(entry.highestRating, "no data")}</p>
								<p>Lowest Rating: {numericValueOrDefault(entry.lowestRating, "no data")}</p>
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
