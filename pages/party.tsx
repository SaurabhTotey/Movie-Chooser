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
						<p>
							TODO: this page will be used to allow users to select all users present and then have a movie selected.
							After a movie is selected, the page allows the current selection to be marked as watched and another
							selection to be made.
						</p>
						<div className={style["userSelectionFormContainer"]}>
							<form className={style["userSelectionForm"]}>
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
									type="submit"
									onClick={(event) => {
										event.preventDefault();
										// TODO:
									}}
								>
									{movieSelectionInformation ? "CHOOSE ANOTHER MOVIE!!!" : "CHOOSE MOVIE!!!"}
								</button>
							</form>
						</div>
						{movieSelectionInformation && (
							<MovieCard movie={movieSelectionInformation[2]}>
								<button
									type="submit"
									onClick={(event) => {
										event.preventDefault();
										// TODO:
									}}
								>
									Mark as Watched for All Viewers
								</button>
							</MovieCard>
						)}
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
