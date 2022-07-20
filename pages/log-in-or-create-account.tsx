import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import Footer from "../components/Footer";
import Form from "../components/Form";
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
						You are signed in! Would you like to go to the{" "}
						<Link href="./profile">
							<a>profile page</a>
						</Link>
						?
					</p>
				) : (
					<>
						<Form
							title={"Log In"}
							initialDirective={"Please fill out the form to log in."}
							fieldNamesToFieldTypes={
								new Map([
									["Email", "email"],
									["Password", "password"],
								])
							}
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
											path: "/",
											maxAge: 60 * 60 * 24 * 7,
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
						/>
						<Form
							title={"Create Account"}
							initialDirective={"Please fill out the form to create an account."}
							fieldNamesToFieldTypes={
								new Map([
									["Name", "text"],
									["Password", "password"],
									["Confirm Password", "password"],
									["Email", "email"],
								])
							}
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
										name: nameInput.value,
										password: passwordInput.value,
										email: emailInput.value,
									})
									.then((response) => {
										const responseObject = response.data;
										setCookie("session", responseObject.sessionId, {
											path: "/",
											maxAge: 60 * 60 * 24 * 7,
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
