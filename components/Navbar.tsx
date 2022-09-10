import { FC } from "react";
import Link from "next/link";
import UserClientInfo from "../helpers/UserClientInfo";
import clsx from "clsx";
import style from "../styles/Navbar.module.css";
import { useRouter } from "next/router";

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
		<nav aria-live="polite" className="flex md:flex-row my-auto py-4 px-2">
			<h1 className="my-auto font-bold text-3xl">MOVIE CHOOSER</h1>
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
			<div className="flex md:flex-row md:ml-auto">
				{Array.from(mappingToUse.keys()).map((name) => {
					const path = mappingToUse.get(name);
					return (
						<div
							key={name}
							className={clsx(
								"transition-colors py-2 px-3",
								router.pathname == `/${path}` ? "text-blue-400 hover:text-blue-500" : "text-gray-400 hover:text-black",
							)}
						>
							<Link href={`/${path}`}>
								<a>{name}</a>
							</Link>
						</div>
					);
				})}
			</div>
		</nav>
	);
};

export default Navbar;
