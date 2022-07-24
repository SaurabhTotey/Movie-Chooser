CREATE TABLE IF NOT EXISTS "public"."User"(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Session"(
	id SERIAL PRIMARY KEY,
	"userId" INTEGER NOT NULL, FOREIGN KEY ("userId") REFERENCES "public"."User"(id),
	token CHAR(16) UNIQUE NOT NULL,
	"creationTime" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "public"."ToWatchEntry"(
	"userId" INTEGER, FOREIGN KEY ("userId") REFERENCES "public"."User"(id),
	"movieId" INTEGER,
	weight REAL NOT NULL,
	PRIMARY KEY ("userId", "movieId")
);

CREATE TABLE IF NOT EXISTS "public"."WatchedEntry"(
	id SERIAL PRIMARY KEY,
	"userId" INTEGER NOT NULL, FOREIGN KEY ("userId") REFERENCES "public"."User"(id),
	"movieId" INTEGER NOT NULL,
	rating REAL,
	watched DATE NOT NULL
);
