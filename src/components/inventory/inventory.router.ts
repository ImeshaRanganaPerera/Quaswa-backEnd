import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as inventoryService from './inventory.service'

export const inventoryRouter = express.Router();

//GET LIST
inventoryRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const inventory = await inventoryService.getbyCenter(id)
        if (inventory) {
            return response.status(200).json({ data: inventory });
        }
        return response.status(404).json({ message: "Inventory could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

inventoryRouter.get("/filter", async (request: Request, response: Response) => {
    const { productId, centerId, date } = request.query;

    try {
        const inventoryData = await inventoryService.filterInventory(
            productId as string,
            centerId as string,
            date as string
        );

        if (inventoryData) {
            return response.status(200).json({ data: inventoryData });
        }
        return response.status(404).json({ message: "No inventory found for the provided filters." });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});