import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as productService from './product.service'
import * as inventoryService from '../inventory/inventory.service'
import * as centerService from '../center/center.service'


export const productRouter = express.Router();

//GET LIST
productRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await productService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Products could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
productRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await productService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Product could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
productRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        data = {
            ...data,
            createdBy: userId
        }
        const newProduct = await productService.create(data)

        if (newProduct) {
            const centerList = await centerService.getlist()

            const centerPromises = centerList.map(async (center: { id: string }) => {
                const inventory = await inventoryService.upsert({
                    productId: newProduct.id,
                    centerId: center.id,
                    quantity: 0,
                    cost: 0,
                    minPrice: 0,
                    MRP: 0,
                    salePrice: 0
                });
                if (!inventory) {
                    throw new Error("Failed to update inventory association");
                }
            });

            try {
                await Promise.all(centerPromises);
            } catch (error: any) {
                return response.status(500).json({ message: error.message });
            }

            return response.status(201).json({ message: "Product Created Successfully", data: newProduct });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

productRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateProduct = await productService.update(data, id)

        if (updateProduct) {
            return response.status(201).json({ message: "Brand Updated Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


