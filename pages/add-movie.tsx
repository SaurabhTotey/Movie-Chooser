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
										<button className={`${style["movieCardButton"]} ${style["addToWatchListButton"]}`}>
											Add to To-Watch List
										</button>
										<button className={`${style["movieCardButton"]} ${style["addToWatchedListButton"]}`}>
											Add to Watched List
										</button>
										<form id={`formToAdd${movie.id}ToWatchList`}>
											<label htmlFor={`weightWhenAdding${movie.id}ToWatchList`}>Weight</label>
											<input id={`weightWhenAdding${movie.id}ToWatchList`} type={"number"} min={0} defaultValue={1} step={0.1}/>
											<button type="submit">Submit</button>
										</form>
										<form id={`formToAdd${movie.id}ToWatchedList`}>
											<label htmlFor={`dateWhenAdding${movie.id}ToWatchedList`}>Date Watched</label>
											<input id={`dateWhenAdding${movie.id}ToWatchedList`} type="date" />
											<button type="submit">Submit</button>
										</form>
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
