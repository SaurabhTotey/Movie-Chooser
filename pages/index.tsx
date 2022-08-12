import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";
import style from "../styles/index.module.css";

function Home({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2>About this Site</h2>
				<p className={style["textParagraph"]}>
					This page is a wall of useless text followed by all the user movie lists registered on this site.
				</p>
				<h3>General</h3>
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
				<h3>Accounts</h3>
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
				<h3>Movie Lists</h3>
				<p className={style["textParagraph"]}>
					Each account has two movie lists: a to-watch list and an already-watched list. The to-watch list of a user is
					the list of movies that can be selected on the party page. The already-watched list is the list of movies that
					the user has already seen in a party. Both lists for a user are visible on their{" "}
					<Link href="./profile">
						<a>profile page</a>
					</Link>
					, where any entry can be deleted freely.
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
					.
				</p>
				<p className={style["textParagraph"]}>
					The already-watched list of a user stores information about a user&apos;s experience watching a given movie.
					Movies can make duplicate appearances as users can watch movies multiple times. The user can rate a watched
					movie on their{" "}
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
				<h3>Party</h3>
				<h3>Weights</h3>
				<h3>Ratings</h3>
				<h3>Statistics</h3>
				<CollapsibleSection title="User Lists">
					TODO: display a collapsible section for each user where each section has a list of their to-watch list and
					already watched list; the to-watch list should show the movie title and its relative chance of getting chosen,
					and the already-watched list should show the watched date and the rating.
				</CollapsibleSection>
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Home;
