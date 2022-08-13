import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";
import deleteStaleSessions from "./DeleteStaleSessions";
import { prisma } from "./GetPrismaClient";
import { getMovieInformationFor } from "./MovieApiManager";
import UserClientInfo from "./UserClientInfo";

const getEverythingAsServerSideProp: GetServerSideProps = async (context) => {
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

	const userIdToUserInformation = new Map(
		(await Promise.all(
			(
				await prisma.user.findMany()
			).map(async (userEntry) => {
				return [userEntry.id, { email: userEntry.email, name: userEntry.name }];
			}),
		)) as any,
	);

	const allMovieIds = Array.from(
		new Set(
			(await prisma.toWatchEntry.findMany())
				.map((movieEntry) => movieEntry.movieId)
				.concat((await prisma.watchedEntry.findMany()).map((movieEntry) => movieEntry.movieId)),
		),
	);
	const movieIdToMovieInformation = new Map(
		(await Promise.all(
			allMovieIds.map(async (movieId) => {
				return [movieId, await getMovieInformationFor(movieId)];
			}),
		)) as any,
	);

	const allUserInformation = Object.fromEntries(
		new Map(
			(await Promise.all(
				Array.from(userIdToUserInformation.keys()).map(async (idString) => {
					const userId = parseInt(idString as any);
					return [
						userId,
						{
							alreadyWatchedList: (await prisma.watchedEntry.findMany({ where: { userId: userId } })).map(
								(movieEntry) => {
									return {
										date: new Intl.DateTimeFormat("en-US").format(movieEntry.watched),
										movie: movieIdToMovieInformation.get(movieEntry.movieId),
										originatorId: movieEntry.originatorId,
										rating: movieEntry.rating,
									};
								},
							),
							email: (userIdToUserInformation.get(userId) as any).email,
							name: (userIdToUserInformation.get(userId) as any).name,
							toWatchList: (await prisma.toWatchEntry.findMany({ where: { userId: userId } })).map((movieEntry) => {
								return {
									movie: movieIdToMovieInformation.get(movieEntry.movieId),
									weight: movieEntry.weight,
								};
							}),
						},
					];
				}),
			)) as any,
		),
	);

	return {
		props: {
			allUserInformation: JSON.parse(JSON.stringify(allUserInformation)),
			userClientInfo: user ? JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))) : null,
		},
	};
};

export default getEverythingAsServerSideProp;
