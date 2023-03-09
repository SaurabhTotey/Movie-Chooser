import { FC, useState } from "react";
import style from "../styles/Form.module.css";

interface FormPropType {
	title: string;
	fieldNamesToFieldTypes: Map<string, string>;
	statusText: string;
	disabled: boolean;
	onSubmit: (inputs: Record<string, string>) => void;
}

const AccountForm: FC<FormPropType> = ({ title, fieldNamesToFieldTypes, statusText, disabled, onSubmit }) => {
	const uniformifyName = (inputName: string) => inputName.toLowerCase().replaceAll(" ", "-");
	const htmlValidFieldNameFor = (fieldName: string) =>
		`${uniformifyName(fieldName)}-input-for-${uniformifyName(title)}-form`;
	const directiveParagraphName = `${uniformifyName(title)}-form-status`;
	const submitButtonName = `${uniformifyName(title)}-form-submit-button`;

	const [values, setValues] = useState(
		Object.fromEntries(Array.from(fieldNamesToFieldTypes.keys()).map((key) => [key, ""])),
	);

	return (
		<div className={style["form"]}>
			<h2 className={style["formTitle"]}>{title}</h2>
			<p aria-live="polite" className={style["formDescription"]} id={directiveParagraphName}>
				{statusText}
			</p>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					const formattedValues = Object.fromEntries(
						Object.entries(values).map(([key, value]) => [fieldNamesToFieldTypes.get(key), value]),
					);
					onSubmit(formattedValues);
				}}
			>
				{Array.from(fieldNamesToFieldTypes.entries()).map(([fieldName, fieldType]) => {
					const htmlValidFieldName = htmlValidFieldNameFor(fieldName);
					return (
						<div key={fieldName} className={style["fieldSet"]}>
							<label htmlFor={htmlValidFieldName}>{fieldName}</label>
							<input
								id={htmlValidFieldName}
								type={fieldType}
								value={values[fieldName]}
								onChange={(event) => setValues((prev) => ({ ...prev, [fieldName]: event.target.value }))}
							/>
						</div>
					);
				})}
				<button
					aria-controls={directiveParagraphName}
					className={style["submitButton"]}
					id={submitButtonName}
					type="submit"
					disabled={disabled}
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default AccountForm;
