import React, { FC } from "react";
import Link from "next/link";
import UserClientInfo from "../helpers/UserClientInfo";

const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const accountPath = userClientInfo ? "/profile" : "/create-account";
	const linkName = userClientInfo ? "Profile" : "Create Account";
	return (
		<>
			<Link href="/">
				<a>Home</a>
			</Link>
			<br />
			<Link href={accountPath}>
				<a>{linkName}</a>
			</Link>
			<br />
		</>
	);
};

export default Navbar;
