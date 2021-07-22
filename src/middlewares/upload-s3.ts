/**
 * @todo
 * It will moved inside common library with parameters
 *  > path
 */
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import crypto from 'crypto';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const bucket = process.env.AWS_BUCKET || "uomlms";
export const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file, cb) {
      const id = crypto.randomBytes(16).toString("hex");
      const path = `${id}-${file.originalname}`;
      cb(null, path);
    }
  })
});