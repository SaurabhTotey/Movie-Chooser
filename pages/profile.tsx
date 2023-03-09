import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
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

function Profile({
	userClientInfo,
	userToWatchList,
	userAlreadyWatchedList,
}: InferGetServerSidePropsType<typeof getUserAndListsServerSideProps>) {
	const router = useRouter();
	const [userName, setUserName] = useState(userClientInfo.name);
	const [toWatchList, setToWatchList] = useState(userToWatchList);
	const [alreadyWatchedList, setAlreadyWatchedList] = useState(userAlreadyWatchedList);
	const [cookie, setCookie, removeCookie] = useCookies(["session"]);
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
							{toWatchList &&
								toWatchList.map((entry: any) => (
									<MovieCard key={entry.movie.id} movie={entry.movie}>
										<div className={style["movieCardFormContainer"]}>
											<form>
												<label>Weight</label>
												<input
													aria-live="polite"
													defaultValue={entry.weight}
													id={`weightInputFor${entry.movie.id}`}
													min={0}
													step={0.1}
													type="number"
												/>
												<button
													aria-controls={`weightInputFor${entry.movie.id} formStatusForToWatchMovie${entry.movie.id}`}
													id={`changeWeightButtonFor${entry.movie.id}`}
													type="submit"
													onClick={(event) => {
														event.preventDefault();
														const self = document.getElementById(
															`changeWeightButtonFor${entry.movie.id}`,
														) as HTMLButtonElement;
														self.disabled = true;

														const weightInput = document.getElementById(
															`weightInputFor${entry.movie.id}`,
														) as HTMLInputElement;
														const formStatus = document.getElementById(`formStatusForToWatchMovie${entry.movie.id}`)!;
														axios
															.post("/api/movie/change-weight", {
																id: entry.movie.id,
																weight: weightInput.valueAsNumber,
															})
															.then((response) => {
																weightInput.valueAsNumber = response.data;
																formStatus.innerText = `Successfully set weight to ${response.data}.`;
																setToWatchList(
																	toWatchList.map((e: any) => {
																		if (e.id == entry.id) {
																			return {
																				...e,
																				weight: response.data,
																			};
																		}
																		return e;
																	}),
																);
																self.disabled = false;
															})
															.catch((error) => {
																formStatus.innerText = error.response.data;
																self.disabled = false;
															});
													}}
												>
													Submit New Weight
												</button>
											</form>
											<button
												aria-controls={`formStatusForToWatchMovie${entry.movie.id}`}
												id={`deleteFromWatchListButtonFor${entry.movie.id}`}
												type="submit"
												onClick={(event) => {
													event.preventDefault();
													const self = document.getElementById(
														`deleteFromWatchListButtonFor${entry.movie.id}`,
													) as HTMLButtonElement;
													self.disabled = true;

													axios
														.post("/api/movie/remove-from-watch-list", {
															id: entry.movie.id,
														})
														.then(() => {
															setToWatchList(toWatchList.filter((e: any) => e.movie.id != entry.movie.id));
														})
														.catch((error) => {
															document.getElementById(`formStatusForToWatchMovie${entry.movie.id}`)!.innerText =
																error.response.data;
														});
												}}
											>
												❌
											</button>
										</div>
										<p aria-live="polite" id={`formStatusForToWatchMovie${entry.movie.id}`}></p>
									</MovieCard>
								))}
						</CollapsibleSection>
						<CollapsibleSection title="Already Watched List">
							{alreadyWatchedList &&
								alreadyWatchedList.map((entry: any) => (
									<MovieCard key={entry.id} movie={entry.movie}>
										<p>
											Watched on {entry.date}. From the list of {entry.originatorName}.
										</p>
										<div className={style["movieCardFormContainer"]}>
											<form>
												<label>Rating</label>
												<input
													aria-live="polite"
													defaultValue={entry.rating}
													id={`ratingInputFor${entry.id}`}
													max={10}
													min={0}
													step={0.1}
													type="number"
												/>
												<button
													aria-controls={`ratingInputFor${entry.id} formStatusForWatchedEntry${entry.id}`}
													id={`changeRatingButtonFor${entry.id}`}
													type="submit"
													onClick={(event) => {
														event.preventDefault();
														const self = document.getElementById(
															`changeRatingButtonFor${entry.id}`,
														) as HTMLButtonElement;
														self.disabled = true;

														const ratingInput = document.getElementById(
															`ratingInputFor${entry.id}`,
														) as HTMLInputElement;
														const formStatus = document.getElementById(`formStatusForWatchedEntry${entry.id}`)!;
														axios
															.post("/api/movie/change-rating", {
																id: entry.id,
																rating: ratingInput.valueAsNumber,
															})
															.then((response) => {
																ratingInput.valueAsNumber = response.data;
																formStatus.innerText = `Successfully set rating to ${response.data}.`;
																setAlreadyWatchedList(
																	alreadyWatchedList.map((e: any) => {
																		if (e.id == entry.id) {
																			return {
																				...e,
																				rating: response.data,
																			};
																		}
																		return e;
																	}),
																);
																self.disabled = false;
															})
															.catch((error) => {
																formStatus.innerText = error.response.data;
																self.disabled = false;
															});
													}}
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
													const self = document.getElementById(
														`deleteFromWatchedListButtonFor${entry.id}`,
													) as HTMLButtonElement;
													self.disabled = true;

													axios
														.post("/api/movie/remove-from-watched-list", {
															id: entry.id,
														})
														.then(() => {
															setAlreadyWatchedList(alreadyWatchedList.filter((e: any) => e.id != entry.id));
														})
														.catch((error) => {
															document.getElementById(`formStatusForWatchedEntry${entry.id}`)!.innerText =
																error.response.data;
														});
												}}
											>
												❌
											</button>
										</div>
										<p aria-live="polite" id={`formStatusForWatchedEntry${entry.id}`}></p>
									</MovieCard>
								))}
						</CollapsibleSection>
						<AccountForm
							fieldNamesToFieldTypes={new Map()}
							initialDirective="Press button to log out."
							onSubmit={async (submitButton, updateTextContainer) => {
								submitButton.disabled = true;

								axios
									.post("/api/account/log-out")
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"You have been signed out. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
							title="Log Out"
						/>
						<AccountForm
							fieldNamesToFieldTypes={
								new Map([
									["Name", "text"],
									["Password", "password"],
								])
							}
							initialDirective="Enter your new name and your password to change the name associated with your account."
							onSubmit={async (submitButton, updateTextContainer, inputs) => {
								submitButton.disabled = true;

								const nameInput = inputs.get("Name")!;
								if (!nameInput.value) {
									updateTextContainer.textContent = "Cannot change name to an empty name.";
									submitButton.disabled = false;
									return;
								}

								const passwordInput = inputs.get("Password")!;
								if (!passwordInput.value) {
									updateTextContainer.textContent = "Cannot change user name without password.";
									submitButton.disabled = false;
									return;
								}

								axios
									.post("/api/account/change-name", { name: nameInput.value, password: passwordInput.value })
									.then((response) => {
										updateTextContainer.textContent = "Your name has been changed!";
										setUserName(nameInput.value);
										submitButton.disabled = false;
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
							title="Change Name"
						/>
						<AccountForm
							fieldNamesToFieldTypes={new Map([["Password", "password"]])}
							initialDirective="Enter your password to delete your account."
							onSubmit={async (submitButton, updateTextContainer, inputs) => {
								submitButton.disabled = true;

								const passwordInput = inputs.get("Password")!;
								if (!passwordInput.value) {
									updateTextContainer.textContent = "Cannot delete an account without the password.";
									submitButton.disabled = false;
									return;
								}

								axios
									.post("/api/account/delete-account", { password: passwordInput.value })
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"Account has been deleted. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
							title="Delete Account"
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
