import { FC, ReactNode, useState } from "react";
import style from "../styles/CollapsibleSection.module.css";

const expandedSymbol = "▲";
const collapsedSymbol = "▼";

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
	const TitleTag = `h${titleHeadingLevel}`;
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
				<TitleTag className={style["titleTag"]}>{title}</TitleTag>
				<p id={`expandSymbolFor${htmlValidFieldNameFor(title)}`}>{isExpanded ? expandedSymbol : collapsedSymbol}</p>
			</button>
			<div aria-live="polite" className={style["content"]} id={`contentFor${htmlValidFieldNameFor(title)}`}>
				{isExpanded && children}
			</div>
		</div>
	);
};

export default CollapsibleSection;
