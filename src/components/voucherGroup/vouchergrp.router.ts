import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as voucherGroupServic from './vouchergrp.service'

export const VoucherGrpRouter = express.Router();

//GET LIST
VoucherGrpRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await voucherGroupServic.getsidemenu()
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


