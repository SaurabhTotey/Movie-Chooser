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
import style from "../styles/add-movie.module.css";

const Movie = ({ movie, allUsers }: { movie: MovieApiMovieInformation; allUsers: any }) => {
	const [mode, setMode] = useState<"none" | "watch" | "watched">("none");

	const [weight, setWeight] = useState(1);
	const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

	const [statusText, setStatusText] = useState("Submit to add movie.");
	const [isSubmitting, setSubmitting] = useState(false);

	return (
		<MovieCard isExpandedToBegin={true} movie={movie}>
			<button
				aria-controls={`movieCardFormSpaceFor${movie.id}`}
				className={`${style["movieCardButton"]} ${style["addToWatchListButton"]}`}
				type="button"
				onClick={() => {
					setMode("watch");
				}}
			>
				Add to To-Watch List
			</button>
			<button
				aria-controls={`movieCardFormSpaceFor${movie.id}`}
				className={`${style["movieCardButton"]} ${style["addToWatchedListButton"]}`}
				type="button"
				onClick={() => {
					setMode("watched");
				}}
			>
				Add to Watched List
			</button>
			<div aria-live="polite" className={style["movieCardFormSpace"]} id={`movieCardFormSpaceFor${movie.id}`}>
				{mode === "watch" && (
					<>
						<form className={style["movieCardForm"]} id={`formToAdd${movie.id}ToWatchList`}>
							<label htmlFor={`weightWhenAdding${movie.id}ToWatchList`}>Weight</label>
							<input
								className={style["movieCardWeightInput"]}
								id={`weightWhenAdding${movie.id}ToWatchList`}
								value={weight}
								onChange={(event) => {
									setWeight(event.target.valueAsNumber);
								}}
								min={0}
								step={0.1}
								type="number"
							/>
							<button
								id={`addToWatchListSubmitButtonFor${movie.id}`}
								type="submit"
								disabled={isSubmitting}
								onClick={(event) => {
									event.preventDefault();
									setSubmitting(true);
									axios
										.post("/api/movie/add-to-watch-list", {
											id: movie.id,
											weight: weight,
										})
										.then((response) => {
											setStatusText("Successfully added move to your to-watch list.");
										})
										.catch((error) => {
											setStatusText(error.response.data);
										})
										.finally(() => {
											setSubmitting(false);
										});
								}}
							>
								Submit
							</button>
						</form>
						<p className={style["formsStatus"]} id={`formsStatusFor${movie.id}`}>
							{statusText}
						</p>
					</>
				)}
				{mode === "watched" && (
					<>
						<form className={style["movieCardForm"]} id={`formToAdd${movie.id}ToWatchedList`}>
							<label htmlFor={`dateWhenAdding${movie.id}ToWatchedList`}>Date Watched</label>
							<input
								id={`dateWhenAdding${movie.id}ToWatchedList`}
								value={date}
								onChange={(event) => {
									setDate(event.target.value);
								}}
								type="date"
							/>
							<br />
							<label htmlFor={`originatorIdSelectionFor${movie.id}`}>From Whose List</label>
							<select id={`originatorIdSelectionFor${movie.id}`}>
								{allUsers.map((userInfo: any) => (
									<option key={userInfo.id} value={userInfo.id}>
										{userInfo.name} ({userInfo.email})
									</option>
								))}
							</select>
							<button
								id={`addToWatchedListSubmitButtonFor${movie.id}`}
								type="submit"
								onClick={(event) => {
									event.preventDefault();
									setSubmitting(true);
									axios
										.post("/api/movie/add-to-watched-list", {
											date,
											id: movie.id,
											originatorId: parseInt(
												(document.getElementById(`originatorIdSelectionFor${movie.id}`) as HTMLSelectElement).value,
											),
										})
										.then((response) => {
											setStatusText(
												"Successfully added move to your watched list. You can rate it in your profile page.",
											);
										})
										.catch((error) => {
											setStatusText(error.response.data);
										})
										.finally(() => {
											setSubmitting(false);
										});
								}}
							>
								Submit
							</button>
						</form>
						<p className={style["formsStatus"]} id={`formsStatusFor${movie.id}`}>
							{statusText}
						</p>
					</>
				)}
			</div>
		</MovieCard>
	);
};

function AddMovie({ allUsers, userClientInfo }: InferGetServerSidePropsType<typeof getAllUsersAsServerSideProp>) {
	const [searchedMovies, setSearchedMovies] = useState<MovieApiMovieInformation[] | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchStatus, setSearchStatus] = useState("Search results will be shown below.");

	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<form
							onSubmit={(event) => {
								event.preventDefault();

								if (!searchTerm) {
									setSearchStatus("Search yielded no results.");
									setSearchedMovies(null);
									return;
								}
								setSearchStatus("Searching...");
								axios
									.get(`/api/movie/search-for-movie?searchTerm=${searchTerm}`)
									.then((response) => {
										if (!response.data || !Array.isArray(response.data)) {
											setSearchStatus("Couldn't understand server response for search.");
											setSearchedMovies(null);
										} else if (response.data.length == 0) {
											setSearchStatus("Search yielded no results.");
											setSearchedMovies(null);
										} else {
											setSearchStatus("Search results shown below.");
											setSearchedMovies(response.data);
										}
									})
									.catch((error) => {
										setSearchStatus(`Error: ${error}`);
										setSearchedMovies(null);
									});
							}}
						>
							<label htmlFor={style["movieSearchInput"]} id={style["movieSearchLabel"]}>
								Search for Movie to Add
							</label>
							<input
								id={style["movieSearchInput"]}
								type="search"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<button
								aria-controls={`${style["searchStatus"]} movieListContainer`}
								id={style["movieSearchButton"]}
								type="submit"
							>
								🔍
							</button>
						</form>
						<p aria-live="polite" id={style["searchStatus"]}>
							{searchStatus}
						</p>
						<div aria-live="polite" id="movieListContainer">
							{searchedMovies &&
								searchedMovies.map((movie) => <Movie key={movie.id} movie={movie} allUsers={allUsers} />)}
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
export default AddMovie;
