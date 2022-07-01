CREATE TABLE IF NOT EXISTS "public"."User"(id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL);

CREATE TABLE IF NOT EXISTS "public"."Session"(id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, FOREIGN KEY ("userId") REFERENCES "public"."User"(id), token CHAR(16) NOT NULL, "creationTime" TIMESTAMP NOT NULL DEFAULT NOW());
