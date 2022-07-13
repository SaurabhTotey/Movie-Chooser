import { FC } from "react";

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
		<>
			<h1>{title}</h1>
			<p id={directiveParagraphName} aria-live={"polite"}>
				{initialDirective}
			</p>
			<form>
				{Array.from(fieldNamesToFieldTypes.entries()).map(([fieldName, fieldType]) => {
					const htmlValidFieldName = htmlValidFieldNameFor(fieldName);
					return (
						<div key={fieldName}>
							<label htmlFor={htmlValidFieldName}>{fieldName}</label>
							<input id={htmlValidFieldName} type={fieldType} />
						</div>
					);
				})}
				<button
					type="submit"
					id={submitButtonName}
					onClick={(event) => {
						event.preventDefault();
						const fieldNameToFormInputElements = new Map();
						console.log(`testing: ${fieldNamesToFieldTypes}`);
						Array.from(fieldNamesToFieldTypes.keys()).forEach((fieldName) => {
							console.log(`name: ${fieldName}`);
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
		</>
	);
};

export default Form;
