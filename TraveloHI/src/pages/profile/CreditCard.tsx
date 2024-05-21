import styles from "../../css/creditcard.module.css";
import { ICc } from "../../interface/credit-card";

function CreditCard(creditCard: ICc) {
  return (
    <div className={styles.card}>
      <h4>Bank {creditCard.bankName}</h4>
      <div className={styles.cardRight}>
        <p>
          {creditCard.number} ({creditCard.cvv})
        </p>
        <p>{`a.n. ${creditCard.name}`}</p>
      </div>
    </div>
  );
}

export default CreditCard;
