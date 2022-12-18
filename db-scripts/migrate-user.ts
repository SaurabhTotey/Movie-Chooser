import { prisma } from "../helpers/GetPrismaClient.js";

if (process.argv.length !== 4) {
	console.log("Script needs arguments of from-email and to-email.");
	process.exit(0);
}

const fromUserPromise = prisma.user.findUnique({
	where: {
		email: process.argv[2],
	},
});
const toUserPromise = prisma.user.findUnique({
	where: {
		email: process.argv[3],
	},
});

fromUserPromise
	.then((fromUser) => {
		toUserPromise
			.then(async (toUser) => {
				console.log(`Attempting migration from ${fromUser!.name}'s account to ${toUser!.name}'s account`);
				const toWatchEntriesToUpdate = await prisma.toWatchEntry.findMany({
					where: {
						userId: fromUser!.id,
					},
				});
				const watchedEntriesToUpdate = await prisma.watchedEntry.findMany({
					where: {
						userId: fromUser!.id,
					},
				});
				const originatedWatchedEntriesToUpdate = await prisma.watchedEntry.findMany({
					where: {
						originatorId: fromUser!.id,
					},
				});
				const batchPromises = [
					prisma.toWatchEntry.deleteMany({
						where: {
							userId: fromUser!.id,
						},
					}),
					prisma.watchedEntry.deleteMany({
						where: {
							userId: fromUser!.id,
						},
					}),
					prisma.watchedEntry.deleteMany({
						where: {
							originatorId: fromUser!.id,
						},
					}),
					prisma.session.deleteMany({
						where: {
							userId: fromUser!.id,
						},
					}),
					prisma.user.delete({
						where: {
							id: fromUser!.id,
						},
					}),
					prisma.toWatchEntry.createMany({
						data: toWatchEntriesToUpdate.map((entry) => {
							return {
								...entry,
								userId: toUser!.id,
							};
						}),
						skipDuplicates: true,
					}),
					prisma.watchedEntry.createMany({
						data: watchedEntriesToUpdate.map((entry) => {
							return {
								...entry,
								userId: toUser!.id,
							};
						}),
						skipDuplicates: true,
					}),
					prisma.watchedEntry.createMany({
						data: originatedWatchedEntriesToUpdate.map((entry) => {
							return {
								...entry,
								originatorId: toUser!.id,
							};
						}),
						skipDuplicates: true,
					}),
				];
				prisma
					.$transaction(batchPromises)
					.then(() => {
						console.log("Migration was successful!");
					})
					.catch((e) => {
						console.log("There was an issue with migration. Check the databases to ensure that nothing is screwed up.");
						console.log(e);
					});
			})
			.catch((e) => {
				console.log("Couldn't resolve the destination user. Ensure the to-email is correct.");
				console.log(e);
			});
	})
	.catch((e) => {
		console.log("Couldn't resolve the source user. Ensure the from-email is correct.");
		console.log(e);
	});
