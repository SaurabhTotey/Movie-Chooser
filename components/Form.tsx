import { FC, Fragment } from "react";

import clsx from "clsx";

interface FormPropType {
	title: string;
	initialDirective: string;
	fieldNamesToFieldTypes: Map<string, string>;
	submitHandler: (
		button: HTMLButtonElement,
		directiveElement: HTMLParagraphElement,
		inputs: Map<string, HTMLInputElement>,
	) => void;
	className?: string;
}

const Form: FC<FormPropType> = ({
	title,
	initialDirective,
	fieldNamesToFieldTypes,
	submitHandler,
	className: custom,
}) => {
	const uniformifyName = (inputName: string) => inputName.toLowerCase().replaceAll(" ", "-");
	const htmlValidFieldNameFor = (fieldName: string) =>
		`${uniformifyName(fieldName)}-input-for-${uniformifyName(title)}-form`;
	const directiveParagraphName = `${uniformifyName(title)}-form-status`;
	const submitButtonName = `${uniformifyName(title)}-form-submit-button`;

	return (
		<div className={clsx("w-full max-w-lg space-y-3", custom)}>
			<h2 className="font-bold text-2xl">{title}</h2>
			<p aria-live="polite" className="text-center" id={directiveParagraphName}>
				{initialDirective}
			</p>
			<form className="space-y-3">
				{Array.from(fieldNamesToFieldTypes.entries()).map(([fieldName, fieldType]) => {
					const htmlValidFieldName = htmlValidFieldNameFor(fieldName);
					return (
						<Fragment key={fieldName}>
							<label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor={htmlValidFieldName}>
								{fieldName}
							</label>
							<input
								className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
								id={htmlValidFieldName}
								type={fieldType}
							/>
						</Fragment>
					);
				})}
				<button
					aria-controls={directiveParagraphName}
					className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
					id={submitButtonName}
					type="submit"
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
