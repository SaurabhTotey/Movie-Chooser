import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Cookies } from "react-cookie";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import deleteStaleSessions from "../helpers/DeleteStaleSessions";
import { prisma } from "../helpers/GetPrismaClient";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/party.module.css";

const getAllUsersServerSideProps: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
	await deleteStaleSessions();
	if (!sessionId) {
		return {
			props: {
				userClientInfo: null,
				userInformation: [],
			},
		};
	}
	const user = await prisma.session
		.findUnique({
			where: {
				token: sessionId,
			},
		})
		.User();
	if (!user) {
		return {
			props: {
				userClientInfo: null,
				userInformation: [],
			},
		};
	}
	const userList = await prisma.user.findMany();
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))),
			userInformation: userList.map((userEntry) => {
				return {
					id: userEntry.id,
					name: userEntry.name,
					email: userEntry.email,
				};
			}),
		},
	};
};

function Party({ userClientInfo, userInformation }: InferGetServerSidePropsType<typeof getAllUsersServerSideProps>) {
	const [movieSelectionInformation, setMovieSelectionInformation] = useState<
		[number[], Date, MovieApiMovieInformation] | null
	>(null);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<div id={style["userSelectionFormContainer"]}>
							<form id={style["userSelectionForm"]}>
								<div>
									<h2>Select Users Who Will Be Watching Movies</h2>
									{userInformation.map((info: any) => (
										<div className={style["userCheckBoxContainer"]} key={info.id}>
											<label htmlFor={`checkboxFor${info.id}`}>{info.name}</label>
											<input
												id={`checkboxFor${info.id}`}
												type="checkbox"
												value={info.id}
												disabled={userClientInfo.email == info.email}
												defaultChecked={userClientInfo.email == info.email}
											/>
										</div>
									))}
								</div>
								<button
									id="chooseMovieButton"
									type="submit"
									aria-controls={`${style["movieChoosingStatus"]} movieCardContainer`}
									onClick={(event) => {
										event.preventDefault();
										const self = document.getElementById("chooseMovieButton") as HTMLButtonElement;
										self.disabled = true;
										const movieChoosingStatusElement = document.getElementById(style["movieChoosingStatus"])!;
										movieChoosingStatusElement.innerText = "Choosing a movie...";

										const selectionTime = new Date();

										const userSelectionCheckboxes = Array.from(
											document.getElementById(style["userSelectionForm"])!.getElementsByTagName("input"),
										);
										const selectedIds = userSelectionCheckboxes
											.filter((checkbox) => checkbox.checked)
											.map((checkbox) => parseInt(checkbox.value));

										axios
											.post("/api/party/select-random-movie", {
												userIds: selectedIds,
											})
											.then((response) => {
												const selectedRandomMovie = response.data;
												setMovieSelectionInformation([selectedIds, selectionTime, selectedRandomMovie]);
												const markAsWatchedButton = document.getElementById("markAsWatchedButton") as HTMLButtonElement;
												if (markAsWatchedButton) {
													markAsWatchedButton.disabled = false;
												}
												movieChoosingStatusElement.innerText = "Selected movie is displayed below.";
												self.disabled = false;
											})
											.catch((error) => {
												movieChoosingStatusElement.innerText = error.response.data;
												self.disabled = false;
											});
									}}
								>
									{movieSelectionInformation ? "CHOOSE ANOTHER MOVIE!!!" : "CHOOSE MOVIE!!!"}
								</button>
							</form>
						</div>
						<p id={style["movieChoosingStatus"]} aria-live="polite">
							Select users who will be watching a movie and then submit to get a random movie.
						</p>
						<div id="movieCardContainer" aria-live="polite">
							{movieSelectionInformation && (
								<MovieCard movie={movieSelectionInformation[2]}>
									<div id={style["markAsWatchedButtonContainer"]}>
										<button
											id="markAsWatchedButton"
											type="submit"
											aria-controls={style["markAsWatchedStatus"]}
											onClick={(event) => {
												event.preventDefault();
												const self = document.getElementById("markAsWatchedButton") as HTMLButtonElement;
												self.disabled = true;
												const markAsWatchedStatusElement = document.getElementById(style["markAsWatchedStatus"])!;
												markAsWatchedStatusElement.innerText = "Marking movie as watched.";

												axios
													.post("/api/party/make-movie-watched-for-users", {
														id: movieSelectionInformation[2].id,
														userIds: movieSelectionInformation[0],
														date: movieSelectionInformation[1],
													})
													.then((response) => {
														markAsWatchedStatusElement.innerText = "Movie has been marked as watched for all viewers!";
													})
													.catch((error) => {
														markAsWatchedStatusElement.innerText = error.response.data;
														self.disabled = false;
													});
											}}
										>
											Mark as Watched for All Viewers
										</button>
									</div>
									<p id={style["markAsWatchedStatus"]} aria-live="polite">
										Click the above button if y&apos;all watched the movie.
									</p>
								</MovieCard>
							)}
						</div>
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

export const getServerSideProps = getAllUsersServerSideProps;
export default Party;
