import { FC, ReactNode, useState } from "react";
import style from "../styles/CollapsibleSection.module.css";

const expandedSymbol = "▲";
const collapsedSymbol = "▼";

interface CollapsibleSectionPropType {
	title: string;
	isExpandedToBegin: boolean;
	children?: ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionPropType> = ({ title, isExpandedToBegin = false, children }) => {
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
				<h2>{title}</h2>
				<p id={`expandSymbolFor${htmlValidFieldNameFor(title)}`}>{isExpanded ? expandedSymbol : collapsedSymbol}</p>
			</button>
			<div
				aria-live="polite"
				className={style["content"]}
				id={`contentFor${htmlValidFieldNameFor(title)}`}
				style={{ display: isExpanded ? "block" : "none" }}
			>
				{children}
			</div>
		</div>
	);
};

export default CollapsibleSection;
