import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as productDiscountLevel from './productDiscount.service'

export const productDiscountRouter = express.Router();

//GET LIST
productDiscountRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await productDiscountLevel.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Products Discount could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

productDiscountRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await productDiscountLevel.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Discount Level not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})
