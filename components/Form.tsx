import { FC } from "react";
import style from "../styles/Form.module.css";

interface FormPropType {
	title: string;
	initialDirective: string;
	fieldNamesToFieldTypes: Map<string, string>;
	submitHandler: (
		button: HTMLButtonElement,
		directiveElement: HTMLParagraphElement,
		inputs: Map<string, HTMLInputElement>,
	) => void;
}

const Form: FC<FormPropType> = ({ title, initialDirective, fieldNamesToFieldTypes, submitHandler }) => {
	const uniformifyName = (inputName: string) => inputName.toLowerCase().replaceAll(" ", "-");
	const htmlValidFieldNameFor = (fieldName: string) =>
		`${uniformifyName(fieldName)}-input-for-${uniformifyName(title)}-form`;
	const directiveParagraphName = `${uniformifyName(title)}-form-status`;
	const submitButtonName = `${uniformifyName(title)}-form-submit-button`;
	return (
		<div className={style["form"]}>
			<h2 className={style["formTitle"]}>{title}</h2>
			<p id={directiveParagraphName} className={style["formDescription"]} aria-live="polite">
				{initialDirective}
			</p>
			<form>
				{Array.from(fieldNamesToFieldTypes.entries()).map(([fieldName, fieldType]) => {
					const htmlValidFieldName = htmlValidFieldNameFor(fieldName);
					return (
						<div key={fieldName} className={style["fieldSet"]}>
							<label htmlFor={htmlValidFieldName}>{fieldName}</label>
							<input id={htmlValidFieldName} type={fieldType} />
						</div>
					);
				})}
				<button
					type="submit"
					className={style["submitButton"]}
					id={submitButtonName}
					aria-controls={directiveParagraphName}
					onClick={(event) => {
						event.preventDefault();
						const fieldNameToFormInputElements = new Map();
						Array.from(fieldNamesToFieldTypes.keys()).forEach((fieldName) => {
							fieldNameToFormInputElements.set(
								fieldName,
								document.getElementById(htmlValidFieldNameFor(fieldName)) as HTMLInputElement,
							);
						});
						submitHandler(
							document.getElementById(submitButtonName) as HTMLButtonElement,
							document.getElementById(directiveParagraphName) as HTMLParagraphElement,
							fieldNameToFormInputElements,
						);
					}}
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default Form;
