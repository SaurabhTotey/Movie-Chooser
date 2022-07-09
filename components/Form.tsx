interface FormPropType {
	submitHandler: (inputs: Map<string, HTMLInputElement>) => void;
	fieldNamesToFieldTypes: Map<string, string>;
}

function Form({ submitHandler, fieldNamesToFieldTypes }: FormPropType) {
	const htmlValidFieldNameFor = (fieldName: string) => fieldName.toLowerCase().replaceAll(" ", "-");
	return (
		<form>
			{Array.from(fieldNamesToFieldTypes.entries()).map(([fieldName, fieldType]) => {
				const htmlValidFieldName = htmlValidFieldNameFor(fieldName);
				return (
					<>
						<label htmlFor={htmlValidFieldName}>{fieldName}</label>
						<input id={htmlValidFieldName} type={fieldType} />
					</>
				);
			})}
			<button
				type="submit"
				onClick={(event) => {
					event.preventDefault();
					const fieldNameToFormInputElements = new Map();
					fieldNamesToFieldTypes.forEach((fieldName) => {
						fieldNameToFormInputElements.set(
							fieldName,
							document.getElementById(htmlValidFieldNameFor(fieldName)) as HTMLInputElement,
						);
					});
					submitHandler(fieldNameToFormInputElements);
				}}
			>
				Submit
			</button>
		</form>
	);
}

export default Form;
