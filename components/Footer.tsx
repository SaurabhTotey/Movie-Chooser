import { FC } from "react";
import style from "../styles/Footer.module.css";

const Footer: FC = () => {
	return (
		<footer>
			<p id={style["footerText"]}>
				Movie Chooser application for the Buff Bois. This product uses the TMDB API but is not endorsed or certified by
				TMDB.
			</p>
		</footer>
	);
};
export default Footer;
