import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import getEverythingAsServerSideProp from "../helpers/GetEverythingAsServerSideProp";

function Lists({
	allUserInformation,
	userClientInfo,
}: InferGetServerSidePropsType<typeof getEverythingAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{Object.keys(allUserInformation).map((userId) => {
					const userEntry = allUserInformation[userId];
					const toWatchListTotalWeight = userEntry.toWatchList.reduce(
						(sum: number, current: any) => sum + current.weight,
						0,
					);
					return (
						<div key={userId}>
							<h2>{userEntry.name}</h2>
							<p>
								Email: <a href={`mailto:${userEntry.email}`}>{userEntry.email}</a>
							</p>
							<CollapsibleSection title="Watch List" titleHeadingLevel={3}>
								{userEntry.toWatchList.map((movieEntry: any) => {
									return (
										<MovieCard
											key={`toWatchListFor${userId}Movie${movieEntry.movie.id}`}
											movie={movieEntry.movie}
											titleHeadingLevel={4}
										>
											Relative chance of getting chosen:{" "}
											{toWatchListTotalWeight ? movieEntry.weight / toWatchListTotalWeight : 0}
										</MovieCard>
									);
								})}
							</CollapsibleSection>
							<CollapsibleSection title="Already Watched List" titleHeadingLevel={3}>
								{userEntry.alreadyWatchedList.map((movieEntry: any) => {
									return (
										<MovieCard
											key={`alreadyWatchedListFor${userId}Movie${movieEntry.movie.id}`}
											movie={movieEntry.movie}
											titleHeadingLevel={4}
										>
											Watched on {movieEntry.date}
											{movieEntry.rating && <br />}
											{movieEntry.rating && `Rated: ${movieEntry.rating}`}
											<br />
											From the list of {allUserInformation[movieEntry.originatorId].name}
										</MovieCard>
									);
								})}
							</CollapsibleSection>
						</div>
					);
				})}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getEverythingAsServerSideProp;
export default Lists;
