import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "universal-cookie";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	// Validate that request has a cookie that gives a session token and a body (that will be interpretted as the user's password).
	const token = new Cookies(req.headers.cookie).get("session");
	const password = req.body;
	if (req.method != "POST" || !token || !password) {
		res.status(400).json("Couldn't parse request.");
		return;
	}

	// TODO: Check that the given password corresponds to the user given by the token (if the given token corresponds to a user).

	// TODO: Delete the user.
}
