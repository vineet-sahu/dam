import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function up(queryInterface: QueryInterface) {
  const passwordHash = await bcrypt.hash("password123", 10);

  await queryInterface.bulkInsert("users", [
    {
      id: uuidv4(),
      name: "Vineet",
      email: "vineet@example.com",
      password_hash: passwordHash,
      team_id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete("users", {});
}
