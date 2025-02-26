import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3();
const bucketNameStorage = 'sp1ai-dev-app-result-bucket';
const bucketNameKey = 'old-bucket-name.txt';

export const handler = async (event) => {
  const sourceBucketName = 'sp1ai-dev-app-result-bucket';
  const sourcePrefix = 'zip/';
  let oldBucketName;

  try {
    // S3から古いバケット名を取得
    const getParams = {
      Bucket: bucketNameStorage,
      Key: bucketNameKey,
    };
    try {
      const data = await s3.getObject(getParams).promise();
      oldBucketName = data.Body.toString('utf-8');
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        oldBucketName = 'amplify-d2vls6biw1ryba-ma-amplifystoragebrowserdri-7ovnmq619bxc';
      } else {
        throw error;
      }
    }

    const newBucketName = `sp1ai-dev-app-result-buckets-${Date.now()}`;

    // 新しいバケットを作成
    await s3.createBucket({ Bucket: newBucketName }).promise();
    console.log(`Created new bucket: ${newBucketName}`);

    // ソースバケットのオブジェクトをリスト
    const listParams = { Bucket: sourceBucketName, Prefix: sourcePrefix };
    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length > 0) {
      // オブジェクトを新しいバケットにコピー
      for (const { Key } of listedObjects.Contents) {
        await s3.copyObject({
          Bucket: newBucketName,
          CopySource: `${sourceBucketName}/${Key}`,
          Key: Key.replace(sourcePrefix, ''),
        }).promise();
      }

      console.log(`Copied objects from ${sourceBucketName}/${sourcePrefix} to ${newBucketName}`);
    }

    // 古いバケットのオブジェクトをリスト
    const oldListParams = { Bucket: oldBucketName };
    const oldListedObjects = await s3.listObjectsV2(oldListParams).promise();

    if (oldListedObjects.Contents.length > 0) {
      // 古いバケットのオブジェクトを削除
      for (const { Key } of oldListedObjects.Contents) {
        await s3.deleteObject({
          Bucket: oldBucketName,
          Key: Key,
        }).promise();
      }

      console.log(`Deleted objects from ${oldBucketName}`);
    }

    // 古いバケットを削除
    await s3.deleteBucket({ Bucket: oldBucketName }).promise();
    console.log(`Deleted old bucket: ${oldBucketName}`);

    // S3に新しいバケット名を保存
    const putParams = {
      Bucket: bucketNameStorage,
      Key: bucketNameKey,
      Body: newBucketName,
    };
    await s3.putObject(putParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Bucket rotation completed successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error rotating buckets', error }),
    };
  }
};