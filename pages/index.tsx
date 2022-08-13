import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { Cookies } from "react-cookie";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import deleteStaleSessions from "../helpers/DeleteStaleSessions";
import { prisma } from "../helpers/GetPrismaClient";
import { getMovieInformationFor } from "../helpers/MovieApiManager";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/index.module.css";

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
										date: movieEntry.watched,
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
	console.log(userIdsToLists);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2 className={style["title"]}>About this Site</h2>
				<p className={style["textParagraph"]}>
					This page is a wall of useless text that no one will read followed by all the user movie lists registered on
					this site.
				</p>
				<h3 className={style["title"]}>General</h3>
				<p className={style["textParagraph"]}>
					This is a site for choosing movies to watch when watching movies as a group. Oftentimes, selecting movies in a
					group setting can be difficult: different people want to watch different movies. This site allows users to
					input movies they want to watch and then have the site randomly and fairly select a movie to watch.
				</p>
				<p className={style["textParagraph"]}>
					An account is necessary to store a list of movies to watch. One can log in or create an account on{" "}
					<Link href="./log-in-or-create-account">
						<a>this page</a>
					</Link>
					. Much of the functionality of this site requires the user to be signed in. A user can log out on the{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					. The{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>{" "}
					can also be used to see the user&apos;s to-watch and already-watched movie lists.
				</p>
				<p className={style["textParagraph"]}>
					Once logged in, a user can add movies to their to-watch list on the{" "}
					<Link href="./add-movie">
						<a>add-movie page</a>
					</Link>
					. A movie&apos;s weight is the chance it will get chosen relative to the other movies in the user&apos;s
					to-watch list; a larger weight means a higher relative chance of getting chosen.
				</p>
				<p className={style["textParagraph"]}>
					To actually select a movie to watch, a user must be signed in, and all movie-watchers should have accounts.
					Then, the signed-in user should navigate to the{" "}
					<Link href="./party">
						<a>party page</a>
					</Link>
					, select all movie-watchers, and then allow the site to choose a movie to watch. From there, the selected
					movie can be marked as watched for all movie-viewers (who can then later rate the movie on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					), and/or another movie can be chosen.
				</p>
				<p className={style["textParagraph"]}>
					Statistics can be viewed on the{" "}
					<Link href="./statistics.tsx">
						<a>stats page</a>
					</Link>
					. Statistics are purely for fun and are based off of movie ratings (so rate movies for fun statistics maybe).
				</p>
				<h3 className={style["title"]}>Accounts</h3>
				<p className={style["textParagraph"]}>
					An account allows one full functionality of this website. To log in or create an account, use{" "}
					<Link href="./log-in-or-create-account">
						<a>this page</a>
					</Link>
					. Logging in to an account stores a cookie that will last a week. Emails and passwords are case-sensitive.
					Emails would ideally be valid (in case future functionality takes advantage of them), but currently do not
					need to be.
				</p>
				<p className={style["textParagraph"]}>
					In terms of security, this website utilizes the piss-poor strategy of hoping all the users act in good faith.
					This is due to the assumption that this will be hosted locally and only a specific handful of people will use
					this. Do not put sensitive information into this website. Passwords are hashed, but caution should still be
					exercised. Please don&apos;t game what this website allows since it is based on trust.
				</p>
				<h3 className={style["title"]}>Movie Lists</h3>
				<p className={style["textParagraph"]}>
					Each account has two movie lists: a to-watch list and an already-watched list. The to-watch list of a user is
					the list of movies that can be selected on the party page. The already-watched list is the list of movies that
					the user has already seen in a party. Both lists for a user are visible on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					, where any entry can be deleted freely or modified in certain aspects. All lists are also visible on this
					page regardless of whether the user is signed in, but the lists and entries cannot be modified here.
				</p>
				<p className={style["textParagraph"]}>
					The to-watch list of a user corresponds each movie with a weight that signifies the movie&apos;s relative
					chance of being chosen. Each movie can only appear in a user&apos;s to-watch list once. A higher weight for a
					movie means a higher chance of that movie being chosen if the user&apos;s list is chosen. Weights are relative
					to the weights of other entries in a to-watch list. Movies can be added to the signed-in user&apos;s to-watch
					list on the{" "}
					<Link href="./add-movie">
						<a>add-movie page</a>
					</Link>
					. Weights can be changed by adding the movie again with a different weight or by updating it in the{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					.
				</p>
				<p className={style["textParagraph"]}>
					The already-watched list of a user stores information about a user&apos;s experience watching a given movie.
					Movies can make duplicate appearances as users can watch movies multiple times. The user add their rating or
					change their rating for a watched movie on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					. Entries to this list should ideally only be added from the{" "}
					<Link href="./party">
						<a>party page</a>
					</Link>
					, but manual additions can be made from the{" "}
					<Link href="./add-movie">
						<a>add-movie page</a>
					</Link>
					.
				</p>
				<h3 className={style["title"]}>Party</h3>
				<p className={style["textParagraph"]}>
					The main magic of this site happens on the{" "}
					<Link href="./party">
						<a>party page</a>
					</Link>
					, which requires the user to be signed in. The user then selects all users who will be watching movies. After
					that, the user is free to let the site choose a random movie. After the site chooses a movie, the user can
					mark the movie as watched for all users who were marked as watching at the time that the movie was chosen. In
					that case, any users who have the movie marked as watched will also have the movie removed from their to-watch
					list.
				</p>
				<p className={style["textParagraph"]}>
					The algorithm for choosing a movie is as follows. Every user who is watching and has a non-empty to-watch list
					with total weight greater than 0 has an equal chance of their to-watch list being picked. Once a list is
					picked, the list&apos;s weightings are used to determine how likely each movie is. A movie is then chosen
					according to this likelihood. The intricacies of weights are described in the next section.
				</p>
				<h3 className={style["title"]}>Weights</h3>
				<p className={style["textParagraph"]}>
					Weights apply solely to movies in to-watch lists, and are relative to other weights within the same list. For
					a movie, <span>{"\\(i\\)"}</span>, with weight <span>{"\\(w_i\\)"}</span>, it&apos;s probability of being
					chosen, <span>{"\\(\\mathcal{P}(i)\\)"}</span>, is{" "}
					<span>
						{
							"\\[\\mathcal{P}(i) = \\begin{cases} \\frac{w_i}{\\sum_j w_j} &\\qquad \\sum_j w_j \\neq 0 \\\\ 0 &\\qquad \\text{otherwise} \\end{cases}\\]"
						}
					</span>
					where <span>{"\\(\\sum_j w_j\\)"}</span> is the total sum of the weight for a single to-watch list. The chance
					of any specific to-watch list being used is equal for each user whose total to-watch list weight is greater
					than 0. If a user&apos;s to-watch list total weight comes out to 0, their list will not be chosen.
				</p>
				<p className={style["textParagraph"]}>
					Weights for a signed-in user&apos;s to-watch list can be managed on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					.
				</p>
				<h3 className={style["title"]}>Ratings</h3>
				<p className={style["textParagraph"]}>
					Ratings of watched movies should reflect one&apos;s enjoyment of that experience and need not necessarily be
					ratings of the movies as a whole. Therefore, a movie can be seen multiple times and have multiple different
					ratings depending one&apos;s enjoyment each time. The ratings do not matter at all and are only used for fun
					statistics.
				</p>
				<p className={style["textParagraph"]}>
					Ratings for a signed-in user&apos;s already-watched list can be managed on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					.
				</p>
				<h3 className={style["title"]}>Statistics</h3>
				<p className={style["textParagraph"]}>
					Statistics are for fun only and should not be taken seriously. They can be viewed on the{" "}
					<Link href="./statistics">
						<a>statistics page</a>
					</Link>{" "}
					along with explanations.
				</p>
				<h2 className={style["title"]}>User Lists</h2>
				{userIdsToLists &&
					Object.keys(userIdsToLists).map((id) => {
						const toWatchListTotalWeight = userIdsToLists[id].toWatchList.reduce(
							(sum: number, current: any) => sum + current.weight,
							0,
						);
						return (
							<CollapsibleSection
								key={id}
								isExpandedToBegin={true}
								title={userIdsToLists[id].userName}
								titleHeadingLevel={3}
							>
								<p>
									Email: <a href={`mailto:${userIdsToLists[id].userEmail}`}>{userIdsToLists[id].userEmail}</a>
								</p>
								<CollapsibleSection isExpandedToBegin={true} title="Watch List" titleHeadingLevel={4}>
									{userIdsToLists[id].toWatchList.map((entry: any) => {
										return (
											<MovieCard
												key={`toWatchListFor${id}Movie${entry.movie.id}`}
												movie={entry.movie}
												titleHeadingLevel={5}
											>
												Relative chance of getting chosen:{" "}
												{toWatchListTotalWeight ? entry.weight / toWatchListTotalWeight : 0}
											</MovieCard>
										);
									})}
								</CollapsibleSection>
								<CollapsibleSection title="Already Watched List" titleHeadingLevel={4}>
									{userIdsToLists[id].alreadyWatchedList.map((entry: any) => {
										return (
											<MovieCard
												key={`alreadyWatchedListFor${id}Movie${entry.movie.id}`}
												movie={entry.movie}
												titleHeadingLevel={5}
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
