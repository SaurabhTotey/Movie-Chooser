import Link from "next/link";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";

const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const accountPath = userClientInfo ? "/profile" : "/log-in-or-create-account";
	const linkName = userClientInfo ? "Profile" : "Log In/Create Account";
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
