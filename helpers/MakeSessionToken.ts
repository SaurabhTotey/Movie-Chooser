import crypto from "crypto";

const makeSessionToken = () =>
	String.fromCharCode(...Array.from(Array(16).keys()).map(() => crypto.randomInt(32, 127)));
export default makeSessionToken;
