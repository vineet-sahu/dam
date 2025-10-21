import minioService from "../services/minioService";
import logger from "../utils/logger";

export const initializeMinIOBuckets = async (): Promise<void> => {
  try {
    logger.info("🔧 Initializing MinIO buckets...");

    const isHealthy = await minioService.healthCheck();
    if (!isHealthy) {
      throw new Error("MinIO health check failed. Is MinIO running?");
    }

    logger.info(" MinIO is healthy");

    const buckets = Object.values(minioService.buckets);

    for (const bucketName of buckets) {
      try {
        const exists = await minioService.client.bucketExists(bucketName);

        if (!exists) {
          await minioService.client.makeBucket(bucketName, "us-east-1");
          logger.info(` Created bucket: ${bucketName}`);

          /*
          const policy = {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucketName}/*`],
              },
            ],
          };
          await minioService.client.setBucketPolicy(
            bucketName,
            JSON.stringify(policy)
          );
          logger.info(` Set public read policy for bucket: ${bucketName}`);
          */
        } else {
          logger.info(`Bucket already exists: ${bucketName}`);
        }
      } catch (error) {
        logger.error(` Error creating bucket ${bucketName}:`, error);
        throw error;
      }
    }

    logger.info(" MinIO buckets initialized successfully");
  } catch (error) {
    logger.error(" Failed to initialize MinIO buckets:", error);
    throw error;
  }
};

export const cleanupMinIOBuckets = async (): Promise<void> => {
  try {
    logger.warn(
      "⚠️  Cleaning up all MinIO buckets (development/testing only)...",
    );

    const buckets = Object.values(minioService.buckets);

    for (const bucketName of buckets) {
      try {
        const exists = await minioService.client.bucketExists(bucketName);
        if (exists) {
          const objectsStream = minioService.client.listObjects(
            bucketName,
            "",
            true,
          );
          const objects: { name: string }[] = [];

          for await (const obj of objectsStream) {
            if (obj.name) objects.push({ name: obj.name });
          }

          if (objects.length > 0) {
            await minioService.client.removeObjects(
              bucketName,
              objects.map((o) => o.name),
            );
            logger.info(
              `🗑️  Deleted ${objects.length} objects from ${bucketName}`,
            );
          }

          await minioService.client.removeBucket(bucketName);
          logger.info(`Removed bucket: ${bucketName}`);
        } else {
          logger.info(`Bucket not found: ${bucketName}`);
        }
      } catch (error) {
        logger.error(`Error cleaning up bucket ${bucketName}:`, error);
        throw error;
      }
    }

    logger.info(" All MinIO buckets cleaned up successfully");
  } catch (error) {
    logger.error("Failed to clean up MinIO buckets:", error);
    throw error;
  }
};
