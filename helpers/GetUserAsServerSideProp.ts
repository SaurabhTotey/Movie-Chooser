import { PrismaClient } from "@prisma/client";
import { AppContext } from "next/app";
import UserClientInfo from "./UserClientInfo";
import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";

const prisma = new PrismaClient();

const getUserAsServerSideProp: GetServerSideProps = async (context) => {
	const sessionId = new Cookies(context.req.headers.cookie).get("session");
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
	return {
		props: {
			userClientInfo: JSON.parse(JSON.stringify(user ? new UserClientInfo(user.name, user.email, sessionId) : null)),
		},
	};
};

export default getUserAsServerSideProp;
