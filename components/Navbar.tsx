import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import UserClientInfo from "../helpers/UserClientInfo";
import style from "../styles/Navbar.module.css";

const namesToPathsWhenLoggedIn = new Map([
	["Home", ""],
	["Profile", "profile"],
	["Lists", "lists"],
	["Stats", "statistics"],
	["Add Movie", "add-movie"],
	["Party!", "party"],
]);
const namesToPathsWhenNotLoggedIn = new Map([
	["Home", ""],
	["Log In / Create Account", "log-in-or-create-account"],
	["Lists", "lists"],
	["Stats", "statistics"],
]);

const Navbar: FC<{ userClientInfo: UserClientInfo }> = ({ userClientInfo }) => {
	const router = useRouter();
	const mappingToUse = userClientInfo ? namesToPathsWhenLoggedIn : namesToPathsWhenNotLoggedIn;
	return (
		<nav aria-live="polite" id={style["navContainer"]}>
			<h1 id={style["logo"]}>MOVIE CHOOSER</h1>
			<button
				aria-controls={style["navList"]}
				aria-expanded="false"
				id={style["mobileHamburgerButton"]}
				type="button"
				onClick={(event) => {
					event.preventDefault();

					const self = document.getElementById(style["mobileHamburgerButton"])!;
					const isExpanded = self.getAttribute("aria-expanded");
					self.setAttribute("aria-expanded", isExpanded == "true" ? "false" : "true");

					const navListElement = document.getElementById(style["navList"])!;
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
						<li
							key={name}
							className={
								style[userClientInfo ? "navListItemLoggedIn" : "navListItemNotLoggedIn"] +
								(router.pathname == `/${path}` ? ` ${style["active"]}` : "")
							}
						>
							<Link href={`/${path}`}>{name}</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

export default Navbar;
