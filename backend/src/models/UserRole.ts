import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import User from "./User";
import Role from "./Role";

@Table({
  tableName: "user_roles",
  timestamps: false,
})
export default class UserRole extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  role_id!: string;

  @BelongsTo(() => User, "user_id")
  user!: User;

  @BelongsTo(() => Role, "role_id")
  role!: Role;
}
