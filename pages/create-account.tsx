import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";
import UserClientInfo from "../helpers/UserClientInfo";

function CreateAccount({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const [cookie, setCookie] = useCookies(["session"]);
	const [userInfo, setUserInfo] = useState(userClientInfo);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userInfo} />
				{userInfo && (
					<>
						<p>
							You are signed in! Would you like to go to the{" "}
							<Link href="./profile">
								<a>profile page</a>
							</Link>
							?
						</p>
					</>
				)}
				<h1>Login</h1>
				<p>TODO:</p>
				<h1>Create Account</h1>
				<form>
					<label htmlFor="name-input">Name</label>
					<input id="name-input" type="text" />
					<label htmlFor="password-input">Password</label>
					<input id="password-input" type="password" />
					<label htmlFor="confirm-password-input">Password</label>
					<input id="confirm-password-input" type="password" />
					<label htmlFor="email-input">Email</label>
					<input id="email-input" type="email" />
					<button
						type="submit"
						id="submit-button"
						onClick={async (event) => {
							event.preventDefault();
							const updateTextContainer = document.getElementById("form-status") as HTMLParagraphElement;

							// Disable button.
							const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
							submitButton.disabled = true;

							// Ensure all fields are filled.
							const nameInput = document.getElementById("name-input") as HTMLInputElement;
							const passwordInput = document.getElementById("password-input") as HTMLInputElement;
							const confirmPasswordInput = document.getElementById("confirm-password-input") as HTMLInputElement;
							const emailInput = document.getElementById("email-input") as HTMLInputElement;
							if (!nameInput.value || !passwordInput.value || !confirmPasswordInput.value || !emailInput.value) {
								updateTextContainer.textContent = "Please fill out all fields";
								submitButton.disabled = false;
								return;
							}

							// Verify password fields match.
							if (passwordInput.value != confirmPasswordInput.value) {
								updateTextContainer.textContent = "Passwords don't match.";
								submitButton.disabled = false;
								return;
							}

							// Send request.
							const response = await fetch("/api/create-account", {
								method: "POST",
								body: JSON.stringify({
									name: nameInput.value,
									password: passwordInput.value,
									email: emailInput.value,
								}),
							});

							// Handle response.
							if (response.ok) {
								let responseObject = await response.json();
								if (!responseObject.name || !responseObject.email || !responseObject.sessionId) {
									updateTextContainer.textContent = "Server returned a malformed response.";
									submitButton.disabled = false;
									return;
								}
								setCookie("session", responseObject.sessionId, {
									path: "/",
									maxAge: 60 * 60 * 24 * 7,
									sameSite: true,
								});
								setUserInfo(new UserClientInfo(responseObject.name, responseObject.email, responseObject.sessionId));
								updateTextContainer.textContent = "Account successfully created! You are now signed in!";
							} else {
								updateTextContainer.textContent = `Error: "${await response.text()}"`;
							}
							submitButton.disabled = false;
						}}
					>
						Submit
					</button>
				</form>
				<p id="form-status" aria-live="polite">
					Please fill out the form to create an account.
				</p>
			</main>
			<footer></footer>
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default CreateAccount;
