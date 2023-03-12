import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Cookies, useCookies } from "react-cookie";
import AccountForm from "../components/AccountForm";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import deleteStaleSessions from "../helpers/DeleteStaleSessions";
import { prisma } from "../helpers/GetPrismaClient";
import { getMovieInformationFor } from "../helpers/MovieApiManager";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/profile.module.css";

const getUserAndListsServerSideProps: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
	await deleteStaleSessions();
	if (!sessionId) {
		return {
			props: {
				userAlreadyWatchedList: null,
				userClientInfo: null,
				userToWatchList: null,
			},
		};
	}
	const getUserPromise = prisma.session
		.findUnique({
			where: {
				token: sessionId,
			},
		})
		.User();
	const user = (await getUserPromise)!;
	const toWatchEntries = await getUserPromise.ToWatchEntry();
	const watchedEntries = await getUserPromise.WatchedEntry();
	const allMovieIds = Array.from(
		new Set(
			toWatchEntries
				.map((toWatchEntry) => toWatchEntry.movieId)
				.concat(watchedEntries.map((watchedEntry) => watchedEntry.movieId)),
		),
	);
	const movieIdToMovieInformation = new Map(
		(await Promise.all(allMovieIds.map(async (movieId) => [movieId, await getMovieInformationFor(movieId)]))) as any,
	);
	const allOriginatorIds = Array.from(new Set(watchedEntries.map((watchedEntry) => watchedEntry.originatorId)));
	const originatorIdToName = new Map(
		(await Promise.all(
			allOriginatorIds.map(async (originatorId) => [
				originatorId,
				(await prisma.user.findUnique({ where: { id: originatorId } }))!.name,
			]),
		)) as any,
	);
	const userToWatchList = toWatchEntries.map((entry) => {
		return { movie: movieIdToMovieInformation.get(entry.movieId), weight: entry.weight };
	});
	const userAlreadyWatchedList = watchedEntries.map((entry) => {
		return {
			date: new Intl.DateTimeFormat("en-US").format(entry.watched),
			id: entry.id,
			movie: movieIdToMovieInformation.get(entry.movieId),
			originatorName: originatorIdToName.get(entry.originatorId),
			rating: entry.rating,
		};
	});
	return {
		props: {
			userAlreadyWatchedList: JSON.parse(JSON.stringify(userAlreadyWatchedList)),
			userClientInfo: JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))),
			userToWatchList: JSON.parse(JSON.stringify(userToWatchList)),
		},
	};
};

const ToWatchMovie = ({
	entry,
	onUpdate,
	onRemove,
}: {
	entry: any;
	onUpdate: (values: any) => void;
	onRemove: () => void;
}) => {
	const [weight, setWeight] = useState(entry.weight);
	const [statusText, setStatusText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

	useEffect(() => {
		setWeight(entry.weight);
	}, [entry.weight]);

	return (
		<MovieCard movie={entry.movie}>
			<div className={style["movieCardFormContainer"]}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						setIsSubmitting(true);

						axios
							.post("/api/movie/change-weight", {
								id: entry.movie.id,
								weight,
							})
							.then((response) => {
								setStatusText(`Successfully set weight to ${response.data}.`);
								onUpdate({ ...entry, weight: response.data });
							})
							.catch((error) => {
								setStatusText(error.response.data);
							})
							.finally(() => {
								setIsSubmitting(false);
							});
					}}
				>
					<label>Weight</label>
					<input
						aria-live="polite"
						id={`weightInputFor${entry.movie.id}`}
						min={0}
						step={0.1}
						type="number"
						value={weight}
						onChange={(event) => {
							setWeight(event.target.valueAsNumber);
						}}
					/>
					<button
						aria-controls={`weightInputFor${entry.movie.id} formStatusForToWatchMovie${entry.movie.id}`}
						disabled={isSubmitting}
						id={`changeWeightButtonFor${entry.movie.id}`}
						type="submit"
					>
						Submit New Weight
					</button>
				</form>

				<button
					aria-controls={`formStatusForToWatchMovie${entry.movie.id}`}
					disabled={isSubmittingDelete}
					id={`deleteFromWatchListButtonFor${entry.movie.id}`}
					type="submit"
					onClick={(event) => {
						event.preventDefault();
						setIsSubmittingDelete(true);

						axios
							.post("/api/movie/remove-from-watch-list", {
								id: entry.movie.id,
							})
							.then(() => onRemove())
							.catch((error) => {
								setStatusText(error.response.data);
							})
							.finally(() => {
								setIsSubmittingDelete(false);
							});
					}}
				>
					❌
				</button>
			</div>
			<p aria-live="polite" id={`formStatusForToWatchMovie${entry.movie.id}`}>
				{statusText}
			</p>
		</MovieCard>
	);
};

