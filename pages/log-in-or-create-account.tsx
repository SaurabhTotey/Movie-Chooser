import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import AccountForm from "../components/AccountForm";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function LogInOrCreateAccount({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const router = useRouter();
	const [cookie, setCookie] = useCookies(["session"]);
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
						<AccountForm
							fieldNamesToFieldTypes={
								new Map([
									["Email", "email"],
									["Password", "password"],
								])
							}
							initialDirective="Please fill out the form to log in."
							submitHandler={async (submitButton, updateTextContainer, inputs) => {
								submitButton.disabled = true;

								const emailInput = inputs.get("Email");
								const passwordInput = inputs.get("Password");
								if (!emailInput || !passwordInput) {
									updateTextContainer.textContent = "Please fill out all fields";
									submitButton.disabled = false;
									return;
								}

								axios
									.post("/api/account/log-in", {
										email: emailInput.value,
										password: passwordInput.value,
									})
									.then((response) => {
										const responseObject = response.data;
										setCookie("session", responseObject.sessionId, {
											maxAge: 60 * 60 * 24 * 7,
											path: "/",
											sameSite: true,
										});
										updateTextContainer.textContent =
											"You are now signed in! You are being redirected to the profile page.";
										router.push("/profile");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
							title="Log In"
						/>
						<AccountForm
							fieldNamesToFieldTypes={
								new Map([
									["Name", "text"],
									["Password", "password"],
									["Confirm Password", "password"],
									["Email", "email"],
								])
							}
							initialDirective="Please fill out the form to create an account."
							submitHandler={async (submitButton, updateTextContainer, inputs) => {
								submitButton.disabled = true;

								const nameInput = inputs.get("Name")!;
								const passwordInput = inputs.get("Password")!;
								const confirmPasswordInput = inputs.get("Confirm Password")!;
								const emailInput = inputs.get("Email")!;
								if (!nameInput.value || !passwordInput.value || !confirmPasswordInput.value || !emailInput.value) {
									updateTextContainer.textContent = "Please fill out all fields";
									submitButton.disabled = false;
									return;
								}

								if (passwordInput.value != confirmPasswordInput.value) {
									updateTextContainer.textContent = "Passwords don't match.";
									submitButton.disabled = false;
									return;
								}

								axios
									.post("/api/account/create-account", {
										email: emailInput.value,
										name: nameInput.value,
										password: passwordInput.value,
									})
									.then((response) => {
										const responseObject = response.data;
										setCookie("session", responseObject.sessionId, {
											maxAge: 60 * 60 * 24 * 7,
											path: "/",
											sameSite: true,
										});
										updateTextContainer.textContent =
											"Account successfully created! You are now signed in! You are being redirected to the profile page.";
										router.push("/profile");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
							}}
							title="Create Account"
						/>
					</>
				)}
			</main>
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default LogInOrCreateAccount;
