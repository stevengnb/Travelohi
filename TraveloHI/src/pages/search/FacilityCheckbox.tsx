import styles from "../../css/searchhotel.module.css";

function FacilityCheckbox({
  facility,
  onChange,
}: {
  facility: any;
  onChange: any;
}) {
  const { name, checked } = facility;

  return (
    <div key={name} className={styles.facilitiesCheck}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        className={styles.startCb}
        onChange={onChange}
      />
      <p>{name}</p>
    </div>
  );
}

export default FacilityCheckbox;
