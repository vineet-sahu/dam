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
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import { AssetMetadata } from "../types/Asset";
import User from "./User";
import minioService from "../services/minioService";

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
    type: DataType.STRING(500),
    allowNull: false,
    comment: "MinIO object name (UUID-based)",
  })
  filename!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "Original filename from user",
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
    comment: "MIME type of the file",
  })
  mimeType!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: "Presigned URL (may expire)",
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
    comment: "File size in bytes",
  })
  size!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: "MinIO storage path: bucket/objectName",
  })
  storagePath!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "MinIO path to thumbnail: bucket/objectName",
  })
  thumbnailPath!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: "Paths to transcoded versions: {quality: 'bucket/objectName'}",
  })
  transcodedPaths!: Record<string, string> | null;

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    comment: "Tags for categorization and search",
  })
  tags!: string[];

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: "Additional metadata like dimensions, duration, etc.",
  })
  metadata!: AssetMetadata | null;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  uploadDate!: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: "Number of times asset has been downloaded",
  })
  downloadCount!: number;

  @Default("completed")
  @Column({
    type: DataType.ENUM("pending", "processing", "completed", "failed"),
    comment: "Processing status of the asset",
  })
  status!: "pending" | "processing" | "completed" | "failed";

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "Error message if status is 'failed'",
  })
  errorMessage!: string | null;

  @Default("private")
  @Column({
    type: DataType.ENUM("private", "team", "public"),
    allowNull: false,
    comment: "Visibility level of the asset",
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
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt!: Date;

  async getPresignedUrl(expirySeconds: number = 3600): Promise<string> {
    const [bucketName, objectName] = this.storagePath.split("/");
    return await minioService.getPresignedUrl(
      bucketName,
      objectName,
      expirySeconds,
    );
  }

  async getThumbnailUrl(expirySeconds: number = 3600): Promise<string | null> {
    if (!this.thumbnailPath) return null;
    const [bucketName, objectName] = this.thumbnailPath.split("/");
    return await minioService.getPresignedUrl(
      bucketName,
      objectName,
      expirySeconds,
    );
  }

  isImage(): boolean {
    return this.type === "image" || this.mimeType.startsWith("image/");
  }

  isVideo(): boolean {
    return this.type === "video" || this.mimeType.startsWith("video/");
  }

  isDocument(): boolean {
    return this.type === "document";
  }

  isAudio(): boolean {
    return this.type === "audio" || this.mimeType.startsWith("audio/");
  }

  getReadableSize(): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  async toJSONWithUrls(): Promise<any> {
    const json = this.toJSON();

    try {
      json.url = await this.getPresignedUrl();
      json.thumbnailUrl = await this.getThumbnailUrl();
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
    }

    return json;
  }

  @BeforeCreate
  @BeforeUpdate
  static validateStoragePath(instance: Asset) {
    if (instance.storagePath && !instance.storagePath.includes("/")) {
      throw new Error(
        "Invalid storage path format. Expected: bucket/objectName",
      );
    }
  }
}
