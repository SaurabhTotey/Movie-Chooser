import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { Cookies } from "react-cookie";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import deleteStaleSessions from "../helpers/DeleteStaleSessions";
import { prisma } from "../helpers/GetPrismaClient";
import { getMovieInformationFor } from "../helpers/MovieApiManager";
import UserClientInfo from "../helpers/UserClientInfo";

const getUserAndAllUserListsAsServerSideProp: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
	await deleteStaleSessions();
	const user = sessionId
		? await prisma.session
				.findUnique({
					where: {
						token: sessionId,
					},
				})
				.User()
		: null;
	const userIdsToLists = Object.fromEntries(
		new Map(
			(await Promise.all(
				(
					await prisma.user.findMany()
				).map(async (userEntry) => {
					return [
						userEntry.id,
						{
							alreadyWatchedList: await Promise.all(
								(
									await prisma.watchedEntry.findMany({ where: { userId: userEntry.id } })
								).map(async (movieEntry) => {
									return {
										date: new Intl.DateTimeFormat("en-US").format(movieEntry.watched),
										movie: await getMovieInformationFor(movieEntry.movieId),
										originatorName: (await prisma.user.findUnique({ where: { id: movieEntry.originatorId } }))!.name,
										rating: movieEntry.rating,
									};
								}),
							),
							toWatchList: await Promise.all(
								(
									await prisma.toWatchEntry.findMany({ where: { userId: userEntry.id } })
								).map(async (movieEntry) => {
									return {
										movie: await getMovieInformationFor(movieEntry.movieId),
										weight: movieEntry.weight,
									};
								}),
							),
							userEmail: userEntry.email,
							userName: userEntry.name,
						},
					];
				}),
			)) as any,
		),
	);

	return {
		props: {
			userClientInfo: user ? JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))) : null,
			userIdsToLists: JSON.parse(JSON.stringify(userIdsToLists)),
		},
	};
};

function Home({
	userClientInfo,
	userIdsToLists,
}: InferGetServerSidePropsType<typeof getUserAndAllUserListsAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userIdsToLists &&
					Object.keys(userIdsToLists).map((id) => {
						const toWatchListTotalWeight = userIdsToLists[id].toWatchList.reduce(
							(sum: number, current: any) => sum + current.weight,
							0,
						);
						return (
							<CollapsibleSection key={id} isExpandedToBegin={true} title={userIdsToLists[id].userName}>
								<p>
									Email: <a href={`mailto:${userIdsToLists[id].userEmail}`}>{userIdsToLists[id].userEmail}</a>
								</p>
								<CollapsibleSection isExpandedToBegin={true} title="Watch List" titleHeadingLevel={3}>
									{userIdsToLists[id].toWatchList.map((entry: any) => {
										return (
											<MovieCard
												key={`toWatchListFor${id}Movie${entry.movie.id}`}
												movie={entry.movie}
												titleHeadingLevel={4}
											>
												Relative chance of getting chosen:{" "}
												{toWatchListTotalWeight ? entry.weight / toWatchListTotalWeight : 0}
											</MovieCard>
										);
									})}
								</CollapsibleSection>
								<CollapsibleSection title="Already Watched List" titleHeadingLevel={3}>
									{userIdsToLists[id].alreadyWatchedList.map((entry: any) => {
										return (
											<MovieCard
												key={`alreadyWatchedListFor${id}Movie${entry.movie.id}`}
												movie={entry.movie}
												titleHeadingLevel={4}
											>
												Watched on {entry.date}
												{entry.rating && <br />}
												{entry.rating && `Rated: ${entry.rating}`}
												<br />
												From the list of {entry.originatorName}
											</MovieCard>
										);
									})}
								</CollapsibleSection>
							</CollapsibleSection>
						);
					})}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAndAllUserListsAsServerSideProp;
export default Home;
