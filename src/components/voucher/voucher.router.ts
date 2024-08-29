import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as vocuherService from './voucher.service'
import * as voucherGrpService from '../voucherGroup/vouchergrp.service'
import * as productVoucherService from '../voucherProduct/voucherProduct.service'

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

        const newVoucher = await vocuherService.create({ voucherNumber: newVoucherNumber, date: data.date, amount: data.amount, location: data.location, centerId: data.centerId, partyId: data.partyId, voucherGroupId: voucherGrpdetails?.id, createdBy: userId })

        const centerPromises = data.productList.map(async (product: any) => {
            const userCenter = await productVoucherService.create({
                cost: product.cost,
                quantity: product.quantity,
                discount: product.discount,
                MRP: product.MRP,
                price: product.price,
                voucherId: newVoucher.id,
                productId: product.productid
            });
            if (!userCenter) {
                throw new Error("Failed to update product to list association");
            }
        });

        try {
            await Promise.all(centerPromises);
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }

        if (data.voucherGroupname === "GRN") {
            if (voucherGrpdetails?.inventoryMode === "PLUS") {

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
