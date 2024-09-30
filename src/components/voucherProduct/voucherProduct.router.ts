import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as voucherProductService from './voucherProduct.service'

export const VoucherProductListRouter = express.Router();

//GET LIST
VoucherProductListRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await voucherProductService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Voucher could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

VoucherProductListRouter.get("/byvoucher/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params.id;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const voucherProductlist = await voucherProductService.getbyVoucherId(id)
        if (voucherProductlist) {
            return response.status(200).json({ data: voucherProductlist });
        }
        return response.status(404).json({ message: "Voucher Products could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

VoucherProductListRouter.get("/byProductCenter", authenticate, async (request: ExpressRequest, response: Response) => {
    const { productId, centerId } = request.query; // Extract query parameters
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const data = {
            productId: productId,
            centerId: centerId 
        };
        console.log(data);
        const voucherProductlist = await voucherProductService.getbyProductIdCenterId(data);
        if (voucherProductlist && voucherProductlist.length > 0) {
            return response.status(200).json({ data: voucherProductlist });
        }
        return response.status(404).json({ message: "Voucher Products could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
});






