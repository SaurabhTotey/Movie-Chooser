import "../styles/globals.css";
import type { AppContext, AppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import App from "next/app";
import cookie from "cookie";

function MovieChooserApp({ Component, pageProps, sessionId }: any) {
	return (
		<CookiesProvider>
			<Component {...pageProps} sessionId={sessionId} />
		</CookiesProvider>
	);
}
MovieChooserApp.getInitialProps = async (appContext: AppContext) => {
	const appProps = await App.getInitialProps(appContext);
	// TODO: maybe verify session in db before allowing it
	return {
		...appProps,
		sessionId: cookie.parse(appContext.ctx.req ? appContext.ctx.req.headers.cookie || "" : document.cookie).session,
	};
};

export default MovieChooserApp;
