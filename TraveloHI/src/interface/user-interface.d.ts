interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  answer: string;
  dob: string;
  profilePicture: string;
  id: string;
  question: string;
  isEmail: boolean;
  banned: boolean;
  creditCards: ICc[] | null;
  hiWallet: number;
}
