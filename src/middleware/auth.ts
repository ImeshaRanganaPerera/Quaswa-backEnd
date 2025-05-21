import { Request, Response, NextFunction } from "express";
import { user } from '@prisma/client';
import { verify } from "jsonwebtoken";
import { db } from "../utils/db.server";

export interface ExpressRequest extends Request {
    user?: user;
}

export const authenticate = async (req: ExpressRequest, res: Response, next: NextFunction): Promise<void> => {

    if (!req.headers.authorization) {
        return next(new Error('Unauthorized'));
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return next(new Error("Token not Found"));
    }next

    try {
        const decode = verify(token, 'Skey') as { userId: string }
        const user = await db.user.findUnique({
            where: {
                id: decode.userId,
            }
        })
        req.user = user ?? undefined;
        next();
    }
    catch (err) {
        req.user = undefined
        next();
    }
}