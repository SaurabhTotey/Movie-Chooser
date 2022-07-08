import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Profile({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
	const [cookie, setCookie, removeCookie] = useCookies(["session"]);
	const [userInfo, setUserInfo] = useState(userClientInfo);
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
						<h1>Delete Account</h1>
						<form>
							<label htmlFor="password-input">Password</label>
							<input id="password-input" type="password" />
							<button
								type="submit"
								id="submit-button"
								onClick={async (event) => {
									event.preventDefault();

									// Disable button.
									const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
									submitButton.disabled = true;

									// Ensure password has been given.
									const passwordInput = document.getElementById("password-input") as HTMLInputElement;
									if (!passwordInput.value) {
										// TODO: alert user that the password field is empty in a better way
										alert("Cannot delete an account without the password.");
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
										alert(await response.text()); // TODO: handle this better
										removeCookie("session");
										setUserInfo(null);
									} else {
										alert(await response.text()); // TODO: handle this better
									}
									submitButton.disabled = false;
								}}
							>
								Submit
							</button>
						</form>
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
