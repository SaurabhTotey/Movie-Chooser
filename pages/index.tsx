import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Home({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2>About this Site</h2>
				<p>TODO: describe this site and how it works and the flows and conventions and such</p>
				<h2>Random Movie Selection Process</h2>
				<p>TODO: describe how the party page works</p>
				<CollapsibleSection title="User Lists">
					TODO: display a collapsible section for each user where each section has a list of their to-watch list and
					already watched list; the to-watch list should show the movie title and its relative chance of getting chosen,
					and the already-watched list should show the watched date and the rating.
				</CollapsibleSection>
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Home;
