import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";
import deleteStaleSessions from "./DeleteStaleSessions";
import UserClientInfo from "./UserClientInfo";

const prisma = new PrismaClient();

// Get the user that corresponds to the given session (if any exist) for use as a prop to be used by pages.
// This is useful because many pages have different appearances and behaviours depending on whether the user is signed
// in or not, and it is often useful to have the user's info like their name or their email or the session information.
// If the cookie doesn't exist or is invalid, null is passed as the prop instead of any UserClientInfo.
const getUserAsServerSideProp: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
	await deleteStaleSessions();
	const user = sessionId
		? await prisma.session
				.findUnique({
					where: {
						token: sessionId,
					},
				})
				.User()
		: null;
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(user ? new UserClientInfo(user.name, user.email, sessionId) : null)),
		},
	};
};

export default getUserAsServerSideProp;
