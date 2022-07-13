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

	// Send query to database to delete the given token. It doesn't matter if the token doesn't exist in the database: the caller doesn't need to know.
	try {
		await prisma.session.delete({
			where: {
				token: token,
			},
		});
	} finally {
		res.status(200).json("Session has been deleted.");
	}
}
