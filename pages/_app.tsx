import "../styles/globals.css";
import type { AppContext, AppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import App from "next/app";
import cookie from "cookie";
import { PrismaClient, User } from "@prisma/client";
import UserClientInfo from "../helpers/UserClientInfo";

function MovieChooserApp({ Component, pageProps, userInfo }: any) {
	return (
		<CookiesProvider>
			<Component {...pageProps} userInfo={userInfo} />
		</CookiesProvider>
	);
}
MovieChooserApp.getInitialProps = async (appContext: AppContext) => { // TODO: only works if app had a getServerSideProps functionality: will need to be reverted
	const prisma = new PrismaClient();
	const appProps = await App.getInitialProps(appContext);
	const sessionId: string | undefined | null = cookie.parse(
		appContext.ctx.req ? appContext.ctx.req.headers.cookie || "" : document.cookie,
	)?.session;
	console.log(sessionId);
	// TODO: we probably want to make sure the token isn't stale and/or delete stale sessions
	const user = sessionId
		? await prisma.session
				.findUnique({
					where: {
						token: sessionId,
					},
				})
				.User()!
		: null;
	console.log(user);
	return {
		...appProps,
		userInfo: user ? new UserClientInfo(user.name, user.email, sessionId) : null,
	};
};

export default MovieChooserApp;
