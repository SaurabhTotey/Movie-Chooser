import React, { FC } from "react";
import Link from "next/link";

const Navbar: FC = () => {
	return (
		<>
			<Link href="/">
				<a>Home</a>
			</Link>
			<br />
			<Link href="/account">
				<a>Account</a>
			</Link>
		</>
	);
};

export default Navbar;
