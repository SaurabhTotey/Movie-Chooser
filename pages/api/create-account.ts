import bcrypt from "bcrypt";
import { PrismaClient, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<User | string>) {
	// Validate request.
	const requestObject = JSON.parse(req.body);
	if (
		req.method != "POST" ||
		!requestObject ||
		!requestObject.name ||
		!requestObject.password ||
		!requestObject.email
	) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Send query to database to create the user.
	const hashedPassword = await bcrypt.hash(requestObject.password, 10);
	const userCreationPromise = prisma.user.create({
		data: {
			name: requestObject.name,
			password: hashedPassword,
			email: requestObject.email,
		},
	});

	// Send response back to client.
	userCreationPromise
		.then((createdUser) => {
			res.status(200).json(createdUser); // TODO: return a session id or something for storage as a cookie
		})
		.catch((error) => {
			res.status(500).json(error);
		});
}
