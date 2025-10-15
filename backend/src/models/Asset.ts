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
import { AssetMetadata } from "../types/Asset";
import User from "./User";

@Table({
  tableName: "assets",
  timestamps: true,
  underscored: true,
})
export default class Asset extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "Readable name of the asset",
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  filename!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "Type of asset: image, video, document, audio, etc.",
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mimeType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "URL or storage path to the asset",
  })
  url!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string | null;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  size!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  storagePath!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  thumbnailPath!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  transcodedPaths!: Record<string, string> | null;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: "Additional metadata like file size, dimensions, duration, etc.",
  })
  metadata!: AssetMetadata | null;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  uploadDate!: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  downloadCount!: number;

  @Default("pending")
  @Column(DataType.ENUM("pending", "processing", "completed", "failed"))
  status!: "pending" | "processing" | "completed" | "failed";

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  errorMessage!: string | null;

  @Default("private")
  @Column({
    type: DataType.ENUM("private", "team", "public"),
    allowNull: false,
  })
  visibility!: "private" | "team" | "public";

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  owner_id!: string;

  @BelongsTo(() => User, "owner_id")
  owner!: User;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
