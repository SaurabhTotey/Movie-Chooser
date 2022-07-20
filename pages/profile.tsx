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
						<p>
							TODO: this page will be used to display the user&apos;s current movie list and allow them to change
							weights or remove movies.
						</p>
						<p>
							TODO: this page will be used to display the user&apos;s watched movie list and allow them to change
							ratings or remove movies.
						</p>
						<Form
							title={"Log Out"}
							initialDirective={"Press button to log out."}
							fieldNamesToFieldTypes={new Map()}
							submitHandler={async (submitButton, updateTextContainer) => {
								submitButton.disabled = true;

								axios
									.post("/api/account/log-out")
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"You have been signed out. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
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

								axios
									.post("/api/account/delete-account", { password: passwordInput.value })
									.then((response) => {
										removeCookie("session");
										updateTextContainer.textContent =
											"Account has been deleted. You are being redirected to the account creation page.";
										router.push("/log-in-or-create-account");
									})
									.catch((error) => {
										updateTextContainer.textContent = `${error?.response?.data}`;
										submitButton.disabled = false;
									});
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
			<Footer />
		</>
	);
}

export const getServerSideProps = getUserAsServerSideProp;
export default Profile;
