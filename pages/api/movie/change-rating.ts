import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | number>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || !req.body.id || (!req.body.rating && req.body.rating !== 0) || !token) {
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

	// Update the movie's rating in the database.
	const newRating = Math.min(Math.max(req.body.rating, 0), 10);
	await prisma.watchedEntry.update({
		where: {
			id: req.body.id,
		},
		data: {
			rating: newRating,
		},
	});

	res.status(200).json(newRating);
}
