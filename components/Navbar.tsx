import React, { FC } from "react";
import Link from "next/link";

const Navbar: FC<{ sessionId: string | null }> = ({ sessionId }) => {
	const accountPath = sessionId ? "/profile" : "/create-account";
	const linkName = sessionId ? "Profile" : "Create Account";
	return (
		<>
			<Link href="/">
				<a>Home</a>
			</Link>
			<br />
			<Link href={accountPath}>
				<a>{linkName}</a>
			</Link>
			<br />
		</>
	);
};

export default Navbar;
