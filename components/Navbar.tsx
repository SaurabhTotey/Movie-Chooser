import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";
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

	const [expanded, setExpanded] = useState(false);

	return (
		<nav aria-live="polite" id={style["navContainer"]}>
			<h1 id={style["logo"]}>MOVIE CHOOSER</h1>
			<button
				aria-controls={style["navList"]}
				aria-expanded={!expanded ? "true" : "false"}
				id={style["mobileHamburgerButton"]}
				type="button"
				onClick={(event) => {
					event.preventDefault();
					setExpanded(!expanded);
				}}
			>
				☰
			</button>

			{/* Mobile layout */}
			<ul
				className={style["mobile"]}
				id={style["navList"]}
				style={{
					display: expanded ? "block" : "none",
				}}
			>
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

			{/* Non mobile */}
			<ul className={style["regular"]} id={style["navList"]}>
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
