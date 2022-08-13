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
	const getAllUsersPromise = prisma.user.findMany();
	const userIdsToUserInformation = Object.fromEntries(
		new Map(
			(await Promise.all(
				(
					await getAllUsersPromise
				).map(async (userEntry) => {
					return [userEntry.id, { email: userEntry.email, name: userEntry.name }];
				}),
			)) as any,
		),
	);
	const allMovieIds = Array.from(
		new Set(
			(await prisma.toWatchEntry.findMany())
				.map((movieEntry) => movieEntry.movieId)
				.concat((await prisma.watchedEntry.findMany()).map((movieEntry) => movieEntry.movieId)),
		),
	);
	const movieIdToMovieInformation = Object.fromEntries(
		new Map(
			(await Promise.all(
				allMovieIds.map(async (movieId) => {
					return [movieId, await getMovieInformationFor(movieId)];
				}),
			)) as any,
		),
	);
	const userIdsToLists = Object.fromEntries(
		new Map(
			(await Promise.all(
				(
					await getAllUsersPromise
				).map(async (userEntry) => {
					return [
						userEntry.id,
						{
							alreadyWatchedList: (await prisma.watchedEntry.findMany({ where: { userId: userEntry.id } })).map(
								(movieEntry) => {
									return {
										date: new Intl.DateTimeFormat("en-US").format(movieEntry.watched),
										movie: movieIdToMovieInformation[movieEntry.movieId],
										originatorId: movieEntry.originatorId,
										rating: movieEntry.rating,
									};
								},
							),
							toWatchList: (await prisma.toWatchEntry.findMany({ where: { userId: userEntry.id } })).map(
								(movieEntry) => {
									return {
										movie: movieIdToMovieInformation[movieEntry.movieId],
										weight: movieEntry.weight,
									};
								},
							),
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
			userIdsToUserInformation: userIdsToUserInformation,
		},
	};
};

function Home({
	userClientInfo,
	userIdsToLists,
	userIdsToUserInformation,
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
						const userInformation = userIdsToUserInformation[id];
						const toWatchListTotalWeight = userIdsToLists[id].toWatchList.reduce(
							(sum: number, current: any) => sum + current.weight,
							0,
						);
						return (
							<div key={id}>
								<h2>{userInformation.name}</h2>
								<p>
									Email: <a href={`mailto:${userInformation.email}`}>{userInformation.email}</a>
								</p>
								<CollapsibleSection title="Watch List" titleHeadingLevel={3}>
									{userIdsToLists[id].toWatchList.map((movieEntry: any) => {
										return (
											<MovieCard
												key={`toWatchListFor${id}Movie${movieEntry.movie.id}`}
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
									{userIdsToLists[id].alreadyWatchedList.map((movieEntry: any) => {
										return (
											<MovieCard
												key={`alreadyWatchedListFor${id}Movie${movieEntry.movie.id}`}
												movie={movieEntry.movie}
												titleHeadingLevel={4}
											>
												Watched on {movieEntry.date}
												{movieEntry.rating && <br />}
												{movieEntry.rating && `Rated: ${movieEntry.rating}`}
												<br />
												From the list of {userIdsToUserInformation[movieEntry.originatorId].name}
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

export const getServerSideProps = getUserAndAllUserListsAsServerSideProp;
export default Home;
