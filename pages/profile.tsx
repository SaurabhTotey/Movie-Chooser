import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Cookies, useCookies } from "react-cookie";
import CollapsibleSection from "../components/CollapsibleSection";
import Footer from "../components/Footer";
import Form from "../components/Form";
import Navbar from "../components/Navbar";
import deleteStaleSessions from "../helpers/DeleteStaleSessions";
import { prisma } from "../helpers/GetPrismaClient";
import UserClientInfo from "../helpers/UserClientInfo";

const getUserAndListsServerSideProps: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
	await deleteStaleSessions();
	if (!sessionId) {
		return {
			props: {
				userClientInfo: null,
				userToWatchList: null,
				userAlreadyWatchedList: null,
			},
		};
	}
	const getUserPromise = prisma.session
		.findUnique({
			where: {
				token: sessionId,
			},
		})
		.User();
	const user = (await getUserPromise)!;
	const toWatchList = await getUserPromise.ToWatchEntry();
	const alreadyWatchedList = await getUserPromise.WatchedEntry();
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))),
			userToWatchList: Object.fromEntries(toWatchList.map((entry) => [entry.movieId, entry.weight])),
			userAlreadyWatchedList: Object.fromEntries(
				alreadyWatchedList.map((entry) => [entry.movieId, { date: entry.watched, rating: entry.rating }]),
			),
		},
	};
};

function Profile({
	userClientInfo,
	userToWatchList,
	userAlreadyWatchedList,
}: InferGetServerSidePropsType<typeof getUserAndListsServerSideProps>) {
	const router = useRouter();
	const [cookie, setCookie, removeCookie] = useCookies(["session"]);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<>
						<h2>Hello, {userClientInfo.name}</h2>
						<p>
							Email: <a href={`mailto:${userClientInfo.email}`}>{userClientInfo.email}</a>
						</p>
						<p>
							TODO: this page will be used to display the user&apos;s current movie list and allow them to change
							weights or remove movies.
						</p>
						<p>
							TODO: this page will be used to display the user&apos;s watched movie list and allow them to change
							ratings or remove movies.
						</p>
						<CollapsibleSection title={"Watch List"}>TODO: watch list</CollapsibleSection>
						<CollapsibleSection title={"Already Watched List"}>TODO: already watched list</CollapsibleSection>
						<Form
							title={"Log Out"}
							initialDirective={"Press button to log out."}
							fieldNamesToFieldTypes={new Map()}
							submitHandler={async (submitButton, updateTextContainer) => {
								submitButton.disabled = true;

								axios
									.post("/api/account/log-out")
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"You have been signed out. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
						/>
						<Form
							title={"Delete Account"}
							initialDirective={"Enter your password to delete your account."}
							fieldNamesToFieldTypes={new Map([["Password", "password"]])}
							submitHandler={async (submitButton, updateTextContainer, inputs) => {
								submitButton.disabled = true;

								const passwordInput = inputs.get("Password")!;
								if (!passwordInput.value) {
									updateTextContainer.textContent = "Cannot delete an account without the password.";
									submitButton.disabled = false;
									return;
								}

								axios
									.post("/api/account/delete-account", { password: passwordInput.value })
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"Account has been deleted. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
						/>
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

export const getServerSideProps = getUserAndListsServerSideProps;
export default Profile;
