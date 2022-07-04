import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const Home: NextPage = ({ userClientInfo }: any) => {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h1>Hello, world!</h1>
				<p>Hello {userClientInfo ? userClientInfo.name : "NOT SIGNED IN"}</p>
				<p>Email {userClientInfo ? userClientInfo.email : "NOT SIGNED IN"}</p>
				<p>SessionId {userClientInfo ? userClientInfo.sessionId : "NOT SIGNED IN"}</p>
			</main>
			<footer></footer>
		</>
	);
};

export default Home;
