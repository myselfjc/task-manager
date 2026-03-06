import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestError } from '../errors';

export function validateBody(DtoClass: new () => object) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto as object, { whitelist: true });
    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return next(BadRequestError(messages.join('; ')));
    }
    req.body = dto;
    next();
  };
}
