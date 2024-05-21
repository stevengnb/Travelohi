import styles from "../../css/hoteldetail.module.css";
import pp from "../../../src/images/blankprofpic.png";

function ReviewCard({ review }: { review: any }) {
  return (
    <div className={styles.cardReview}>
      <div className={styles.cardProfile}>
        <div className={styles.cpImage}>
          <img
            src={
              review.anonymous !== true
                ? review.user_picture.startsWith("http")
                  ? review.user_picture
                  : pp
                : pp
            }
          />
        </div>
        <div className={styles.cpName}>
          {review.anonymous !== true ? (
            <>
              {review.first_name} {review.last_name}
            </>
          ) : (
            <>Anonymous</>
          )}
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.ratingAndDate}>
          <div className={styles.ccRating}>
            {(
              (review.rating_clean +
                review.rating_comfort +
                review.rating_location +
                review.rating_service) /
              4
            ).toFixed(2)}
            /10
          </div>
          <div className={styles.ccDate}>
            {review.date.toString().split("T")[0]}
          </div>
        </div>
        <div className={styles.reviews}>{review.review}</div>
      </div>
    </div>
  );
}

export default ReviewCard;
