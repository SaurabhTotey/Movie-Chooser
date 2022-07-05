import "../styles/globals.css";
import type { AppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import App from "next/app";

function MovieChooserApp({ Component, pageProps }: AppProps) {
	return (
		<CookiesProvider>
			<Component {...pageProps} />
		</CookiesProvider>
	);
}
export default MovieChooserApp;
