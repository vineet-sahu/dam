import {
  BelongsToManyAddAssociationMixin,
  BelongsToManySetAssociationsMixin,
  Model,
} from "sequelize";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  team_id?: string | null;
  created_at: Date;
  updated_at: Date;

  addRole: BelongsToManyAddAssociationMixin<Model, string>;
  setRoles: BelongsToManySetAssociationsMixin<Model, string>;
}