const ToWatchList = ({ defaultToWatchList }: { defaultToWatchList: any[] }) => {
	const [toWatchList, setToWatchList] = useState(defaultToWatchList);
	return (
		<>
			{toWatchList.map((entry) => (
				<ToWatchMovie
					key={entry.movie.id}
					entry={entry}
					onRemove={() => {
						setToWatchList(toWatchList.filter((e: any) => e.movie.id !== entry.movie.id));
					}}
					onUpdate={(values: any) => {
						setToWatchList((prev) =>
							prev.map((e: any) => {
								if (e.movie.id === values.movie.id) {
									return values;
								}
								return e;
							}),
						);
					}}
				/>
			))}
		</>
	);
};

const WatchedMovie = ({
	entry,
	onUpdate,
	onRemove,
}: {
	entry: any;
	onUpdate: (values: any) => void;
	onRemove: () => void;
}) => {
	const [rating, setRating] = useState(entry.rating);
	const [statusText, setStatusText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

	useEffect(() => {
		setRating(entry.rating);
	}, [entry.rating]);

	return (
		<MovieCard movie={entry.movie}>
			<p>
				Watched on {entry.date}. From the list of {entry.originatorName}.
			</p>
			<div className={style["movieCardFormContainer"]}>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						setIsSubmitting(true);

						axios
							.post("/api/movie/change-rating", {
								id: entry.id,
								rating: rating,
							})
							.then((response) => {
								setStatusText(`Successfully set rating to ${response.data}.`);
								onUpdate({ ...entry, rating: response.data });
							})
							.catch((error) => {
								setStatusText(error.response.data);
							})
							.finally(() => {
								setIsSubmitting(false);
							});
					}}
				>
					<label>Rating</label>
					<input
						aria-live="polite"
						id={`ratingInputFor${entry.id}`}
						max={10}
						min={0}
						step={0.1}
						type="number"
						value={rating}
						onChange={(e) => setRating(e.target.value)}
					/>
					<button
						aria-controls={`ratingInputFor${entry.id} formStatusForWatchedEntry${entry.id}`}
						disabled={isSubmitting}
						id={`changeRatingButtonFor${entry.id}`}
						type="submit"
					>
						Submit New Rating
					</button>
				</form>
				<button
					aria-controls={`formStatusForWatchedEntry${entry.id}`}
					id={`deleteFromWatchedListButtonFor${entry.id}`}
					type="submit"
					onClick={(event) => {
						event.preventDefault();
						setIsSubmittingDelete(true);

						axios
							.post("/api/movie/remove-from-watched-list", {
								id: entry.id,
							})
							.then(() => {
								onRemove();
							})
							.catch((error) => {
								setStatusText(error.response.data);
							})
							.finally(() => {
								setIsSubmittingDelete(false);
							});
					}}
				>
					❌
				</button>
			</div>
			<p aria-live="polite" id={`formStatusForWatchedEntry${entry.id}`}>
				{statusText}
			</p>
		</MovieCard>
	);
};

const WatchedList = ({ defaultWatchedList }: { defaultWatchedList: any[] }) => {
	const [alreadyWatchedList, setAlreadyWatchedList] = useState(defaultWatchedList);

	return (
		<>
			{alreadyWatchedList.map((entry: any) => (
				<WatchedMovie
					key={entry.id}
					entry={entry}
					onRemove={() => {
						setAlreadyWatchedList(alreadyWatchedList.filter((e: any) => e.id != entry.id));
					}}
					onUpdate={(values) => {
						setAlreadyWatchedList(
							alreadyWatchedList.map((e: any) => {
								if (e.movie.id == entry.movie.id) {
									return values;
								}
								return e;
							}),
						);
					}}
				/>
			))}
		</>
	);
};

