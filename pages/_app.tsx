import "../styles/globals.css";
import type { AppProps } from "next/app";

function MovieChooserApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}

export default MovieChooserApp;
