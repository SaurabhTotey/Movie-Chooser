import { FC, ReactNode } from "react";
import style from "../styles/CollapsibleSection.module.css";

const expandedSymbol = "▲";
const collapsedSymbol = "▼";

interface CollapsibleSectionPropType {
	title: string;
	children?: ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionPropType> = ({ title, children }) => {
	const htmlValidFieldNameFor = (inputName: string) => inputName.toLowerCase().replaceAll(" ", "-");
	return (
		<div>
			<button
				id={`expandToggleButtonFor${htmlValidFieldNameFor(title)}`}
				className={style["headingButton"]}
				aria-controls={`expandSymbolFor${htmlValidFieldNameFor(title)} contentFor${htmlValidFieldNameFor(title)}`}
				aria-expanded={"false"}
				onClick={(event) => {
					event.preventDefault();

					const self = document.getElementById(`expandToggleButtonFor${htmlValidFieldNameFor(title)}`)!;
					const isExpanded = self.getAttribute("aria-expanded");
					self.setAttribute("aria-expanded", isExpanded == "true" ? "false" : "true");

					const symbolContainer = document.getElementById(
						`expandSymbolFor${htmlValidFieldNameFor(title)}`,
					) as HTMLParagraphElement;
					const contentContainer = document.getElementById(`contentFor${htmlValidFieldNameFor(title)}`)!;

					const contentContainerDisplay = window.getComputedStyle(contentContainer).display;
					if (contentContainerDisplay == "none") {
						contentContainer.style.setProperty("display", "block");
						symbolContainer.innerText = expandedSymbol;
					} else {
						contentContainer.style.setProperty("display", "none");
						symbolContainer.innerText = collapsedSymbol;
					}
				}}
			>
				<h2>{title}</h2>
				<p id={`expandSymbolFor${htmlValidFieldNameFor(title)}`}>▼</p>
			</button>
			<div id={`contentFor${htmlValidFieldNameFor(title)}`} className={style["content"]} aria-live={"polite"}>
				{children}
			</div>
		</div>
	);
};
export default CollapsibleSection;
