interface FormPropType {
	fieldNamesToFieldTypes: Map<string, string>;
	submitHandler: (button: HTMLButtonElement, inputs: Map<string, HTMLInputElement>) => void;
}

function Form({ fieldNamesToFieldTypes, submitHandler }: FormPropType) {
	const htmlValidFieldNameFor = (fieldName: string) => `${fieldName.toLowerCase().replaceAll(" ", "-")}-input`;
	return (
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
				id="submit-button"
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
					submitHandler(document.getElementById("submit-button") as HTMLButtonElement, fieldNameToFormInputElements);
				}}
			>
				Submit
			</button>
		</form>
	);
}

export default Form;
