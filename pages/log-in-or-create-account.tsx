import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Form from "../components/Form";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function CreateAccount({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const router = useRouter();
	const [cookie, setCookie] = useCookies(["session"]);
	const [userInfo, setUserInfo] = useState(userClientInfo);
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userInfo} />
				<div aria-live="polite">
					{userInfo && (
						<p>
							You are signed in! Would you like to go to the{" "}
							<Link href="./profile">
								<a>profile page</a>
							</Link>
							?
						</p>
					)}
				</div>
				<h1>Login</h1>
				<p>TODO:</p>
				<Form
					title={"Create Account"}
					fieldNamesToFieldTypes={
						new Map([
							["Name", "text"],
							["Password", "password"],
							["Confirm Password", "password"],
							["Email", "text"],
						])
					}
					submitHandler={async (submitButton, inputs) => {
						const updateTextContainer = document.getElementById("form-status") as HTMLParagraphElement;

						// Disable button.
						submitButton.disabled = true;

						// Ensure all fields are filled.
						const nameInput = inputs.get("Name")!;
						const passwordInput = inputs.get("Password")!;
						const confirmPasswordInput = inputs.get("Confirm Password")!;
						const emailInput = inputs.get("Email")!;
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
							updateTextContainer.textContent =
								"Account successfully created! You are now signed in! You are being redirected to the profile page.";
							router.push("/profile");
						} else {
							updateTextContainer.textContent = `Error: "${await response.text()}"`;
							submitButton.disabled = false;
						}
					}}
				/>
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
