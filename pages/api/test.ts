import { PrismaClient, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
	const testUser = (await prisma.user.findFirst())!;
	res.status(200).json(testUser);
}
