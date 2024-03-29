import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import CollapsibleSection from "../components/CollapsibleSection";
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
		if (sorted.length % 2 == 0 && sorted[middleIndex - 1] != sorted[middleIndex]) {
			bingoValues = [sorted[middleIndex - 1], sorted[middleIndex]];
		} else {
			bingoValues = [sorted[middleIndex]];
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
			const raterIds = entries
				.filter((watchedEntry) => watchedEntry.rating || watchedEntry.rating === 0)
				.map((watchedEntry) => watchedEntry.userId);
			const originatorIds = entries
				.filter((watchedEntry) => watchedEntry.rating || watchedEntry.rating === 0)
				.map((watchedEntry) => watchedEntry.originatorId);
			return [
				movieId,
				{
					averageRating: ratings.length ? average(ratings) : null,
					entries: entries,
					highestRating: ratings.length ? Math.max(...ratings) : null,
					lowestRating: ratings.length ? Math.min(...ratings) : null,
					medianRating: ratings.length ? median(ratings) : null,
					movie: entries[0].movie,
					originatorNames: originatorIds.map((id) => allUserInformation[id].name),
					raterNames: raterIds.map((id) => allUserInformation[id].name),
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
	const allUserIds = Object.keys(allUserInformation).map((userIdAsString) => parseInt(userIdAsString));
	const peopleInformation = new Map(
		allUserIds.map((userId) => {
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
				.filter((rating) => rating || rating === 0) as number[];
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
					allUsablePostedControversialities: allUsablePostedControversialities,
					allUsablePostedRatings: allUsablePostedRatings,
					allUsableWatchedRatings: allUsableWatchedRatings,
					allUserPostedEntries: allUserPostedEntries,
					allWatchedEntries: allUserWatchedEntries,
					averagePostedControversiality: allUsablePostedControversialities.length
						? average(allUsablePostedControversialities)
						: null,
					averagePostedRating: allUsablePostedRatings.length ? average(allUsablePostedRatings) : null,
					averageWatchedControversiality: average(
						allUserWatchedEntries
							.map((entry) =>
								entry.rating || entry.rating === 0
									? Math.abs(entry.rating - movieIdToWatchedInformation.get(entry.movie.id)!.medianRating!)
									: null,
							)
							.filter((e) => e || e === 0) as number[],
					),
					averageWatchedRating: allUsableWatchedRatings.length ? average(allUsableWatchedRatings) : null,
					highestRatedPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MAX,
					),
					highestRatedWatchedEntries: getExtremeValues(
						allUserWatchedEntries,
						(entry) => entry.rating,
						ExtremeValue.MAX,
					),
					leastControversialPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) =>
							entry.medianRating || entry.medianRating === 0 ? entry.highestRating! - entry.lowestRating! : null,
						ExtremeValue.MIN,
					),
					lowestRatedPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MIN,
					),
					lowestRatedWatchedEntries: getExtremeValues(allUserWatchedEntries, (entry) => entry.rating, ExtremeValue.MIN),
					medianPostedControversialityEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) =>
							entry.medianRating || entry.medianRating === 0 ? entry.highestRating! - entry.lowestRating! : null,
						ExtremeValue.MEDIAN,
					),
					medianPostedRatingEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) => entry.medianRating,
						ExtremeValue.MEDIAN,
					),
					medianWatchedRatingEntries: getExtremeValues(
						allUserWatchedEntries,
						(entry) => entry.rating,
						ExtremeValue.MEDIAN,
					),
					mostControversialPostedEntries: getExtremeValues(
						allUserPostedEntries,
						(entry) =>
							entry.medianRating || entry.medianRating === 0 ? entry.highestRating! - entry.lowestRating! : null,
						ExtremeValue.MAX,
					),
					mostControversialWatchedRatings: getExtremeValues(
						allUserWatchedEntries,
						(entry) =>
							entry.rating || entry.rating === 0
								? Math.abs(entry.rating - movieIdToWatchedInformation.get(entry.movie.id)!.medianRating!)
								: null,
						ExtremeValue.MAX,
					),
					ratingControversiality: allUsableWatchedRatings.length
						? Math.max(...allUsableWatchedRatings) - Math.min(...allUsableWatchedRatings)
						: null,
				},
			];
		}),
	);
	const highestRaterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averageWatchedRating,
		ExtremeValue.MAX,
	);
	const lowestRaterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averageWatchedRating,
		ExtremeValue.MIN,
	);
	const mostControversialRaterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averageWatchedControversiality,
		ExtremeValue.MAX,
	);
	const leastControversialRaterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averageWatchedControversiality,
		ExtremeValue.MIN,
	);
	const bestPosterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averagePostedRating,
		ExtremeValue.MAX,
	);
	const worstPosterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averagePostedRating,
		ExtremeValue.MIN,
	);
	const mostControversialPosterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averagePostedControversiality,
		ExtremeValue.MAX,
	);
	const leastControversialPosterIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.averagePostedControversiality,
		ExtremeValue.MIN,
	);
	const highestAttendingPersonIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.allWatchedEntries.length,
		ExtremeValue.MAX,
	);
	const lowestAttendingPersonIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.allWatchedEntries.length,
		ExtremeValue.MIN,
	);
	const mostPostingPersonIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.allUserPostedEntries.length,
		ExtremeValue.MAX,
	);
	const leastPostingPersonIds = getExtremeValues(
		allUserIds,
		(userId) => peopleInformation.get(userId)!.allUserPostedEntries.length,
		ExtremeValue.MIN,
	);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2>Movie Statistics</h2>
				<p>
					Yeah, I&apos;m just going to go ahead an apologize right now ahead of time. This is the probably the least
					useful and ugliest page a person could dare to make. I apologize to your eyes for having to bear this
					monstrosity. Its creation was necessitated in this hideous fashion due to time constraints. The code to make
					this page is even more disgusting.
				</p>
				<h3>Highlights</h3>
				<h4>
					Most Enjoyed Movie(s) (
					{numericValueOrDefault(highestRatedMovieEntries.length > 0 && highestRatedMovieEntries[0].medianRating, "?")})
				</h4>
				{highestRatedMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Median rating: {movieEntry.medianRating}
					</MovieCard>
				))}
				<h4>
					Least Enjoyed Movie(s) (
					{numericValueOrDefault(lowestRatedMovieEntries.length > 0 && lowestRatedMovieEntries[0].medianRating, "?")})
				</h4>
				{lowestRatedMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Median rating: {movieEntry.medianRating}
					</MovieCard>
				))}
				<h4>
					Most Controversial Movie(s) (
					{numericValueOrDefault(
						mostControversialMovieEntries.length > 0 &&
							mostControversialMovieEntries[0].highestRating! - mostControversialMovieEntries[0].lowestRating!,
						"?",
					)}
					)
				</h4>
				{mostControversialMovieEntries.map((movieEntry) => (
					<MovieCard key={movieEntry.movie.id} movie={movieEntry.movie} titleHeadingLevel={5}>
						Rating range: {movieEntry.highestRating! - movieEntry.lowestRating!}
					</MovieCard>
				))}
				<h4>
					Least Controversial Movie(s) (
					{numericValueOrDefault(
						leastControversialMovieEntries.length > 0 &&
							leastControversialMovieEntries[0].highestRating! - leastControversialMovieEntries[0].lowestRating!,
						"?",
					)}
					)
				</h4>
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
								<hr />
								<div>
									{[...Array(entry.raterNames.length).keys()].map((i) => {
										return (
											<p key={i}>
												{entry.raterNames[i]} rated as {entry.ratings[i]}
											</p>
										);
									})}
								</div>
								<p>From: {Array.from(new Set(entry.originatorNames)).join(", ")}</p>
							</MovieCard>
						);
					})
				) : (
					<p>No watched movies yet.</p>
				)}
				<h2>Person Statistics</h2>
				<h3>Highlights</h3>
				<h4>
					Person Who Enjoys Movies the Most (
					{numericValueOrDefault(peopleInformation.get(highestRaterIds[0])?.averageWatchedRating, "?")})
				</h4>
				<ul>
					{highestRaterIds.map((highestRaterId) => (
						<li key={highestRaterId}>{allUserInformation[highestRaterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Enjoys Movies the Least (
					{numericValueOrDefault(peopleInformation.get(lowestRaterIds[0])?.averageWatchedRating, "?")})
				</h4>
				<ul>
					{lowestRaterIds.map((lowestRaterId) => (
						<li key={lowestRaterId}>{allUserInformation[lowestRaterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Posts the Most Enjoyable Movies (
					{numericValueOrDefault(peopleInformation.get(bestPosterIds[0])?.averagePostedRating, "?")})
				</h4>
				<ul>
					{bestPosterIds.map((bestPosterId) => (
						<li key={bestPosterId}>{allUserInformation[bestPosterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Posts the Least Enjoyable Movies (
					{numericValueOrDefault(peopleInformation.get(worstPosterIds[0])?.averagePostedRating, "?")})
				</h4>
				<ul>
					{worstPosterIds.map((worstPosterId) => (
						<li key={worstPosterId}>{allUserInformation[worstPosterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Rates Most Controversially (
					{numericValueOrDefault(
						peopleInformation.get(mostControversialRaterIds[0])?.averageWatchedControversiality,
						"?",
					)}
					)
				</h4>
				<ul>
					{mostControversialRaterIds.map((mostControversialRaterId) => (
						<li key={mostControversialRaterId}>{allUserInformation[mostControversialRaterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Rates Least Controversially (
					{numericValueOrDefault(
						peopleInformation.get(leastControversialRaterIds[0])?.averageWatchedControversiality,
						"?",
					)}
					)
				</h4>
				<ul>
					{leastControversialRaterIds.map((leastControversialRaterId) => (
						<li key={leastControversialRaterId}>{allUserInformation[leastControversialRaterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Posts the Most Controversial Movies (
					{numericValueOrDefault(
						peopleInformation.get(mostControversialPosterIds[0])?.averagePostedControversiality,
						"?",
					)}
					)
				</h4>
				<ul>
					{mostControversialPosterIds.map((mostControversialPosterId) => (
						<li key={mostControversialPosterId}>{allUserInformation[mostControversialPosterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Posts the Least Controversial Movies (
					{numericValueOrDefault(
						peopleInformation.get(leastControversialPosterIds[0])?.averagePostedControversiality,
						"?",
					)}
					)
				</h4>
				<ul>
					{leastControversialPosterIds.map((leastControversialPosterId) => (
						<li key={leastControversialPosterId}>{allUserInformation[leastControversialPosterId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Has Attended the Most Movies (
					{numericValueOrDefault(peopleInformation.get(highestAttendingPersonIds[0])?.allWatchedEntries.length, "?")})
				</h4>
				<ul>
					{highestAttendingPersonIds.map((highestAttendingPersonId) => (
						<li key={highestAttendingPersonId}>{allUserInformation[highestAttendingPersonId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Has Attended the Least Movies (
					{numericValueOrDefault(peopleInformation.get(lowestAttendingPersonIds[0])?.allWatchedEntries.length, "?")})
				</h4>
				<ul>
					{lowestAttendingPersonIds.map((lowestAttendingPersonId) => (
						<li key={lowestAttendingPersonId}>{allUserInformation[lowestAttendingPersonId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Has Had Their Movies Chosen The Most (
					{numericValueOrDefault(peopleInformation.get(mostPostingPersonIds[0])?.allUserPostedEntries.length, "?")})
				</h4>
				<ul>
					{mostPostingPersonIds.map((mostPostingPersonId) => (
						<li key={mostPostingPersonId}>{allUserInformation[mostPostingPersonId].name}</li>
					))}
				</ul>
				<h4>
					Person Who Has Had Their Movies Chosen The Least (
					{numericValueOrDefault(peopleInformation.get(leastPostingPersonIds[0])?.allUserPostedEntries.length, "?")})
				</h4>
				<ul>
					{leastPostingPersonIds.map((leastPostingPersonId) => (
						<li key={leastPostingPersonId}>{allUserInformation[leastPostingPersonId].name}</li>
					))}
				</ul>
				<h3>Statistics by Person</h3>
				{Array.from(peopleInformation.keys()).map((userId) => {
					const personInformation = peopleInformation.get(userId)!;
					return (
						<CollapsibleSection key={userId} title={allUserInformation[userId].name} titleHeadingLevel={4}>
							<>
								{personInformation.allUsableWatchedRatings.length > 0 && (
									<h5>Highest Rated Movie(s) ({Math.max(...personInformation.allUsableWatchedRatings)})</h5>
								)}
								{personInformation.highestRatedWatchedEntries.map((entry) => {
									return (
										<MovieCard
											key={`highestRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.rating}
										</MovieCard>
									);
								})}
								{personInformation.allUsableWatchedRatings.length > 0 && (
									<h5>Median Rated Movie(s) ({median(personInformation.allUsableWatchedRatings)})</h5>
								)}
								{personInformation.medianWatchedRatingEntries.map((entry) => {
									return (
										<MovieCard
											key={`medianRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.rating}
										</MovieCard>
									);
								})}
								{personInformation.allUsableWatchedRatings.length > 0 && (
									<h5>Lowest Rated Movie(s) ({Math.min(...personInformation.allUsableWatchedRatings)})</h5>
								)}
								{personInformation.lowestRatedWatchedEntries.map((entry) => {
									return (
										<MovieCard
											key={`lowestRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.rating}
										</MovieCard>
									);
								})}
								{personInformation.allUsableWatchedRatings.length > 0 && (
									<h5>
										Most controversial rating(s) (
										{Math.abs(
											personInformation.mostControversialWatchedRatings[0].rating -
												movieIdToWatchedInformation.get(personInformation.mostControversialWatchedRatings[0].movie.id)!
													.medianRating!,
										)}
										)
									</h5>
								)}
								{personInformation.mostControversialWatchedRatings.map((entry) => {
									return (
										<MovieCard
											key={`mostControversialRatingFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											<p>User rating: {entry.rating}</p>
											<p>Median Rating: {movieIdToWatchedInformation.get(entry.movie.id)!.medianRating}</p>
										</MovieCard>
									);
								})}
								{(personInformation.averageWatchedRating || personInformation.averageWatchedRating === 0) && (
									<h5>Average Rating: {personInformation.averageWatchedRating}</h5>
								)}
								{(personInformation.averageWatchedControversiality ||
									personInformation.averageWatchedControversiality === 0) && (
									<h5>Average Rating Controversiality: {personInformation.averageWatchedControversiality}</h5>
								)}
								{personInformation.allUsablePostedRatings.length > 0 && (
									<h5>Most Enjoyed Posted Movie(s) ({Math.max(...personInformation.allUsablePostedRatings)})</h5>
								)}
								{personInformation.highestRatedPostedEntries.map((entry) => {
									return (
										<MovieCard
											key={`highestPostedRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.medianRating}
										</MovieCard>
									);
								})}
								{personInformation.allUsablePostedRatings.length > 0 && (
									<h5>Median Enjoyed Posted Movie(s) ({median(personInformation.allUsablePostedRatings)})</h5>
								)}
								{personInformation.medianPostedRatingEntries.map((entry) => {
									return (
										<MovieCard
											key={`medianPostedRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.medianRating}
										</MovieCard>
									);
								})}
								{personInformation.allUsablePostedRatings.length > 0 && (
									<h5>Least Enjoyed Posted Movie(s) ({Math.min(...personInformation.allUsablePostedRatings)})</h5>
								)}
								{personInformation.lowestRatedPostedEntries.map((entry) => {
									return (
										<MovieCard
											key={`lowestPostedRatedFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Rating: {entry.medianRating}
										</MovieCard>
									);
								})}
								{personInformation.allUsablePostedRatings.length > 0 && (
									<h5>Average Posted Movie Rating: {average(personInformation.allUsablePostedRatings)}</h5>
								)}
								{personInformation.mostControversialPostedEntries.length > 0 && (
									<h5>
										Most Controversial Posted Movie(s) (
										{Math.max(...personInformation.allUsablePostedControversialities)})
									</h5>
								)}
								{personInformation.mostControversialPostedEntries.map((entry) => {
									return (
										<MovieCard
											key={`highestControversialityFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Controversiality: {entry.highestRating! - entry.lowestRating!}
										</MovieCard>
									);
								})}
								{personInformation.medianPostedControversialityEntries.length > 0 && (
									<h5>
										Median Controversial Posted Movie(s) ({median(personInformation.allUsablePostedControversialities)})
									</h5>
								)}
								{personInformation.medianPostedControversialityEntries.map((entry) => {
									return (
										<MovieCard
											key={`medianControversialityFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Controversiality: {entry.highestRating! - entry.lowestRating!}
										</MovieCard>
									);
								})}
								{personInformation.leastControversialPostedEntries.length > 0 && (
									<h5>
										Least Controversial Posted Movie(s) (
										{Math.min(...personInformation.allUsablePostedControversialities)})
									</h5>
								)}
								{personInformation.leastControversialPostedEntries.map((entry) => {
									return (
										<MovieCard
											key={`lowestControversialityFor${userId}Is${entry.movie.id}`}
											movie={entry.movie}
											titleHeadingLevel={6}
										>
											Controversiality: {entry.highestRating! - entry.lowestRating!}
										</MovieCard>
									);
								})}
								{(personInformation.averagePostedControversiality ||
									personInformation.averagePostedControversiality === 0) && (
									<h5>Average Posted Movie Controversiality: {personInformation.averagePostedControversiality}</h5>
								)}
								<h5>Number of watched movies: {personInformation.allWatchedEntries.length}</h5>
								<h5>Number of chosen movies: {personInformation.allUserPostedEntries.length}</h5>
							</>
						</CollapsibleSection>
					);
				})}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getEverythingAsServerSideProp;
export default Statistics;
