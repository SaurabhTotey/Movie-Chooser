import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useMobile } from "../helpers/use-mobile";
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

	const mobile = useMobile();
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		setExpanded(!mobile);
	}, [mobile]);

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
			<ul
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
		</nav>
	);
};

export default Navbar;
