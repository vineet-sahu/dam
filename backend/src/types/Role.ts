export interface IRole {
  id: string;
  name: "admin" | "editor" | "viewer";
  created_at: Date;
  updated_at: Date;
  identifier: string;
}
