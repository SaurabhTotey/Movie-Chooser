import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";
import deleteStaleSessions from "./DeleteStaleSessions";
import { prisma } from "./GetPrismaClient";
import UserClientInfo from "./UserClientInfo";

const getAllUsersAsServerSideProp: GetServerSideProps = async (context) => {
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
			allUsers: (await prisma.user.findMany()).map((userEntry) => {
				return { email: userEntry.email, id: userEntry.id, name: userEntry.name };
			}),
			userClientInfo: user ? JSON.parse(JSON.stringify(new UserClientInfo(user.name, user.email, sessionId))) : null,
		},
	};
};

export default getAllUsersAsServerSideProp;
