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
								onClick={async (event) => {
									event.preventDefault();
									// TODO: error handling:
									setSearchedMovies(
										(
											await axios.get(
												`/api/movie/search-for-movie?searchTerm=${
													(document.getElementById(style["movieSearchInput"]) as HTMLInputElement).value
												}`,
											)
										).data,
									);
								}}
							>
								🔍
							</button>
						</form>
						<div aria-live={"polite"}>
							{searchedMovies && searchedMovies.map((movie) => <MovieCard movie={movie} key={movie.id} />)}
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
