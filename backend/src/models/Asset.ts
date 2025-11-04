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
  AfterCreate,
  AfterDestroy,
} from 'sequelize-typescript';
import { AssetMetadata } from '../types/Asset';
import User from './User';
import minioService from '../services/minioService';
import { Op, Sequelize } from 'sequelize';

@Table({
  tableName: 'assets',
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
    comment: 'Readable name of the asset',
  })
  name!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    comment: 'MinIO object name (UUID-based)',
  })
  filename!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Original filename from user',
  })
  originalName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Type of asset: image, video, document, audio, etc.',
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'MIME type of the file',
  })
  mimeType!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Presigned URL (may expire)',
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
    comment: 'File size in bytes',
  })
  size!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'MinIO storage path: bucket/objectName',
  })
  storagePath!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'MinIO path to thumbnail: bucket/objectName',
  })
  thumbnailPath!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'transcoded_paths',
    get() {
      const value = this.getDataValue('transcoded_paths' as any);
      if (!value) return null;
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value: any) {
      this.setDataValue('transcoded_paths' as any, value ? JSON.stringify(value) : null);
    },
  })
  transcodedPaths!: Record<string, string> | null;

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    comment: 'Tags for categorization and search',
  })
  tags!: string[];

  @Default({})
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('metadata' as any);
      if (!value) return {};
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value: any) {
      this.setDataValue('metadata' as any, JSON.stringify(value || {}));
    },
    comment: 'Additional metadata like dimensions, duration, etc.',
  })
  metadata!: AssetMetadata | null;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  uploadDate!: Date;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  lastDownloadedAt!: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Number of times asset has been downloaded',
  })
  downloadCount!: number;

  @Default('completed')
  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed'),
    comment: 'Processing status of the asset',
  })
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "Error message if status is 'failed'",
  })
  errorMessage!: string | null;

  @Default('private')
  @Column({
    type: DataType.ENUM('private', 'team', 'public'),
    allowNull: false,
    comment: 'Visibility level of the asset',
  })
  visibility!: 'private' | 'team' | 'public';

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  owner_id!: string;

  @BelongsTo(() => User, { foreignKey: 'owner_id', as: 'owner' })
  owner!: User;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt!: Date;

  async getPresignedUrl(expirySeconds: number = 3600): Promise<string> {
    const [bucketName, objectName] = this.storagePath.split('/');
    return await minioService.getPresignedUrl(bucketName, objectName, expirySeconds);
  }

  async getThumbnailUrl(expirySeconds: number = 3600): Promise<string | null> {
    if (!this.thumbnailPath) return null;
    const [bucketName, objectName] = this.thumbnailPath.split('/');
    return await minioService.getPresignedUrl(bucketName, objectName, expirySeconds);
  }

  isImage(): boolean {
    return this.type === 'image' || this.mimeType.startsWith('image/');
  }

  isVideo(): boolean {
    return this.type === 'video' || this.mimeType.startsWith('video/');
  }

  isDocument(): boolean {
    return this.type === 'document';
  }

  isAudio(): boolean {
    return this.type === 'audio' || this.mimeType.startsWith('audio/');
  }

  getReadableSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
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
      console.error('Error generating presigned URLs:', error);
    }

    return json;
  }

  @BeforeCreate
  @BeforeUpdate
  static validateStoragePath(instance: Asset) {
    if (instance.storagePath && !instance.storagePath.includes('/')) {
      throw new Error('Invalid storage path format. Expected: bucket/objectName');
    }
  }

  @AfterCreate
  static async updateUserStorageOnCreate(instance: Asset) {
    const user = await User.findByPk(instance.owner_id);
    if (user) {
      await user.updateStorageUsed(Number(instance.size));
    }
  }

  @AfterDestroy
  static async updateUserStorageOnDestroy(instance: Asset) {
    const user = await User.findByPk(instance.owner_id);
    if (user) {
      await user.updateStorageUsed(-Number(instance.size));
    }
  }

  static async getTotalStorage(): Promise<number> {
    const result = await Asset.aggregate('size', 'sum', {
      plain: false,
    });
    return (result && result[0]?.sum) || 0;
  }

  static async getTotalDownloads(): Promise<number> {
    const result = await Asset.aggregate('downloadCount', 'sum', {
      plain: false,
    });
    return (result && result[0]?.sum) || 0;
  }

  static async getAssetTypeBreakdown(): Promise<any> {
    const result = await Asset.findAll({
      attributes: ['mimeType', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['mimeType'],
    });

    return result.map((item: any) => ({
      mimeType: item.mimeType,
      count: item.get('count'),
    }));
  }

  static async countDocuments(where: Record<string, any> = {}): Promise<number> {
    return await Asset.count({ where });
  }

  async incrementDownloadCount(): Promise<void> {
    this.downloadCount += 1;
    this.lastDownloadedAt = new Date();
    await this.save();
  }

  static async getAssetsByUser(userId: string, options: any = {}): Promise<Asset[]> {
    return Asset.findAll({
      where: { owner_id: userId },
      ...options,
    });
  }

  static async getRecentAssets(limit: number = 10): Promise<Asset[]> {
    return Asset.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  }

  static async searchAssets(searchTerm: string): Promise<Asset[]> {
    return Asset.findAll({
      where: {
        [Op.or]: [
          { filename: { [Op.iLike]: `%${searchTerm}%` } },
          { originalName: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
    });
  }

  static async getAssetsByStatus(
    status: 'pending' | 'processing' | 'completed' | 'failed',
  ): Promise<Asset[]> {
    return Asset.findAll({
      where: { processingStatus: status },
    });
  }

  async updateProcessingStatus(
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string,
  ): Promise<void> {
    this.status = status;
    if (error) {
      this.errorMessage = error;
    }
    await this.save();
  }

  static async getStorageStatsByUser(): Promise<any[]> {
    return Asset.findAll({
      attributes: [
        'owner_id',
        [Sequelize.fn('SUM', Sequelize.col('size')), 'totalSize'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'assetCount'],
      ],
      group: ['owner_id'],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email'],
        },
      ],
    });
  }

  static async getMostDownloadedAssets(limit: number = 10): Promise<Asset[]> {
    return Asset.findAll({
      order: [['downloadCount', 'DESC']],
      limit,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  }
}
