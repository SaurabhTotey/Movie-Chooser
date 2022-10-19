import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import getAllUsersAsServerSideProp from "../helpers/GetAllUsersAsServerSideProp";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/party.module.css";

function Party({ allUsers, userClientInfo }: InferGetServerSidePropsType<typeof getAllUsersAsServerSideProp>) {
	const [movieSelectionInformation, setMovieSelectionInformation] = useState<
		[number[], Date, MovieApiMovieInformation, number] | null
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
									{allUsers.map((userInformation: any) => (
										<div key={userInformation.id} className={style["userCheckBoxContainer"]}>
											<input
												defaultChecked={userClientInfo.email == userInformation.email}
												disabled={userClientInfo.email == userInformation.email}
												id={`checkboxFor${userInformation.id}`}
												type="checkbox"
												value={userInformation.id}
											/>
											<label htmlFor={`checkboxFor${userInformation.id}`}>{userInformation.name}</label>
										</div>
									))}
								</div>
								<button
									aria-controls={`${style["movieChoosingStatus"]} movieCardContainer`}
									id="chooseMovieButton"
									type="submit"
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
												const [selectedRandomMovie, originatorId] = response.data;
												setMovieSelectionInformation([selectedIds, selectionTime, selectedRandomMovie, originatorId]);
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
						<p aria-live="polite" id={style["movieChoosingStatus"]}>
							Select users who will be watching a movie and then submit to get a random movie.
						</p>
						<div aria-live="polite" id="movieCardContainer">
							{movieSelectionInformation && (
								<MovieCard isExpandedToBegin={true} movie={movieSelectionInformation[2]}>
									<p id={style["originatorText"]}>
										From the list of{" "}
										{allUsers.find((userInfo: any) => userInfo.id == movieSelectionInformation[3]).name}.
									</p>
									<div id={style["markAsWatchedButtonContainer"]}>
										<button
											aria-controls={style["markAsWatchedStatus"]}
											id="markAsWatchedButton"
											type="submit"
											onClick={(event) => {
												event.preventDefault();
												const self = document.getElementById("markAsWatchedButton") as HTMLButtonElement;
												self.disabled = true;
												const markAsWatchedStatusElement = document.getElementById(style["markAsWatchedStatus"])!;
												markAsWatchedStatusElement.innerText = "Marking movie as watched.";

												axios
													.post("/api/party/make-movie-watched-for-users", {
														date: movieSelectionInformation[1],
														id: movieSelectionInformation[2].id,
														originatorId: movieSelectionInformation[3],
														userIds: movieSelectionInformation[0],
													})
													.then((response) => {
														markAsWatchedStatusElement.innerText =
															"Movie has been marked as watched for all viewers! Each viewer can rate the movie on their profile page (once signed in)!";
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
									<p aria-live="polite" id={style["markAsWatchedStatus"]}>
										Click the above button if y&apos;all watched the movie.
									</p>
								</MovieCard>
							)}
						</div>
					</>
				) : (
					<p>
						You are not logged in. You can log in or create an account{" "}
						<Link href="./log-in-or-create-account">
							<a>here</a>
						</Link>
						.
					</p>
				)}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getAllUsersAsServerSideProp;
export default Party;
