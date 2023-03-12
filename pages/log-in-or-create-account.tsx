import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCookies } from "react-cookie";
import AccountForm from "../components/AccountForm";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

const LoginForm = () => {
	const router = useRouter();
	const [cookie, setCookie] = useCookies(["session"]);

	const [statusText, setStatusText] = useState("Submit to log in.");
	const [isSubmitting, setSubmitting] = useState(false);

	return (
		<AccountForm
			disabled={isSubmitting}
			fieldNamesToFieldTypes={
				new Map([
					["Email", "text"],
					["Password", "password"],
				])
			}
			statusText={statusText}
			title="Log In"
			onSubmit={async (inputs) => {
				setSubmitting(true);

				const { Email: email, Password: password } = inputs;
				if (!email || !password) {
					setStatusText("Please fill out all fields");
					setSubmitting(false);
					return;
				}

				axios
					.post("/api/account/log-in", {
						email,
						password,
					})
					.then((response) => {
						const responseObject = response.data;
						setCookie("session", responseObject.sessionId, {
							maxAge: 60 * 60 * 24 * 7,
							path: "/",
							sameSite: true,
						});
						setStatusText("You are now signed in! You are being redirected to the profile page.");
						router.push("/profile");
					})
					.catch((error) => {
						setStatusText(`${error?.response?.data}`);
						setSubmitting(false);
					});
			}}
		/>
	);
};

const CreateAccountForm = () => {
	const router = useRouter();
	const [cookie, setCookie] = useCookies(["session"]);

	const [statusText, setStatusText] = useState("Please fill out the form to create an account.");
	const [isSubmitting, setSubmitting] = useState(false);

	return (
		<AccountForm
			disabled={isSubmitting}
			fieldNamesToFieldTypes={
				new Map([
					["Name", "text"],
					["Password", "password"],
					["Confirm Password", "password"],
					["Email", "text"],
				])
			}
			statusText={statusText}
			title="Create Account"
			onSubmit={async (inputs) => {
				setSubmitting(true);

				const { Name: name, Password: password, "Confirm Password": confirmPassword, Email: email } = inputs;

				if (!name || !password || !confirmPassword || !email) {
					setStatusText("Please fill out all fields");
					setSubmitting(false);
					return;
				}

				if (password !== confirmPassword) {
					setStatusText("Passwords don't match.");
					setSubmitting(false);
					return;
				}

				axios
					.post("/api/account/create-account", {
						email,
						name,
						password,
					})
					.then((response) => {
						const responseObject = response.data;
						setCookie("session", responseObject.sessionId, {
							maxAge: 60 * 60 * 24 * 7,
							path: "/",
							sameSite: true,
						});
						setStatusText(
							"Account successfully created! You are now signed in! You are being redirected to the profile page.",
						);
						router.push("/profile");
					})
					.catch((error) => {
						setStatusText(`${error?.response?.data}`);
						setSubmitting(false);
					});
			}}
		/>
	);
};

function LogInOrCreateAccount({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userClientInfo} />
				{userClientInfo ? (
					<p>
						You are signed in! Would you like to go to the <Link href="./profile">profile page</Link>?
					</p>
				) : (
					<>
						<LoginForm />
						<CreateAccountForm />
					</>
				)}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default LogInOrCreateAccount;
