export interface IRoom {
  hotelId: number;
  name: string;
  guest: number;
  availability: number;
  bed: number;
  price: number;
  images?: File[];
  imagesString: string[];
}
