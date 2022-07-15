import Link from "next/link";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/Navbar.module.css";

// TODO: hamburger button doesn't do anything right now and the navbar isn't hidden on mobile yet
const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const accountPath = userClientInfo ? "/profile" : "/log-in-or-create-account";
	const linkName = userClientInfo ? "Profile" : "Log In/Create Account";
	return (
		<nav className={style["navContainer"]}>
			<h1 className={style["logo"]}>MOVIE CHOOSER</h1>
			<button className={style["mobileHamburgerButton"]}>☰</button>
			<ul className={style["navList"]}>
				<li>
					<Link href="/">
						<a>Home</a>
					</Link>
				</li>
				<li>
					<Link href={accountPath}>
						<a>{linkName}</a>
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
