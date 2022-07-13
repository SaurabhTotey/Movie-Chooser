import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Form from "../components/Form";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Profile({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const [cookie, setCookie, removeCookie] = useCookies(["session"]);
	const [userInfo, setUserInfo] = useState(userClientInfo);
	const router = useRouter();
	return (
		<>
			<Head>
				<title>Movie Chooser!</title>
			</Head>
			<main>
				<Navbar userClientInfo={userInfo} />
				{userInfo ? (
					<>
						<p>Hello {userInfo.name}</p>
						<p>Email {userInfo.email}</p>
						<p>SessionId {userInfo.sessionId}</p>
						<h1>Log Out</h1>
						<p>TODO:</p>
						<Form
							title={"Delete Account"}
							fieldNamesToFieldTypes={new Map([["Password", "password"]])}
							submitHandler={async (submitButton, inputs) => {
								const updateTextContainer = document.getElementById("form-status") as HTMLParagraphElement;

								// Disable button.
								submitButton.disabled = true;

								// Ensure password has been given.
								const passwordInput = inputs.get("Password")!;
								if (!passwordInput.value) {
									updateTextContainer.textContent = "Cannot delete an account without the password.";
									submitButton.disabled = false;
									return;
								}

								// Send request.
								const response = await fetch("/api/delete-account", {
									method: "POST",
									body: passwordInput.value,
								});

								// Handle response.
								if (response.ok) {
									removeCookie("session");
									updateTextContainer.textContent =
										"Account has been deleted. You are being redirected to the account creation page.";
									router.push("/log-in-or-create-account");
								} else {
									updateTextContainer.textContent = `Error: "${await response.text()}"`;
									submitButton.disabled = false;
								}
							}}
						/>
						<p id="form-status" aria-live="polite">
							Enter your password to delete your account.
						</p>
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
			<footer></footer>
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Profile;
