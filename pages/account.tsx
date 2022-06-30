import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const Account: NextPage = () => {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar />
				<h1>Account Page</h1>
			</main>
			<footer></footer>
		</>
	);
};

export default Account;
