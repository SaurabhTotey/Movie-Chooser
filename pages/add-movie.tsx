import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";
import { MovieApiMovieInformation } from "../helpers/MovieApiManager";
import style from "../styles/add-movie.module.css";

function AddMovie({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const [searchedMovies, setSearchedMovies] = useState<MovieApiMovieInformation[] | null>(null);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<p>
					TODO: this page will allow users to search for movies and add it to their to-watch list or already-watched
					list. In the case of the former, the weight must be selected, and in the case of the latter, the date must be
					selected.
				</p>
				{userClientInfo ? (
					<>
						<form>
							<label id={style["movieSearchLabel"]} htmlFor={style["movieSearchInput"]}>
								Search for Movie to Add
							</label>
							<input id={style["movieSearchInput"]} type={"search"} />
							<button
								id={style["movieSearchButton"]}
								type="submit"
								aria-controls={`${style["searchStatus"]} movieListContainer`}
								onClick={async (event) => {
									event.preventDefault();
									const searchStatusElement = document.getElementById(style["searchStatus"]) as HTMLParagraphElement;
									searchStatusElement.textContent = "Searching...";

									const searchTerm = (document.getElementById(style["movieSearchInput"]) as HTMLInputElement).value;
									if (!searchTerm) {
										searchStatusElement.textContent = "Cannot search without a search query.";
										setSearchedMovies(null);
										return;
									}

									await axios
										.get(`/api/movie/search-for-movie?searchTerm=${searchTerm}`)
										.then((response) => {
											if (!response.data || !Array.isArray(response.data)) {
												searchStatusElement.textContent = "Couldn't understand server response for search.";
												setSearchedMovies(null);
											} else if (response.data.length == 0) {
												searchStatusElement.textContent = "Search yielded no results.";
												setSearchedMovies(null);
											} else {
												searchStatusElement.textContent = "Search results shown below.";
												setSearchedMovies(response.data);
											}
										})
										.catch((error) => {
											searchStatusElement.textContent = `${error}`;
											setSearchedMovies(null);
										});
								}}
							>
								🔍
							</button>
						</form>
						<p id={style["searchStatus"]} aria-live={"polite"}>
							Search results will be shown below.
						</p>
						<div id={"movieListContainer"} aria-live={"polite"}>
							{searchedMovies &&
								searchedMovies.map((movie) => (
									<MovieCard movie={movie} key={movie.id}>
										<button
											className={`${style["movieCardButton"]} ${style["addToWatchListButton"]}`}
											aria-controls={`movieCardFormSpaceFor${movie.id}`}
											onClick={(event) => {
												event.preventDefault();
												const addToWatchListForm = document.getElementById(
													`formToAdd${movie.id}ToWatchList`,
												) as HTMLFormElement;
												const addToWatchedListForm = document.getElementById(
													`formToAdd${movie.id}ToWatchedList`,
												) as HTMLFormElement;
												const formStatusElement = document.getElementById(`formsStatusFor${movie.id}`)!;
												const isAddToWatchListFormVisible =
													window.getComputedStyle(addToWatchListForm).display != "none";
												addToWatchedListForm.style.setProperty("display", "none");
												addToWatchListForm.style.setProperty("display", isAddToWatchListFormVisible ? "none" : "block");
												formStatusElement.style.setProperty("display", isAddToWatchListFormVisible ? "none" : "block");
											}}
										>
											Add to To-Watch List
										</button>
										<button
											className={`${style["movieCardButton"]} ${style["addToWatchedListButton"]}`}
											aria-controls={`movieCardFormSpaceFor${movie.id}`}
											onClick={(event) => {
												event.preventDefault();
												const addToWatchListForm = document.getElementById(
													`formToAdd${movie.id}ToWatchList`,
												) as HTMLFormElement;
												const addToWatchedListForm = document.getElementById(
													`formToAdd${movie.id}ToWatchedList`,
												) as HTMLFormElement;
												const formStatusElement = document.getElementById(`formsStatusFor${movie.id}`)!;
												const isAddToWatchedListFormVisible =
													window.getComputedStyle(addToWatchedListForm).display != "none";
												addToWatchListForm.style.setProperty("display", "none");
												addToWatchedListForm.style.setProperty(
													"display",
													isAddToWatchedListFormVisible ? "none" : "block",
												);
												formStatusElement.style.setProperty(
													"display",
													isAddToWatchedListFormVisible ? "none" : "block",
												);
											}}
										>
											Add to Watched List
										</button>
										<div
											id={`movieCardFormSpaceFor${movie.id}`}
											className={style["movieCardFormSpace"]}
											aria-live={"polite"}
										>
											<form id={`formToAdd${movie.id}ToWatchList`} className={style["movieCardForm"]}>
												<label htmlFor={`weightWhenAdding${movie.id}ToWatchList`}>Weight</label>
												<input
													id={`weightWhenAdding${movie.id}ToWatchList`}
													className={style["movieCardWeightInput"]}
													type={"number"}
													min={0}
													defaultValue={1}
													step={0.1}
												/>
												<button
													id={`addToWatchListSubmitButtonFor${movie.id}`}
													type="submit"
													onClick={(event) => {
														event.preventDefault();
														const self = document.getElementById(
															`addToWatchListSubmitButtonFor${movie.id}`,
														) as HTMLButtonElement;
														self.disabled = true;
														const statusTextElement = document.getElementById(
															`formsStatusFor${movie.id}`,
														) as HTMLParagraphElement;
														const weight = (
															document.getElementById(`weightWhenAdding${movie.id}ToWatchList`) as HTMLInputElement
														).valueAsNumber;
														axios
															.post("/api/movie/add-to-watch-list", {
																id: movie.id,
																weight: weight,
															})
															.then((response) => {
																statusTextElement.textContent = "Successfully added move to your to-watch list.";
															})
															.catch((error) => {
																statusTextElement.textContent = error.response.data;
															});
														self.disabled = false;
													}}
												>
													Submit
												</button>
											</form>
											<form id={`formToAdd${movie.id}ToWatchedList`} className={style["movieCardForm"]}>
												<label htmlFor={`dateWhenAdding${movie.id}ToWatchedList`}>Date Watched</label>
												<input
													id={`dateWhenAdding${movie.id}ToWatchedList`}
													type="date"
													defaultValue={new Date().toISOString().substring(0, 10)}
												/>
												<button
													id={`addToWatchedListSubmitButtonFor${movie.id}`}
													type="submit"
													onClick={(event) => {
														event.preventDefault();
														const self = document.getElementById(
															`addToWatchedListSubmitButtonFor${movie.id}`,
														) as HTMLButtonElement;
														self.disabled = true;
														const statusTextElement = document.getElementById(
															`formsStatusFor${movie.id}`,
														) as HTMLParagraphElement;
														const dateString = (
															document.getElementById(`dateWhenAdding${movie.id}ToWatchedList`) as HTMLInputElement
														).value;
														axios
															.post("/api/movie/add-to-watched-list", {
																id: movie.id,
																date: dateString,
															})
															.then((response) => {
																statusTextElement.textContent =
																	"Successfully added move to your watched list. You can rate it in your profile page.";
															})
															.catch((error) => {
																statusTextElement.textContent = error.response.data;
															});
														self.disabled = false;
													}}
												>
													Submit
												</button>
											</form>
											<p id={`formsStatusFor${movie.id}`} className={style["formsStatus"]}>
												Submit to add movie.
											</p>
										</div>
									</MovieCard>
								))}
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

export const getServerSideProps = getUserAsServerSideProp;
export default AddMovie;
