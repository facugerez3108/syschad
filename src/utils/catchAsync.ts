import { RequestHandler } from "express";
import {Request, Response, NextFunction} from 'express-serve-static-core';
import { User } from "@prisma/client";


interface CustomRequest extends Request {
  user?: User
}

export interface CustomParamsDictionary {
    [key: string]: any;
}


const catchAsync = (fn: (req: CustomRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

export default catchAsync;