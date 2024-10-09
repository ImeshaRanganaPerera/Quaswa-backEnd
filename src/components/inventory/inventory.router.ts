import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as inventoryService from './inventory.service'
export const inventoryRouter = express.Router();


// inventoryRouter.get("/stock", async (request: Request, response: Response) => {
//     const { productId, centerId, date } = request.query;
  
//     try {
//       const stockData = await inventoryService.getStock(
//         productId as string | undefined,
//         centerId as string | undefined,
//         date as string | undefined
//       );
  
//       if (stockData && stockData.length > 0) {
//         return response.status(200).json({ data: stockData });
//       }
//       return response.status(404).json({ message: "No stock found for the provided filters." });
//     } catch (error: any) {
//       return response.status(500).json({ message: error.message });
//     }
//   });

inventoryRouter.get("/filter", async (request: Request, response: Response) => {
    const { productId, centerId } = request.query;
    try {
        const filteredInventory = await inventoryService.filterInventory(
            productId?.toString(), 
            centerId?.toString()
        );
        return response.status(200).json({ data: filteredInventory });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});


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






