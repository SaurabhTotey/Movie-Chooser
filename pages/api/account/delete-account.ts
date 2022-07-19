import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";

const prisma = new PrismaClient();

// Delete an account. Request must be a POST request with a cookie header with a session token corresponding to
// the account to delete (essentially requiring that the requester be signed in) and with the request body containing
// the user's password. Deleting an account also deletes all information tied to the account from the database.
export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate that request has a cookie that gives a session token and a body (that will be interpretted as the user's password).
	const token = new Cookies(req.headers.cookie).get("session");
	const password = req.body;
	if (req.method != "POST" || !token || !password) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// Get the user to delete if it exists.
	const userToDelete = await prisma.session
		.findUnique({
			where: {
				token: token,
			},
		})
		.User();
	if (!userToDelete) {
		res.status(400).json("Couldn't find a user corresponding to the session token given by the request cookie.");
		return;
	}

	// Ensure the given password matches the user's password.
	if (!(await bcrypt.compare(password, userToDelete.password))) {
		res.status(400).json("The given password isn't correct.");
		return;
	}

	// Delete all database entries related to the user.
	const sessionDeletionPromise = prisma.session.deleteMany({
		where: {
			userId: userToDelete.id,
		},
	});
	const toWatchEntryDeletionPromise = prisma.toWatchEntry.deleteMany({
		where: {
			userId: userToDelete.id,
		},
	});
	const watchedEntryDeletionPromise = prisma.watchedEntry.deleteMany({
		where: {
			userId: userToDelete.id,
		},
	});
	const userDeletionPromise = prisma.user.delete({
		where: {
			id: userToDelete.id,
		},
	});
	await prisma.$transaction([
		sessionDeletionPromise,
		toWatchEntryDeletionPromise,
		watchedEntryDeletionPromise,
		userDeletionPromise,
	]);

	res.status(200).json("Success!");
}
