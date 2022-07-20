import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../helpers/GetPrismaClient";
import makeSessionToken from "../../../helpers/MakeSessionToken";
import UserClientInfo from "../../../helpers/UserClientInfo";

// Generate a new session token for a user given by their email and password. Request must be a POST request with the
// body being a JSON object specifying the user's email and password. If the email and password correspond to an
// account, a session token is generated, and the UserClientInfo is sent back.
export default async function handler(req: NextApiRequest, res: NextApiResponse<string | UserClientInfo>) {
	// Validate request.
	if (req.method != "POST" || !req.body.email || !req.body.password) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Ensure that the given password matches the account corresponding to the given email.
	const userToLogIn = await prisma.user.findUnique({
		where: {
			email: req.body.email,
		},
	});
	if (!userToLogIn || !(await bcrypt.compare(req.body.password, userToLogIn.password))) {
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
