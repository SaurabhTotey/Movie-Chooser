import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const Profile: NextPage = ({ sessionId }: any) => {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar sessionId={sessionId} />
				<h1>TODO</h1>
			</main>
			<footer></footer>
		</>
	);
};

export default Profile;
