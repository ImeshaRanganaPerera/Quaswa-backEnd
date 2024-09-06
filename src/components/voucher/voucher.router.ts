import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as vocuherService from './voucher.service'
import * as voucherGrpService from '../voucherGroup/vouchergrp.service'
import * as productVoucherService from '../voucherProduct/voucherProduct.service'
import * as inventoryService from '../inventory/inventory.service'

export const voucherRouter = express.Router();

//GET LIST
voucherRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await vocuherService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Voucher could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
voucherRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await vocuherService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Voucher could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.get("/voucherNumber/:vouchname", async (request: Request, response: Response) => {
    const vouchname: any = request.params.vouchname;
    try {
        const voucherGrpId = await voucherGrpService.getbyname(vouchname)
        const newVoucherNumber = await vocuherService.generateVoucherNumber(voucherGrpId?.id)
        if (newVoucherNumber) {
            return response.status(200).json({ data: newVoucherNumber });
        }
        return response.status(404).json({ message: "Voucher Number could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.get("/group/:vouchname", async (request: Request, response: Response) => {
    const vouchname: any = request.params.vouchname;
    try {
        const voucherGrpId = await voucherGrpService.getbyname(vouchname)
        const vouchersbyGrp = await vocuherService.getVoucherbyGrp(voucherGrpId?.id)
        if (vouchersbyGrp) {
            return response.status(200).json({ data: vouchersbyGrp });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


//POST
voucherRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        const voucherGrpdetails = await voucherGrpService.getbyname(data.voucherGroupname)
        const newVoucherNumber = await vocuherService.generateVoucherNumber(voucherGrpdetails?.id)
        const newVoucher = await vocuherService.create({ voucherNumber: newVoucherNumber, date: data.date, amount: data.amount, paidValue: data.paidValue, location: data.location, centerId: data.centerId, partyId: data.partyId, voucherGroupId: voucherGrpdetails?.id, createdBy: userId })
        const centerPromises = data.productList.map(async (product: any) => {
            const voucherProduct = await productVoucherService.create({
                cost: product.cost,
                quantity: product.quantity,
                discount: product.discount,
                MRP: product.MRP,
                sellingPrice: product.sellingPrice,
                amount: product.amount,
                voucherId: newVoucher.id,
                productId: product.productId
            });
            if (!voucherProduct) {
                throw new Error("Failed to update product to list association");
            }
        });
        try {
            await Promise.all(centerPromises);
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }
        if (voucherGrpdetails?.inventoryMode === "PLUS") {
            const inventoryPromise = data.productList.map(async (product: any) => {
                const inventory = await inventoryService.upsert({
                    productId: product.productId,
                    centerId: data.centerId,
                    quantity: product.quantity,
                    cost: product.cost,
                    minPrice: product.minPrice,
                    MRP: product.MRP,
                    sellingPrice: product.sellingPrice
                });
                if (!inventory) {
                    throw new Error("Failed to update product to list association");
                }
            });
            try {
                await Promise.all(inventoryPromise);
            } catch (error: any) {
                return response.status(500).json({ message: error.message });
            }
        }

        if (newVoucher) {
            return response.status(201).json({ message: "Voucher Created Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//PUT
voucherRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateVoucher = await vocuherService.update(data, id)

        if (updateVoucher) {
            return response.status(201).json({ message: "Voucher Updated Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})
