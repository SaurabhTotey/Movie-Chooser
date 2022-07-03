import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { useCookies } from "react-cookie";

const CreateAccount: NextPage = ({ sessionId }: any) => {
	const [cookie, setCookie] = useCookies(["session"]);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar sessionId={sessionId} />
				<h1>Create Account Page</h1>
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
								setCookie("session", await response.text(), {
									path: "/",
									maxAge: 60 * 60 * 24 * 7,
									sameSite: true,
								});
								updateTextContainer.textContent =
									"Account successfully created! You're now signed in! Do you want to go to TODO?";
							} else {
								updateTextContainer.textContent = `Error: "${await response.text()}"`;
							}
							submitButton.disabled = false;
						}}
					>
						Submit
					</button>
				</form>
				<p id="form-status">Please fill out the form to create an account.</p>
			</main>
			<footer></footer>
		</>
	);
};

export default CreateAccount;
