import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as productService from './product.service'
import * as inventoryService from '../inventory/inventory.service'
import * as centerService from '../center/center.service'
import * as OENumberService from '../OEMNumber/oemnumber.service'


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
        var productData = {
            barcode: data.barcode,
            brandId: data.brandId,
            criticalLevel: data.criticalLevel,
            image: data.image,
            itemCode: data.itemCode,
            printName: data.printName,
            productName: data.productName,
            typeId: data.typeId,
            cost: 0,
            minPrice: 0,
            MRP: 0,
            sellingPrice: 0,
            createdBy: userId
        }
        const newProduct = await productService.create(productData)

        if (newProduct) {
            // Handle inventory
            const centerList = await centerService.getlist();
            const centerPromises = centerList.map(async (center: { id: string }) => {
                const inventory = await inventoryService.upsert({
                    productId: newProduct.id,
                    centerId: center.id,
                    quantity: 0,
                });
                if (!inventory) {
                    throw new Error("Failed to update inventory association");
                }
            });

            // Handle OEM Numbers
            const OEMnumberPromises = data.OEMnumberList.map(async (oem: any) => {
                const oenum = await OENumberService.create({
                    productId: newProduct.id,
                    OEMnumber: oem.OEMnumber
                });
                if (!oenum) {
                    throw new Error("Failed to update OEM Numbers");
                }
                return oenum; // Return the created OEM number
            });

            try {
                // Wait for all promises
                const [inventoryResults, oemNumbers] = await Promise.all([
                    Promise.all(centerPromises), // Wait for all inventory updates
                    Promise.all(OEMnumberPromises) // Wait for all OEM numbers to be created
                ]);

                // Combine product and OEM numbers into a single data object
                const combinedData = {
                    ...newProduct,
                    OEMNumber: oemNumbers
                };

                // Return the response including the combined data
                return response.status(201).json({
                    message: "Product Created Successfully",
                    data: combinedData
                });
            } catch (error: any) {
                return response.status(500).json({ message: error.message });
            }
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

productRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: string = request.params.id; // Ensure this is a string
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const productData = {
            barcode: data.barcode,
            brandId: data.brandId,
            criticalLevel: data.criticalLevel,
            image: data.image,
            itemCode: data.itemCode,
            printName: data.printName,
            productName: data.productName,
            typeId: data.typeId,
        };

        // Delete existing OEM numbers
        await OENumberService.deleteOEMNumbers(id);

        // Update product
        const updateProduct = await productService.update(productData, id);

        // Handle new OEM numbers
        const OEMnumberPromises = data.OEMnumberList.map(async (oem: any) => {
            const oenum = await OENumberService.create({
                productId: id,
                OEMnumber: oem.OEMnumber
            });
            if (!oenum) {
                throw new Error("Failed to update OEM Numbers");
            }
            return oenum;
        });

        try {
            // Wait for all promises
            const [oemNumbers] = await Promise.all([
                Promise.all(OEMnumberPromises)
            ]);

            // Combine product and OEM numbers into a single data object
            const combinedData = {
                ...updateProduct,
                OEMNumber: oemNumbers
            };

            // Return the response including the combined data
            return response.status(201).json({
                message: "Product Updated Successfully",
                data: combinedData
            });
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }

    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});

productRouter.put("/productStatus/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        console.log(data)
        const updateProductStatus = await productService.updateStatus(data, id)

        if (updateProductStatus) {
            return response.status(201).json({ message: "Product Status Updated Successfully", data: updateProductStatus });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

productRouter.put("/productPriceUpdate/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateProduct = await productService.updatePrices(data, id)

        if (updateProduct) {
            return response.status(201).json({ message: "Product Price Updated Successfully", data: updateProduct });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


