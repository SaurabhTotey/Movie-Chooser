import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const CreateAccount: NextPage = () => {
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar />
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
					<button type="submit" id="submit-button" onClick={async event => {
						event.preventDefault();

						// Disable button.
						const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
						submitButton.disabled = true;

						// Verify password fields match.
						const passwordElement = document.getElementById("password-input") as HTMLInputElement;
						if (passwordElement.value != (document.getElementById("confirm-password-input") as HTMLInputElement).value) {
							alert("Passwords don't match.");
							submitButton.disabled = false;
						}

						// Send request.
						const response = await fetch("/api/create-account", {
							method: "POST",
							body: JSON.stringify({
								name: (document.getElementById("name-input") as HTMLInputElement).value,
								password: passwordElement.value,
								email: (document.getElementById("email-input") as HTMLInputElement).value,
							}),
						});

						// Handle response.
						if (response.ok) {
							// TODO: correctly handle that the user's been created by prompting going to a profile page or something and setting session information
							alert(await response.text());
						} else {
							alert(await response.text());
						}
						submitButton.disabled = false;
					}}>Submit</button>
				</form>
			</main>
			<footer></footer>
		</>
	);
};

export default CreateAccount;
