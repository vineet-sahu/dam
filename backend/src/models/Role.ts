import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "roles",
  timestamps: false,
})
export default class Role extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isIn: [["admin", "editor", "viewer"]],
    },
  })
  name!: "admin" | "editor" | "viewer";

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  identifier!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description!: string | null;
}
