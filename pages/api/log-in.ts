import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import makeSessionToken from "../../helpers/MakeSessionToken";
import UserClientInfo from "../../helpers/UserClientInfo";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | UserClientInfo>) {
	// Validate request.
	const requestObject = JSON.parse(req.body);
	if (req.method != "POST" || !requestObject || !requestObject.email || !requestObject.password) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Ensure that the given password matches the account corresponding to the given email.
	const userToLogIn = await prisma.user.findUnique({
		where: {
			email: requestObject.email,
		},
	});
	if (!userToLogIn || !(await bcrypt.compare(requestObject.password, userToLogIn.password))) {
		res.status(400).json("Couldn't find corresponding email and password combo.");
		return;
	}

	// Make a new session token and save it to the database.
	const sessionToken = makeSessionToken();
	const createdSessionEntry = await prisma.session.create({
		data: {
			userId: userToLogIn.id,
			token: sessionToken,
		},
	});

	// Send response back to client.
	res.status(200).json(new UserClientInfo(userToLogIn.name, userToLogIn.email, sessionToken));
}
