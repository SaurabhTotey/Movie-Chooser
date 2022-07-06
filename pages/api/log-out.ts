import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || !token) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Send query to database to delete the given token.
	prisma.session
		.delete({
			where: {
				token: token,
			},
		})
		.then((deletedSession) => {
			res.status(200).json("Session has been deleted.");
		})
		.catch((e) => {
			res.status(500).json(`Couldn't delete session: error is ${e}`); // TODO: this is bad error handling: don't give the error message, and the code should be 400 if the user tried to delete a faulty token
		});
}
