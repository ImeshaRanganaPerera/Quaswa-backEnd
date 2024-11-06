import express from "express";
import type { Request, Response } from "express";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as commissionReportService from './commissionReport.service'
import * as voucherService from '../voucher/voucher.service'
import * as commissionRateService from '../commissionRate/commissionRate.service'

export const commissionReportRouter = express.Router();

//GET LIST
commissionReportRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await commissionReportService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Commission Report not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

commissionReportRouter.get("/commissionReportSalemanwise",authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { startDate, endDate, userId } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0);

        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999);

        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        const vouchers = await commissionReportService.comReportSalesmanwise(filterStartDate, filterEndDate, userId);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher group and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
})

//GET 
commissionReportRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await commissionReportService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Commission Report not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
commissionReportRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        data = {
            ...data,
        }
        const newbrand = await commissionReportService.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Commission Report Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

// commissionReportRouter.post("/commission", authenticate, async (request: ExpressRequest, response: Response) => {
//     try {
//         if (!request.user) {
//             return response.status(401).json({ message: "User not authorized" });
//         }
//         const voucher = await voucherService.commission()

//         voucher.forEach(async (selectedVoucher) => {
//             if (selectedVoucher.date) {
//                 const invoiceDate = new Date(selectedVoucher.date);
//                 invoiceDate.setHours(0, 0, 0, 0);

//                 // Calculate the days difference (although in your current code, it's always zero)
//                 const invoicedays = 0; // Consider calculating the difference with a reference date if needed

//                 const rates = await commissionRateService.list();

//                 // Filter rates and find the appropriate rate based on invoicedays
//                 const rate = rates.find(rate => rate.days != null && invoicedays <= rate.days);

//                 const commissionRate = rate?.commissionRate || "0%";
//                 const commission = await commissionReportService.create({
//                     date: selectedVoucher.date,
//                     voucherId: selectedVoucher.id,
//                     comRate: commissionRate,
//                     amount: selectedVoucher.paidValue
//                 });
//             }
//         })

//         if (voucher) {
//             return response.status(201).json({ message: voucher.length });
//         }
//     } catch (error: any) {
//         return response.status(500).json({ message: error.message });
//     }
// })

commissionReportRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateBrand = await commissionReportService.update(data, id)

        if (updateBrand) {
            return response.status(201).json({ message: "Commission Report Updated Successfully", data: updateBrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})




