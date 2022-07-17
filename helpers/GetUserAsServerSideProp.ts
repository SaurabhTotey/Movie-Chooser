import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";
import deleteStaleSessions from "./DeleteStaleSessions";
import UserClientInfo from "./UserClientInfo";

const prisma = new PrismaClient();

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
				.User()!
		: null;
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(user ? new UserClientInfo(user.name, user.email, sessionId) : null)),
		},
	};
};

export default getUserAsServerSideProp;
