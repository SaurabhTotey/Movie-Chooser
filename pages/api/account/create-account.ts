import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../helpers/GetPrismaClient";
import makeSessionToken from "../../../helpers/MakeSessionToken";
import UserClientInfo from "../../../helpers/UserClientInfo";

// Create a new account. Creating an account also creates a session. Request must be a POST request with the body
// containing a JSON object specifying the new account's name, password, and email. The UserClientInfo is returned.
export default async function handler(req: NextApiRequest, res: NextApiResponse<string | UserClientInfo>) {
	// Validate request.
	if (req.method != "POST" || !req.body.name || !req.body.password || !req.body.email) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	try {
		// Send query to database to create the user.
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const createdUser = await prisma.user.create({
			data: {
				email: req.body.email,
				name: req.body.name,
				password: hashedPassword,
			},
		});

		// Create a session for the new user.
		const sessionToken = makeSessionToken();
		const createdSessionEntry = await prisma.session.create({
			data: {
				token: sessionToken,
				userId: createdUser.id,
			},
		});

		// Send response back to client.
		res.status(200).json(new UserClientInfo(createdUser.name, createdUser.email, sessionToken));
	} catch (e) {
		res.status(400).json("Couldn't create user. Check that the given email is unused.");
	}
}
