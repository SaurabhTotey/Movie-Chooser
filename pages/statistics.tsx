import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Footer from "../components/Footer";
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
			return [
				movieId,
				{
					entries: allWatchedEntries.filter((watchedEntry) => watchedEntry.movie.id == movieId),
					movie: allWatchedEntries.find((watchedEntry) => watchedEntry.movie.id == movieId).movie,
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
				<h3>Statistics by Movie</h3>
				{}
				<h2>Person Statistics</h2>
				<h3>Highlights</h3>
				<h3>Statistics by Person</h3>
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getEverythingAsServerSideProp;
export default Statistics;
