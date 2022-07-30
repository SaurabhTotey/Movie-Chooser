import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || !req.body.id || (!req.body.weight && req.body.weight !== 0) || !token) {
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

	// Update the movie's weight in the database.
	await prisma.toWatchEntry.update({
		where: {
			userId_movieId: {
				userId: user.id,
				movieId: req.body.id,
			},
		},
		data: {
			weight: Math.max(req.body.weight, 0),
		},
	});

	res.status(200).json("Success!");
}
