import { ChangeEvent } from "react";
import styles from "../css/textfield.module.css";

function TextField({
  typee,
  name,
  changeValue,
  formData,
  placeHolder,
  disable,
}: {
  typee: any;
  name: any;
  changeValue: any;
  formData: any;
  placeHolder: any;
  disable: any;
}) {
  const fieldValue = formData[name] || "";
  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeValue(e);
  };
  const classNameInput = name.toLowerCase().includes("name")
    ? styles.fieldsName
    : styles.fields;

  return (
    <input
      type={typee}
      name={name}
      className={classNameInput}
      placeholder={placeHolder}
      value={fieldValue}
      onChange={handleFieldChange}
    disabled={disable}
    />
  );
}

export default TextField;
