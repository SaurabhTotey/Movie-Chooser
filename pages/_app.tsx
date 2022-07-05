import type { AppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import "../styles/globals.css";

function MovieChooserApp({ Component, pageProps }: AppProps) {
	return (
		<CookiesProvider>
			<Component {...pageProps} />
		</CookiesProvider>
	);
}
export default MovieChooserApp;
