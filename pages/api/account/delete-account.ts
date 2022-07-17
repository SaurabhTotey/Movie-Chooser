import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";
import deleteUnneededMovies from "../../../helpers/DeleteUnneededMovies";

const prisma = new PrismaClient();

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
	const sessionDeletionResults = await prisma.session.deleteMany({
		where: {
			userId: userToDelete.id,
		},
	});
	const toWatchEntryDeletionResults = await prisma.toWatchEntry.deleteMany({
		where: {
			userId: userToDelete.id,
		},
	});
	await deleteUnneededMovies();
	const userDeletionResults = await prisma.user.delete({
		where: {
			id: userToDelete.id,
		},
	});

	res.status(200).json("Success!");
}
