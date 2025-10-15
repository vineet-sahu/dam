import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import Asset from "./Asset";

@Table({
  tableName: "asset_versions",
  timestamps: true,
  underscored: true,
})
export default class AssetVersion extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  resolution!: string;

  @Default("thumbnail")
  @Column({
    type: DataType.ENUM("thumbnail", "transcode"),
    allowNull: false,
  })
  type!: "thumbnail" | "transcode";

  @BelongsTo(() => Asset, "asset_id")
  asset!: Asset;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
