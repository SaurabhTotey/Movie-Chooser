import { PrismaClient, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<User | string>) {

	// Validate request.
	const requestObject = JSON.parse(req.body);
	if (!requestObject || !requestObject.name || !requestObject.password || !requestObject.email) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Send query to database to create the user.
	const userCreationPromise = prisma.user.create({
		data: {
			name: requestObject.name,
			password: requestObject.password, // TODO: at least hash the password first
			email: requestObject.email,
		}
	});

	// Send response back to client.
	userCreationPromise
		.then(createdUser => {
			res.status(200).json(createdUser);
		})
		.catch(error => {
			res.status(500).json(error);
		});
}
