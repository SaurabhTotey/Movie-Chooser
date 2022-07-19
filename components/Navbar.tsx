import Link from "next/link";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/Navbar.module.css";

const namesToPathsWhenLoggedIn = new Map([
	["Home", ""],
	["Profile", "profile"],
	["Stats", "statistics"],
	["Add Movie", "add-movie"],
	["Party!", "party"],
]);
const namesToPathsWhenNotLoggedIn = new Map([
	["Home", ""],
	["Log In / Create Account", "log-in-or-create-account"],
	["Stats", "statistics"],
]);

const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const mappingToUse = userClientInfo ? namesToPathsWhenLoggedIn : namesToPathsWhenNotLoggedIn;
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
				{Array.from(mappingToUse.keys()).map((name) => {
					const path = mappingToUse.get(name);
					return (
						<li id={style[userClientInfo ? "navListItemLoggedIn" : "navListItemNotLoggedIn"]} key={name}>
							<Link href={`/${path}`}>
								<a>{name}</a>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

export default Navbar;
