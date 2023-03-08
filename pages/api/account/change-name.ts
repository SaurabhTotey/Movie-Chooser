import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

// Change the name associated with an account. Request must be a POST request with a cookie header with a session token corresponding to
// the account to update (essentially requiring that the requester be signed in) and with the request body containing
// the user's new name and their current password.
export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate that request has a cookie that gives a session token and a body.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || !token || !req.body.name || !req.body.password) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Get the user to update if it exists.
	const userToUpdate = await prisma.session
		.findUnique({
			where: {
				token: token,
			},
		})
		.User();
	if (!userToUpdate) {
		res.status(400).json("Couldn't find a user corresponding to the session token given by the request cookie.");
		return;
	}

	// Ensure the given password matches the user's password.
	if (!(await bcrypt.compare(req.body.password, userToUpdate.password))) {
		res.status(400).json("The given password isn't correct.");
		return;
	}

	// Update the user's name.
	await prisma.user.update({
		data: {
			name: req.body.name,
		},
		where: {
			id: userToUpdate.id,
		},
	});

	res.status(200).json("Success!");
}
