import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import getAllUsersAsServerSideProp from "../helpers/GetAllUsersAsServerSideProp";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/party.module.css";

const SelectedMovie = ({
	allUsers,
	movieSelectionInformation,
}: {
	allUsers: any;
	movieSelectionInformation: [number[], Date, MovieApiMovieInformation, number];
}) => {
	const defaultStatusText = "Click the above button if y'all watched the movie.";

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [statusText, setStatusText] = useState(defaultStatusText);
	const userName = useMemo(
		() => allUsers.find((userInfo: any) => userInfo.id == movieSelectionInformation[3]).name,
		[allUsers, movieSelectionInformation],
	);

	useEffect(() => {
		setIsSubmitting(false);
		setStatusText(defaultStatusText);
	}, [movieSelectionInformation]);

	return (
		<MovieCard isExpandedToBegin={true} movie={movieSelectionInformation[2]}>
			<p id={style["originatorText"]}>From the list of {userName}.</p>
			<div id={style["markAsWatchedButtonContainer"]}>
				<button
					aria-controls={style["markAsWatchedStatus"]}
					disabled={isSubmitting}
					id="markAsWatchedButton"
					type="submit"
					onClick={(event) => {
						event.preventDefault();

						setIsSubmitting(true);

						setStatusText('Marking movie as watched."');

						axios
							.post("/api/party/make-movie-watched-for-users", {
								date: movieSelectionInformation[1],
								id: movieSelectionInformation[2].id,
								originatorId: movieSelectionInformation[3],
								userIds: movieSelectionInformation[0],
							})
							.then((response) => {
								setStatusText(
									"Movie has been marked as watched for all viewers! Each viewer can rate the movie on their profile page (once signed in)!",
								);
							})
							.catch((error) => {
								setStatusText(error.response.data);
								setIsSubmitting(false);
							});
					}}
				>
					Mark as Watched for All Viewers
				</button>
			</div>
			<p aria-live="polite" id={style["markAsWatchedStatus"]}>
				{statusText}
			</p>
		</MovieCard>
	);
};

function Party({ allUsers, userClientInfo }: InferGetServerSidePropsType<typeof getAllUsersAsServerSideProp>) {
	const [movieSelectionInformation, setMovieSelectionInformation] = useState<
		[number[], Date, MovieApiMovieInformation, number] | null
	>(null);

	const [selectedUsers, setSelectedUsers] = useState<number[]>(() =>
		userClientInfo ? [allUsers.find((userInfo: any) => userInfo.email == userClientInfo.email).id] : [],
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [statusText, setStatusText] = useState("");

	const finalStatusText = useMemo(() => {
		if (statusText) {
			return statusText;
		}
		return movieSelectionInformation ? "CHOOSE ANOTHER MOVIE!!!" : "CHOOSE MOVIE!!!";
	}, [movieSelectionInformation, statusText]);

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
							<form
								id={style["userSelectionForm"]}
								onSubmit={(event) => {
									event.preventDefault();
									setIsSubmitting(true);
									setStatusText("Choosing a movie...");

									const selectionTime = new Date();

									if (selectedUsers.length === 0) {
										setStatusText("You must select at least one user to choose a movie for.");
										return;
									}

									axios
										.post("/api/party/select-random-movie", {
											userIds: selectedUsers,
										})
										.then((response) => {
											const [selectedRandomMovie, originatorId] = response.data;
											setMovieSelectionInformation([selectedUsers, selectionTime, selectedRandomMovie, originatorId]);
											setStatusText("Selected movie is displayed below.");
										})
										.catch((error) => {
											setStatusText(error.response.data);
										})
										.finally(() => {
											setIsSubmitting(false);
										});
								}}
							>
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
												onChange={(event) => {
													if (userClientInfo.email === userInformation.email) {
														return;
													}

													if (event.target.checked) {
														setSelectedUsers([...selectedUsers, userInformation.id]);
													} else {
														setSelectedUsers((prev) => prev.filter((id) => id != userInformation.id));
													}
												}}
											/>
											<label htmlFor={`checkboxFor${userInformation.id}`}>{userInformation.name}</label>
										</div>
									))}
								</div>
								<button
									aria-controls={`${style["movieChoosingStatus"]} movieCardContainer`}
									disabled={isSubmitting}
									id="chooseMovieButton"
									type="submit"
								>
									{finalStatusText}
								</button>
							</form>
						</div>
						<p aria-live="polite" id={style["movieChoosingStatus"]}>
							Select users who will be watching a movie and then submit to get a random movie.
						</p>
						<div aria-live="polite" id="movieCardContainer">
							{movieSelectionInformation && (
								<SelectedMovie allUsers={allUsers} movieSelectionInformation={movieSelectionInformation} />
							)}
						</div>
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

export const getServerSideProps = getAllUsersAsServerSideProp;
export default Party;
