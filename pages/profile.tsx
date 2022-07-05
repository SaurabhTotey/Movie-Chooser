import Head from "next/head";
import Navbar from "../components/Navbar";
import { InferGetServerSidePropsType } from "next";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Profile({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<p>Hello {userClientInfo ? userClientInfo.name : "NOT SIGNED IN"}</p>
				<p>Email {userClientInfo ? userClientInfo.email : "NOT SIGNED IN"}</p>
				<p>SessionId {userClientInfo ? userClientInfo.sessionId : "NOT SIGNED IN"}</p>
			</main>
			<footer></footer>
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Profile;
