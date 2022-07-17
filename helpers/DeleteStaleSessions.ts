import { PrismaClient } from "@prisma/client";

const SESSION_LIFETIME = 60 * 60 * 24 * 7; // in seconds
const prisma = new PrismaClient();

// TODO: this is untested
const deleteStaleSessions = async () => {
	const thresholdDate = new Date();
	thresholdDate.setSeconds(new Date().getSeconds() - SESSION_LIFETIME);
	return prisma.session.deleteMany({
		where: {
			creationTime: {
				lt: thresholdDate,
			},
		},
	});
};
export default deleteStaleSessions;
