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
