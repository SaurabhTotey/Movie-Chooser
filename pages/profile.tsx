import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Profile({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<p>Hello {userClientInfo.name}</p>
						<p>Email {userClientInfo.email}</p>
						<p>SessionId {userClientInfo.sessionId}</p>
					</>
				) : (
					<>
						<p>User not logged in</p>
					</>
				)}
			</main>
			<footer></footer>
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Profile;
