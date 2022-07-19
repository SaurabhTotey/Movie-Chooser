import crypto from "crypto";

// Create a random string of 16 characters to be used for identification of sessions.
const makeSessionToken = () =>
	String.fromCharCode(...Array.from(Array(16).keys()).map(() => crypto.randomInt(32, 127)));
export default makeSessionToken;
