import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import UserClientInfo from "../../helpers/UserClientInfo";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | UserClientInfo>) {
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
	const createdUser = await prisma.user.create({
		data: {
			name: requestObject.name,
			password: hashedPassword,
			email: requestObject.email,
		},
	});

	// Create a session for the new user.
	const sessionToken = String.fromCharCode(...Array.from(Array(16).keys()).map(() => crypto.randomInt(32, 127)));
	const createdSessionEntry = await prisma.session.create({
		data: {
			userId: createdUser.id,
			token: sessionToken,
		},
	});

	// Send response back to client.
	res.status(200).json(new UserClientInfo(createdUser.name, createdUser.email, sessionToken));
}
