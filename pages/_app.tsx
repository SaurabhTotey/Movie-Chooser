import renderMathInElement from "katex/dist/contrib/auto-render.mjs";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { CookiesProvider } from "react-cookie";
import "../styles/globals.css";

function MovieChooserApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		renderMathInElement(document.body);
	}, [Component]);
	return (
		<CookiesProvider>
			<Component {...pageProps} />
		</CookiesProvider>
	);
}
export default MovieChooserApp;
