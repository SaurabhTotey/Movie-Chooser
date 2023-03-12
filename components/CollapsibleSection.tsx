import { FC, ReactNode, useState } from "react";
import style from "../styles/CollapsibleSection.module.css";

const expandedSymbol = "▲";
const collapsedSymbol = "▼";

const Header: React.FC<{ type: string; children: any } & React.HTMLAttributes<HTMLHeadingElement>> = ({
	type,
	children,
	...rest
}) => {
	switch (type) {
		case "h1":
			return <h1 {...rest}>{children}</h1>;
		case "h2":
			return <h2 {...rest}>{children}</h2>;
		case "h3":
			return <h3 {...rest}>{children}</h3>;
		case "h4":
			return <h4 {...rest}>{children}</h4>;
		case "h5":
			return <h5 {...rest}>{children}</h5>;
		case "h6":
			return <h6 {...rest}>{children}</h6>;
	}
	return <p>Unknown</p>;
};

interface CollapsibleSectionPropType {
	title: string;
	isExpandedToBegin?: boolean;
	titleHeadingLevel?: number;
	children?: ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionPropType> = ({
	title,
	isExpandedToBegin = false,
	titleHeadingLevel = 2,
	children,
}) => {
	const [isExpanded, setIsExpanded] = useState(isExpandedToBegin);
	const htmlValidFieldNameFor = (inputName: string) => inputName.toLowerCase().replaceAll(" ", "-");
	return (
		<div className={style["collapsibleSection"]}>
			<button
				aria-controls={`expandSymbolFor${htmlValidFieldNameFor(title)} contentFor${htmlValidFieldNameFor(title)}`}
				aria-expanded={isExpanded}
				className={style["headingButton"]}
				type="button"
				onClick={(event) => {
					event.preventDefault();
					setIsExpanded(!isExpanded);
				}}
			>
				<Header className={style["titleTag"]} type={`h${titleHeadingLevel}`}>
					{title}
				</Header>
				<p id={`expandSymbolFor${htmlValidFieldNameFor(title)}`}>{isExpanded ? expandedSymbol : collapsedSymbol}</p>
			</button>
			<div aria-live="polite" className={style["content"]} id={`contentFor${htmlValidFieldNameFor(title)}`}>
				{isExpanded && children}
			</div>
		</div>
	);
};

export default CollapsibleSection;
