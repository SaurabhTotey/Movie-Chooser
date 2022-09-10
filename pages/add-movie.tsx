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

function AddMovie({ allUsers, userClientInfo }: InferGetServerSidePropsType<typeof getAllUsersAsServerSideProp>) {
	const [searchedMovies, setSearchedMovies] = useState<MovieApiMovieInformation[] | null>(null);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<form>
							<label htmlFor={style["movieSearchInput"]} id={style["movieSearchLabel"]}>
								Search for Movie to Add
							</label>
							<input id={style["movieSearchInput"]} type="search" />
							<button
								aria-controls={`${style["searchStatus"]} movieListContainer`}
								id={style["movieSearchButton"]}
								type="submit"
								onClick={(event) => {
									event.preventDefault();
									const searchStatusElement = document.getElementById(style["searchStatus"]) as HTMLParagraphElement;
									searchStatusElement.textContent = "Searching...";

									const searchTerm = (document.getElementById(style["movieSearchInput"]) as HTMLInputElement).value;
									if (!searchTerm) {
										searchStatusElement.textContent = "Cannot search without a search query.";
										setSearchedMovies(null);
										return;
									}

									axios
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
						<p aria-live="polite" id={style["searchStatus"]}>
							Search results will be shown below.
						</p>
						<div aria-live="polite" id="movieListContainer">
							{searchedMovies &&
								searchedMovies.map((movie) => (
									<MovieCard key={movie.id} isExpandedToBegin={true} movie={movie}>
										<button
											aria-controls={`movieCardFormSpaceFor${movie.id}`}
											className={`${style["movieCardButton"]} ${style["addToWatchListButton"]}`}
											type="button"
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
											aria-controls={`movieCardFormSpaceFor${movie.id}`}
											className={`${style["movieCardButton"]} ${style["addToWatchedListButton"]}`}
											type="button"
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
											aria-live="polite"
											className={style["movieCardFormSpace"]}
											id={`movieCardFormSpaceFor${movie.id}`}
										>
											<form className={style["movieCardForm"]} id={`formToAdd${movie.id}ToWatchList`}>
												<label htmlFor={`weightWhenAdding${movie.id}ToWatchList`}>Weight</label>
												<input
													className={style["movieCardWeightInput"]}
													defaultValue={1}
													id={`weightWhenAdding${movie.id}ToWatchList`}
													min={0}
													step={0.1}
													type="number"
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
																self.disabled = false;
															})
															.catch((error) => {
																statusTextElement.textContent = error.response.data;
																self.disabled = false;
															});
													}}
												>
													Submit
												</button>
											</form>
											<form className={style["movieCardForm"]} id={`formToAdd${movie.id}ToWatchedList`}>
												<label htmlFor={`dateWhenAdding${movie.id}ToWatchedList`}>Date Watched</label>
												<input
													defaultValue={new Date().toISOString().substring(0, 10)}
													id={`dateWhenAdding${movie.id}ToWatchedList`}
													type="date"
												/>
												<br />
												<label htmlFor={`originatorIdSelectionFor${movie.id}`}>From Whose List</label>
												<select id={`originatorIdSelectionFor${movie.id}`}>
													{allUsers.map((userInfo: any) => (
														<option key={userInfo.id} value={userInfo.id}>
															{`${userInfo.name} (${userInfo.email})`}
														</option>
													))}
												</select>
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
																date: dateString,
																id: movie.id,
																originatorId: parseInt(
																	(document.getElementById(`originatorIdSelectionFor${movie.id}`) as HTMLSelectElement)
																		.value,
																),
															})
															.then((response) => {
																statusTextElement.textContent =
																	"Successfully added move to your watched list. You can rate it in your profile page.";
																self.disabled = false;
															})
															.catch((error) => {
																statusTextElement.textContent = error.response.data;
																self.disabled = false;
															});
													}}
												>
													Submit
												</button>
											</form>
											<p className={style["formsStatus"]} id={`formsStatusFor${movie.id}`}>
												Submit to add movie.
											</p>
										</div>
									</MovieCard>
								))}
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
export default AddMovie;
