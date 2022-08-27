import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import mongodbUrlModel from '../models/mongo/url';
import { client } from '../models/redis/connection';
import getUrlRepository from '../models/redis/url';
import createUrlValidator from '../validators/url';

export const createUrl = async (req: Request, res: Response) => {
  const validationResult = createUrlValidator(req.body);
  if (validationResult !== true) return res.status(422).json(validationResult);

  const identifier = nanoid(6);

  const document: any = await getUrlRepository()
    .search()
    .where('original_url')
    .equalTo(req.body.original_url)
    .first();

  if (document) {
    await client.execute([
      'JSON.NUMINCRBY',
      document.keyName,
      'accessed_times',
      1,
    ]);

    return res.json(document);
  }

  try {
    const createdDocument = await getUrlRepository().createAndSave({
      original_url: req.body.original_url,
      shorten_identifier: identifier,
      created_at: new Date(),
      accessed_times: 1,
    });

    return res.json(createdDocument);
  } catch (error: any) {
    if (
      error.toString() ==
      "Error: OOM command not allowed when used memory > 'maxmemory'."
    ) {
      const leastUsedDocuments = await getUrlRepository()
        .search()
        .sortAsc('accessed_times')
        .sortAsc('created_at')
        .returnPage(0, 100);

      await mongodbUrlModel.insertMany(
        leastUsedDocuments.map((leastUsedDocument: any) => ({
          original_url: leastUsedDocument.original_url,
          shorten_identifier: leastUsedDocument.shorten_identifier,
          created_at: leastUsedDocument.created_at,
          accessed_times: leastUsedDocument.accessed_times,
        }))
      );

      await getUrlRepository().remove(
        leastUsedDocuments.map((doc) => doc.entityId)
      );

      await client.execute(['SAVE']);

      const createdDocument = await getUrlRepository().createAndSave({
        original_url: req.body.original_url,
        shorten_identifier: identifier,
        created_at: new Date(),
        accessed_times: 1,
      });

      return res.json(createdDocument);
    }

    return res.json(error);
  }
};

export const redirect = async (req: Request, res: Response) => {
  const document: any = await getUrlRepository()
    .search()
    .where('shorten_identifier')
    .equalTo(req.params.identifier)
    .first();

  if (document) {
    await client.execute([
      'JSON.NUMINCRBY',
      document.keyName,
      'accessed_times',
      1,
    ]);

    return res.redirect(document.original_url);
  }

  const documentFromMongodb = await mongodbUrlModel
    .findOne({ shorten_identifier: req.params.identifier })
    .lean();

  if (!documentFromMongodb) {
    return res
      .status(404)
      .json({ message: 'there is no url with this shorten identifier' });
  }

  await mongodbUrlModel.updateOne(
    { _id: documentFromMongodb._id },
    { $inc: { accessed_times: 1 } }
  );

  return res.redirect(documentFromMongodb.original_url);
};
