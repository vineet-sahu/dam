import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { Op, Sequelize } from "sequelize";
import UserRole from "./UserRole";
import Role from "./Role";
import Asset from "./Asset";
import bcrypt from "bcryptjs";

@Table({
  tableName: "users",
  timestamps: true,
  underscored: true,
})
export default class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  team_id!: string | null;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  uploads!: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "active",
    validate: {
      isIn: [["active", "inactive", "suspended"]],
    },
  })
  status!: "active" | "inactive" | "suspended";

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: "Avatar URL or path",
  })
  avatar!: string | null;

  @Default(0)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: "Storage used in bytes",
  })
  storageUsed!: number;

  @Default(10737418240)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: "Storage limit in bytes",
  })
  storageLimit!: number;

  @BelongsToMany(() => Role, () => UserRole, "user_id", "role_id")
  roles!: Role[];

  @HasMany(() => Asset, "owner_id")
  assets!: Asset[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email },
    });
  }

  async assignRole(role: Role): Promise<void> {
    await this.$set("roles", [...this.roles, role]);
  }

  async getRoles(): Promise<Role[]> {
    return this.roles;
  }

  static async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const password_hash = await bcrypt.hash(password, 10);
    return User.create({
      name,
      email,
      password_hash,
    });
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.password_hash = await bcrypt.hash(newPassword, 10);
    await this.save();
  }

  static async countUsers(query: any = {}): Promise<number> {
    return User.count({ where: query });
  }

  static async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async updateUserDetails(updates: any): Promise<void> {
    await this.update(updates);
  }

  static async deleteUserById(id: string): Promise<boolean> {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      return true;
    }
    return false;
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      return true;
    }
    return false;
  }

  static async bulkUpdateUsers(
    ids: string[],
    updates: any,
  ): Promise<{ modifiedCount: number }> {
    const [affectedCount] = await User.update(updates, {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return { modifiedCount: affectedCount };
  }

  async toggleStatus(): Promise<void> {
    if (this.status === "active") {
      this.status = "inactive";
    } else {
      this.status = "active";
    }
    await this.save();
  }

  isActive(): boolean {
    return this.status === "active";
  }

  static async findByIdAndUpdate(
    id: string,
    updates: any,
  ): Promise<User | null> {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(updates);
      return user;
    }
    return null;
  }

  async updateStorageUsed(sizeChange: number): Promise<void> {
    this.storageUsed = Number(this.storageUsed) + sizeChange;
    await this.save();
  }

  hasStorageAvailable(requiredSize: number): boolean {
    return Number(this.storageUsed) + requiredSize <= Number(this.storageLimit);
  }

  static async getUsersWithStorageStats(): Promise<any[]> {
    return User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "storageUsed",
        "storageLimit",
        [
          Sequelize.literal(
            '(CAST("storageUsed" AS FLOAT) / CAST("storageLimit" AS FLOAT) * 100)',
          ),
          "storagePercentage",
        ],
      ],
    });
  }
}
