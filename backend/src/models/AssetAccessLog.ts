import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Asset from "./Asset";
import User from "./User";

@Table({
  tableName: "asset_access_logs",
  timestamps: false,
})
export default class AssetAccessLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Asset)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  asset_id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

  @Column({
    type: DataType.ENUM("view", "download", "edit"),
    allowNull: false,
  })
  action!: "view" | "download" | "edit";

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  timestamp!: Date;

  @BelongsTo(() => Asset, "asset_id")
  asset!: Asset;

  @BelongsTo(() => User, "user_id")
  user!: User;
}
