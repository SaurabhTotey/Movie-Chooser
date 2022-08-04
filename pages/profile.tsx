import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Cookies, useCookies } from "react-cookie";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import Form from "../components/Form";
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
				userClientInfo: null,
				userToWatchList: null,
				userAlreadyWatchedList: null,
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
	const userToWatchList = await Promise.all(
		toWatchEntries.map(async (entry) => {
			return { movie: await getMovieInformationFor(entry.movieId), weight: entry.weight };
		}),
	);
	const userAlreadyWatchedList = await Promise.all(
		watchedEntries.map(async (entry) => {
			return {
				id: entry.id,
				movie: await getMovieInformationFor(entry.movieId),
				date: new Intl.DateTimeFormat("en-US").format(entry.watched),
				rating: entry.rating,
			};
		}),
	);
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))),
			userToWatchList: JSON.parse(JSON.stringify(userToWatchList)),
			userAlreadyWatchedList: JSON.parse(JSON.stringify(userAlreadyWatchedList)),
		},
	};
};

function Profile({
	userClientInfo,
	userToWatchList,
	userAlreadyWatchedList,
}: InferGetServerSidePropsType<typeof getUserAndListsServerSideProps>) {
	const router = useRouter();
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
						<h2>Hello, {userClientInfo.name}</h2>
						<p>
							Email: <a href={`mailto:${userClientInfo.email}`}>{userClientInfo.email}</a>
						</p>
						<CollapsibleSection title="Watch List">
							{toWatchList &&
								toWatchList.map((entry: any) => (
									<MovieCard movie={entry.movie} key={entry.movie.id}>
										<div className={style["movieCardFormContainer"]}>
											<form>
												<label>Weight</label>
												<input
													type="number"
													id={`weightInputFor${entry.movie.id}`}
													defaultValue={entry.weight}
													min={0}
													step={0.1}
													aria-live="polite"
												/>
												<button
													id={`changeWeightButtonFor${entry.movie.id}`}
													aria-controls={`weightInputFor${entry.movie.id} formStatusForToWatchMovie${entry.movie.id}`}
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
															})
															.catch((error) => {
																formStatus.innerText = error.response.data;
															});

														self.disabled = false;
													}}
												>
													Submit New Weight
												</button>
											</form>
											<button
												id={`deleteFromWatchListButtonFor${entry.movie.id}`}
												aria-controls={`formStatusForToWatchMovie${entry.movie.id}`}
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
										<p id={`formStatusForToWatchMovie${entry.movie.id}`} aria-live="polite"></p>
									</MovieCard>
								))}
						</CollapsibleSection>
						<CollapsibleSection title="Already Watched List">
							{alreadyWatchedList &&
								alreadyWatchedList.map((entry: any) => (
									<MovieCard movie={entry.movie} key={entry.id}>
										<p>Watched on {entry.date}.</p>
										<div className={style["movieCardFormContainer"]}>
											<form>
												<label>Rating</label>
												<input
													type="number"
													id={`ratingInputFor${entry.id}`}
													defaultValue={entry.rating}
													min={0}
													max={10}
													step={0.1}
													aria-live="polite"
												/>
												<button
													id={`changeRatingButtonFor${entry.id}`}
													aria-controls={`ratingInputFor${entry.id} formStatusForWatchedEntry${entry.id}`}
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
															})
															.catch((error) => {
																formStatus.innerText = error.response.data;
															});

														self.disabled = false;
													}}
												>
													Submit New Rating
												</button>
											</form>
											<button
												id={`deleteFromWatchedListButtonFor${entry.id}`}
												aria-controls={`formStatusForWatchedEntry${entry.id}`}
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
										<p id={`formStatusForWatchedEntry${entry.id}`} aria-live="polite"></p>
									</MovieCard>
								))}
						</CollapsibleSection>
						<Form
							title="Log Out"
							initialDirective="Press button to log out."
							fieldNamesToFieldTypes={new Map()}
							submitHandler={async (submitButton, updateTextContainer) => {
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
						/>
						<Form
							title="Delete Account"
							initialDirective="Enter your password to delete your account."
							fieldNamesToFieldTypes={new Map([["Password", "password"]])}
							submitHandler={async (submitButton, updateTextContainer, inputs) => {
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
						/>
					</>
				) : (
					<>
						<p>
							You are not logged in. You can log in or create an account{" "}
							<Link href="./log-in-or-create-account">
								<a>here</a>
							</Link>
							.
						</p>
					</>
				)}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAndListsServerSideProps;
export default Profile;
