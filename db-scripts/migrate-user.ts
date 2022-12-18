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
				const deletePromises = [
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
				];
				Promise.all(deletePromises)
					.then(async () => {
						await prisma.user.delete({
							where: {
								id: fromUser!.id,
							},
						});
						console.log("The old user has been deleted.");
						const insertPromises = [
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
						Promise.all(insertPromises)
							.then(() => {
								console.log("The old user's data has been inserted into the new user! The migration is complete!");
							})
							.catch((e) => {
								console.log(
									"Couldn't insert the old user's data. That's an issue, because it's now probably lost. Whoops!",
								);
								console.log(e);
							});
					})
					.catch((e) => {
						console.log(
							"There was an issue with deleting the old user account. Check the database and ensure things aren't too fucked up.",
						);
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
