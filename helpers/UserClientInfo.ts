/**
 * A collection of fields that correspond to what clients should be able to know about the currently-logged in
 * user (if any).
 */
class UserClientInfo {
	name: string;
	email: string;
	sessionId: string;

	constructor(name: string, email: string, sessionId: string) {
		this.name = name;
		this.email = email;
		this.sessionId = sessionId;
	}
}

export default UserClientInfo;
