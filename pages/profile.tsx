import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import Form from "../components/Form";
import Navbar from "../components/Navbar";
import getUserAsServerSideProp from "../helpers/GetUserAsServerSideProp";

function Profile({ userClientInfo }: InferGetServerSidePropsType<typeof getUserAsServerSideProp>) {
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
						<Form
							title={"Log Out"}
							initialDirective={"Press button to log out."}
							fieldNamesToFieldTypes={new Map()}
							submitHandler={async (submitButton, updateTextContainer) => {
								submitButton.disabled = true;

								const response = await fetch("/api/account/log-out", {
									method: "POST",
								});

								if (response.ok) {
									removeCookie("session");
									updateTextContainer.textContent =
										"You have been signed out. You are being redirected to the account creation page.";
									router.push("/log-in-or-create-account");
								} else {
									updateTextContainer.textContent = `Error: ${await response.text()}`;
									submitButton.disabled = false;
								}
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

								const response = await fetch("/api/account/delete-account", {
									method: "POST",
									body: passwordInput.value,
								});

								if (response.ok) {
									removeCookie("session");
									updateTextContainer.textContent =
										"Account has been deleted. You are being redirected to the account creation page.";
									router.push("/log-in-or-create-account");
								} else {
									updateTextContainer.textContent = `Error: ${await response.text()}`;
									submitButton.disabled = false;
								}
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
			<footer></footer>
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Profile;
