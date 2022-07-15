import Link from "next/link";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/Navbar.module.css";

// TODO: ensure that navigation shows up when javascript is disabled
const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const accountPath = userClientInfo ? "/profile" : "/log-in-or-create-account";
	const linkName = userClientInfo ? "Profile" : "Log In/Create Account";
	return (
		<nav id={style["navContainer"]} aria-live={"polite"}>
			<h1 id={style["logo"]}>MOVIE CHOOSER</h1>
			<button
				id={style["mobileHamburgerButton"]}
				onClick={(event) => {
					event.preventDefault();
					const navListElement = document.getElementById(style["navList"]) as HTMLUListElement;
					const currentNavListMobileDisplay = window
						.getComputedStyle(navListElement)
						.getPropertyValue("--nav-mobile-display");
					if (currentNavListMobileDisplay == "block") {
						navListElement.style.setProperty("--nav-mobile-display", "none");
					} else {
						navListElement.style.setProperty("--nav-mobile-display", "block");
					}
				}}
			>
				☰
			</button>
			<ul id={style["navList"]}>
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
