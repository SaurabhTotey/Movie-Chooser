import Link from "next/link";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/Navbar.module.css";

const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const accountPath = userClientInfo ? "/profile" : "/log-in-or-create-account";
	const linkName = userClientInfo ? "Profile" : "Log In/Create Account";
	return (
		<nav>
			<p className={style["navLink"]}>
				<Link href="/">
					<a>Home</a>
				</Link>
			</p>
			<p className={style["navLink"]}>
				<Link href={accountPath}>
					<a>{linkName}</a>
				</Link>
			</p>
		</nav>
	);
};

export default Navbar;
