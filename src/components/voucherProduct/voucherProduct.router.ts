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

VoucherProductListRouter.get("/costofsales", async (request: Request, response: Response) => {
    try {
        const { startDate, endDate } = request.query;

        // Parse the startDate, set it to midnight if provided, or use today's date
        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0); // Set the time to the start of the day

        // Parse the endDate, set it to the end of the day if provided, or use today's date
        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999); // Set the time to the end of the day

        console.log(filterStartDate, filterEndDate)
        // Validate the parsed dates
        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        // Fetch filtered journal lines from the service
        const journalLines = await voucherProductService.costofsales(
            filterStartDate,
            filterEndDate
        );

        // // If no journal lines are found, return a 404
        // if (!journalLines || journalLines.length === 0) {
        //     return response.status(404).json({ message: "No journal lines found for the specified criteria." });
        // }

        // Return the filtered journal lines
        return response.status(200).json({ data: journalLines });
    } catch (error: any) {
        console.error("Error fetching journal lines:", error);
        return response.status(500).json({ message: "An error occurred while retrieving journal lines.", error: error.message });
    }
});






