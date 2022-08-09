import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (req.method != "POST" || !req.body.id || !req.body.userIds || !req.body.date || !token) {
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

	// Remove the movie from the to-watch lists of all given users.
	await prisma.toWatchEntry.deleteMany({
		where: {
			userId: {
				in: req.body.userIds,
			},
			movieId: req.body.id,
		},
	});

	// Put the movie into the watched lists of all given users.
	await prisma.watchedEntry.createMany({
		data: req.body.userIds.map((userId: number) => {
			return {
				userId: userId,
				movieId: req.body.id,
				watched: new Date(req.body.date),
			};
		}),
	});

	res.status(200).json("Success!");
}
