export type Pageble<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};
