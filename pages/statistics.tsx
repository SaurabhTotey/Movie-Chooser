import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import getEverythingAsServerSideProp from "../helpers/GetEverythingAsServerSideProp";

const average = (numbers: number[]) => numbers.reduce((sum, current) => sum + current, 0) / numbers.length;

const median = (numbers: number[]) => {
	const sorted = Array.from(numbers).sort((a, b) => a - b);
	const middleIndex = Math.floor(sorted.length / 2);
	return sorted.length % 2 == 0 ? (sorted[middleIndex - 1] + sorted[middleIndex]) / 2 : sorted[middleIndex];
};

function Statistics({
	allUserInformation,
	userClientInfo,
}: InferGetServerSidePropsType<typeof getEverythingAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				<h2>Statistics by Movie</h2>
				<h2>Statistics by Person</h2>
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getEverythingAsServerSideProp;
export default Statistics;