function Profile({
	userClientInfo,
	userToWatchList,
	userAlreadyWatchedList,
}: InferGetServerSidePropsType<typeof getUserAndListsServerSideProps>) {
	const router = useRouter();
	const [userName, setUserName] = useState(userClientInfo.name);
	const [cookie, setCookie, removeCookie] = useCookies(["session"]);

	const [logoutStatus, setLogoutStatus] = useState("Press button to log out.");
	const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

	const [changeNameStatus, setChangeNameStatus] = useState(
		"Enter your new name and your password to change the name associated with your account.",
	);
	const [isSubmittingChangeName, setIsSubmittingChangeName] = useState(false);

	const [deletePasswordStatus, setDeletePasswordStatus] = useState("Enter your password to delete your account.");
	const [isSubmittingDeletePassword, setIsSubmittingDeletePassword] = useState(false);

	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<h2>Hello, {userName}</h2>
						<p>
							Email: <a href={`mailto:${userClientInfo.email}`}>{userClientInfo.email}</a>
						</p>
						<CollapsibleSection isExpandedToBegin={true} title="Watch List">
							{userToWatchList && <ToWatchList defaultToWatchList={userToWatchList} />}
						</CollapsibleSection>
						<CollapsibleSection title="Already Watched List">
							{userAlreadyWatchedList && <WatchedList defaultWatchedList={userAlreadyWatchedList} />}
						</CollapsibleSection>
						<AccountForm
							disabled={isSubmittingLogout}
							fieldNamesToFieldTypes={new Map()}
							statusText={logoutStatus}
							title="Log Out"
							onSubmit={async () => {
								setIsSubmittingLogout(true);

								axios
									.post("/api/account/log-out")
									.then((response) => {
										removeCookie("session");
										setLogoutStatus("You have been signed out. You are being redirected to the account creation page.");
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										setLogoutStatus(error.response.data);
									})
									.finally(() => {
										setIsSubmittingLogout(false);
									});
							}}
						/>
						<AccountForm
							disabled={isSubmittingChangeName}
							fieldNamesToFieldTypes={
								new Map([
									["Name", "text"],
									["Password", "password"],
								])
							}
							statusText={changeNameStatus}
							title="Change Name"
							onSubmit={async (inputs) => {
								setIsSubmittingChangeName(true);

								const { Name: name, Password: password } = inputs;

								if (!name) {
									setChangeNameStatus("Cannot change name to an empty name.");
									setIsSubmittingChangeName(false);
									return;
								}

								if (!password) {
									setChangeNameStatus("Cannot change user name without password.");
									setIsSubmittingChangeName(false);
									return;
								}

								axios
									.post("/api/account/change-name", { name, password })
									.then((response) => {
										setChangeNameStatus("Your name has been changed!");
										setUserName(name);
									})
									.catch((error) => {
										setChangeNameStatus(error.response.data);
									})
									.finally(() => {
										setIsSubmittingChangeName(false);
									});
							}}
						/>
						<AccountForm
							disabled={isSubmittingDeletePassword}
							fieldNamesToFieldTypes={new Map([["Password", "password"]])}
							statusText={deletePasswordStatus}
							title="Delete Account"
							onSubmit={async (inputs) => {
								setIsSubmittingDeletePassword(true);

								const { Password: password } = inputs;
								if (!password) {
									setDeletePasswordStatus("Cannot delete an account without the password.");
									setIsSubmittingDeletePassword(false);
									return;
								}

								axios
									.post("/api/account/delete-account", { password })
									.then((response) => {
										removeCookie("session");
										setDeletePasswordStatus(
											"Account has been deleted. You are being redirected to the account creation page.",
										);
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										setDeletePasswordStatus(error.response.data);
									})
									.finally(() => {
										setIsSubmittingDeletePassword(false);
									});
							}}
						/>
					</>
				) : (
					<p>
						You are not logged in. You can log in or create an account{" "}
						<Link href="./log-in-or-create-account">here</Link>.
					</p>
				)}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAndListsServerSideProps;
export default Profile;
