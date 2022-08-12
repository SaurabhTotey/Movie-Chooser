import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import { prisma } from "../../../helpers/GetPrismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate request.
	const token = new Cookies(req.headers.cookie).get("session");
	if (
		req.method != "POST" ||
		(!req.body.id && req.body.id !== 0) ||
		!req.body.date ||
		!new Date(req.body.date) ||
		!req.body.originatorEmail ||
		!token
	) {
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

	// Get the originator's ID from their email.
	const originator = await prisma.user.findUnique({
		where: {
			email: req.body.originatorEmail,
		},
	});
	if (!originator) {
		res.status(400).json("The email provided doesn't correspond to an account.");
		return;
	}

	// Insert the new movie into the database.
	await prisma.watchedEntry.create({
		data: {
			movieId: req.body.id as number,
			originatorId: originator.id,
			rating: null,
			userId: user.id,
			watched: new Date(req.body.date),
		},
	});

	res.status(200).json("Success!");
}
