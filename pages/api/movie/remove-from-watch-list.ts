import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || (!req.body.id && req.body.id !== 0) || !token) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Get the user that the session token belongs to.
	const user = await prisma.session
		.findUnique({
			where: {
				token: token,
			},
		})
		.User();
	if (!user) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Delete the movie from the database.
	await prisma.toWatchEntry.delete({
		where: {
			userId_movieId: {
				movieId: req.body.id,
				userId: user.id,
			},
		},
	});

	res.status(200).json("Success!");
}
