import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'
import { Prisma, role } from '@prisma/client';

import * as voucherService from './voucher.service'
import * as voucherGrpService from '../voucherGroup/vouchergrp.service'
import * as voucherCenter from '../centerVoucher/centerVoucher.service'
import * as productVoucherService from '../voucherProduct/voucherProduct.service'
import * as inventoryService from '../inventory/inventory.service'
import * as journalLineService from '../journalline/journalline.service'
import * as chartofaccService from '../ChartofAccount/chartofaccount.service'
import * as partyService from '../party/party.service'
import * as paymentService from '../payment/payment.service'
import * as paymentVoucherService from '../voucherPayment/voucherPayment.service'
import * as referVoucherService from '../referVouchers/referVouchers.service'
import * as chequebookService from '../ChequeBook/chequebook.service'
import * as chequeService from '../Cheque/cheque.service'
import * as pettyCashIOUService from '../pettycashIOU/pettycashIOU.service'
import * as commissionReportService from '../commissionReport/commissionReport.service'
import * as commissionRateService from '../commissionRate/commissionRate.service'
import * as bankRecJournalService from '../bankRecJournal/bankRecJournal.service'

export const voucherRouter = express.Router();

//GET LIST

voucherRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await voucherService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Voucher could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.get("/pendingVouchers", async (request: Request, response: Response) => {
    try {
        const pendingVoucher = await voucherService.getPendingVoucherCondition()
        if (pendingVoucher) {
            return response.status(200).json({ data: pendingVoucher });
        }
        return response.status(404).json({ message: "Vouchers could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.get("/approvedVouchers", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const approvedVochers = await voucherService.getApprovedVoucher(request.user.id)
        if (approvedVochers) {
            return response.status(200).json({ data: approvedVochers });
        }
        return response.status(404).json({ message: "Vouchers could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.get("/filter", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { VoucherGrpName, startDate, endDate, userId } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role === role.SALESMEN) {
            userId = request.user?.id;
            console.log(userId)
        }

        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpName is required." });
        }

        const grpname = await voucherGrpService.getbyname(VoucherGrpName);
        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0);

        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999);

        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        var vouchers;
        if (VoucherGrpName === 'GRN' || VoucherGrpName === 'PURCHASE-ORDER' || VoucherGrpName === 'PURCHASE-RETURN' || VoucherGrpName === 'STOCK-TRANSFER') {
            vouchers = await voucherService.getVouchersByPartyByUserAndDateRangeall(grpname?.id as string, filterStartDate, filterEndDate, userId);
        } else {
            vouchers = await voucherService.getVouchersByPartyByUserAndDateRange(grpname?.id as string, filterStartDate, filterEndDate, userId);

        }

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher group and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/bankRecVouchers", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { startDate, endDate } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const grpname = await voucherGrpService.getbyname("BANK-RECONCILIATION");
        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0);

        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999);

        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        var vouchers = await voucherService.getBankReconciliationVouchers(grpname?.id as string, filterStartDate, filterEndDate);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher group and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/rejectInvoices", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { startDate, endDate } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const grpname = await voucherGrpService.getbyname('INVOICE');

        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0);

        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999);

        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        const vouchers = await voucherService.getrejectInvoice(grpname?.id, filterStartDate, filterEndDate);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher group and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});


voucherRouter.get("/salemenwise", authenticate, async (request: ExpressRequest, response: Response) => {
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

        const vouchers = await voucherService.getSalesmanWiseVouchers(filterStartDate, filterEndDate, userId);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher group and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/filter/status", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { VoucherGrpName, status } = request.query;
        console.log(status)

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        var userId;
        if (request.user.role === role.SALESMEN) {
            userId = request.user?.id;
            console.log(userId)
        }

        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpName is required." });
        }

        const grpname = await voucherGrpService.getbyname(VoucherGrpName);
        const vouchers = await voucherService.getVouchersByStatusByUser(grpname?.id, status, userId);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/outstanding", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { VoucherGrpName, partyId, userId } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role === role.SALESMEN) {
            userId = request.user?.id;
            console.log(userId)
        }

        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpName is required." });
        }

        const grpname = await voucherGrpService.getbyname(VoucherGrpName);

        if (!grpname?.id) {
            return response.status(404).json({ message: "Voucher group not found." });
        }

        const vouchers = await voucherService.getVouchersByPartyOutstanding(grpname.id as string, partyId, userId);

        // if (!vouchers || vouchers.length === 0) {
        //     return response.status(404).json({ message: "No vouchers found for the specified Voucher group or party." });
        // }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/settlement", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var { VoucherGrpName, partyId, userId } = request.query;

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role !== "ADMIN") {
            userId = request.user?.id;
        }

        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpName is required." });
        }

        const grpname = await voucherGrpService.getbyname(VoucherGrpName);

        if (!grpname?.id) {
            return response.status(404).json({ message: "Voucher group not found." });
        }

        const vouchers = await voucherService.getVouchersByPartySettlement(grpname.id as string, partyId, userId);

        // if (!vouchers || vouchers.length === 0) {
        //     return response.status(404).json({ message: "No vouchers found for the specified Voucher group or party." });
        // }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/refVoucher", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        const { VoucherGrpName, partyId } = request.query;

        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpname is required." });
        }

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        var userId;
        if (request.user.role === "SALESMEN") {
            userId = request.user?.id;
        }

        const grpname = await voucherGrpService.getbyname(VoucherGrpName)

        const vouchers = await voucherService.getRefVoucherbyVoucherGrpid({ voucherGroupId: grpname?.id, partyId: partyId }, userId);

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/refVoucherbyChartofacc", async (request: Request, response: Response) => {
    try {
        const { VoucherGrpName, partyId } = request.query;
        console.log(partyId)
        if (!VoucherGrpName) {
            return response.status(400).json({ message: "VoucherGrpname is required." });
        }
        const grpname = await voucherGrpService.getbyname(VoucherGrpName)
        const party = await partyService.get(partyId)
        const vouchers = await voucherService.getRefVoucherbychartofacc({ voucherGroupId: grpname?.id, chartofAccountId: party?.chartofAccountId });

        if (!vouchers || vouchers.length === 0) {
            return response.status(404).json({ message: "No vouchers found for the specified Voucher and date range." });
        }

        return response.status(200).json({ data: vouchers });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return response.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/vouchersByAuthUser", async (req: Request, res: Response) => {
    try {
        let { month, year } = req.query;

        // Get current month and year if not provided
        if (!month || !year) {
            const currentDate = new Date();
            month = month || (currentDate.getMonth() + 1).toString(); // JavaScript months are 0-indexed, so add 1
            year = year || currentDate.getFullYear().toString();
        }

        const vouchersGroupedByAuthUser = await voucherService.getVouchersGroupedByAuthUserWithVisits(parseInt(month as string), parseInt(year as string));

        // console.log(vouchersGroupedByAuthUser)
        return res.status(200).json({ data: vouchersGroupedByAuthUser });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return res.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/dashboardFigures", async (req: Request, res: Response) => {
    try {
        let { month, year } = req.query;

        // Get current month and year if not provided
        if (!month || !year) {
            const currentDate = new Date();
            month = month || (currentDate.getMonth() + 1).toString(); // JavaScript months are 0-indexed, so add 1
            year = year || currentDate.getFullYear().toString();
        }

        const vouchersGroupedByAuthUser = await voucherService.dashboardFiguresByUser(parseInt(month as string), parseInt(year as string));

        // console.log(vouchersGroupedByAuthUser)
        return res.status(200).json({ data: vouchersGroupedByAuthUser });
    } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        return res.status(500).json({ message: "An error occurred while retrieving vouchers.", error: error.message });
    }
});

voucherRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await voucherService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Voucher could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.get("/voucherNumber/:vouchername", async (request: Request, response: Response) => {
    const vouchername: any = request.params.vouchername;
    try {
        const voucherGrpId = await voucherGrpService.getbyname(vouchername)
        const newVoucherNumber = await voucherService.generateVoucherNumber(voucherGrpId?.id)
        if (newVoucherNumber) {
            return response.status(200).json({ data: newVoucherNumber });
        }
        return response.status(404).json({ message: "Voucher Number could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.get("/bankRec/startingValue/:bankId", async (request: Request, response: Response) => {
    const bankId: any = request.params.bankId;
    try {
        const startingValue = await voucherService.getstartValue(bankId)
        if (startingValue) {
            return response.status(200).json({ data: startingValue });
        }
        return response.status(404).json({ message: "Voucher Number could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.get("/group/:vouchername", async (request: Request, response: Response) => {
    const vouchername: any = request.params.vouchername;
    try {
        const voucherGrpId = await voucherGrpService.getbyname(vouchername)
        const vouchersbyGrp = await voucherService.getVoucherbyGrp(voucherGrpId?.id)
        if (vouchersbyGrp) {
            return response.status(200).json({ data: vouchersbyGrp });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.get("/party/:partyId", async (request: Request, response: Response) => {
    const partyId: any = request.params.partyId;
    try {
        const voucherbyParty = await voucherService.getVoucherbyParty(partyId)
        if (voucherbyParty) {
            return response.status(200).json({ data: voucherbyParty });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.post("/chartofAcc/condition/:chartofaccId", authenticate, async (request: ExpressRequest, response: Response) => {
    const chartofaccId: any = request.params.chartofaccId;
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const voucherbyParty = await voucherService.getVoucherbyChartofacc(chartofaccId, data.condition)
        if (voucherbyParty) {
            return response.status(200).json({ data: voucherbyParty });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.post("/party/condition/:partyId", authenticate, async (request: ExpressRequest, response: Response) => {
    const partyId: any = request.params.partyId;
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const voucherbyParty = await voucherService.getVoucherbyPartytrue(partyId, data.condition)
        if (voucherbyParty) {
            return response.status(200).json({ data: voucherbyParty });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

voucherRouter.get("/party/false/:partyId", async (request: Request, response: Response) => {
    const partyId: any = request.params.partyId;
    try {
        const voucherbyParty = await voucherService.getVoucherbyPartyfalse(partyId)
        if (voucherbyParty) {
            return response.status(200).json({ data: voucherbyParty });
        }
        return response.status(404).json({ message: "Voucher Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

// voucherRouter.post("/loop", async (request: Request, response: Response) => {
//     const partyId: any = request.params.partyId;
//     const data: any = request.body;
//     try {
//         const vouchers = await voucherService.dataLoop()
//         if (vouchers) {
//             vouchers.map(async (voucher) => {
//                 const party = await partyService.get(voucher.partyId);
//                 const journalLineData1 = {
//                     voucherId: voucher.id,
//                     date: voucher.date,
//                     chartofAccountId: party?.chartofAccountId,
//                     debitAmount: voucher.PaymentVoucher[0].amount || 0,
//                     creditAmount: 0,
//                     createdBy: voucher.createdBy,
//                 };
//                 const journalLineData2 = {
//                     voucherId: voucher.id,
//                     date: voucher.date,
//                     chartofAccountId: party?.chartofAccountId,
//                     debitAmount: 0,
//                     creditAmount: voucher.PaymentVoucher[0].amount || 0,
//                     createdBy: voucher.createdBy,
//                 };
//                 await journalLineService.create(journalLineData1);
//                 await journalLineService.create(journalLineData2);
//             })
//         }
//         else {
//             return response.status(404).json({ message: "Voucher Group could not be found" });
//         }
//         return response.status(200).json({ message: "Loop completed successfully" });
//     } catch (error: any) {
//         return response.status(500).json(error.message);
//     }
// })

//POST
voucherRouter.post("/StockVerification", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        var data: any = request.body;
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const userId = request.user.id;
        const voucherGrpdetails = await voucherGrpService.getbyname(data.voucherGroupname)
        const newVoucherNumber = await voucherService.generateVoucherNumber(voucherGrpdetails?.id)

        var totalCost = 0;
        var partyAcc: any;

        if (data?.partyId) {
            partyAcc = await partyService.get(data?.partyId)
        }
        if (data.productList) {
            totalCost = data.productList?.reduce((total: number, product: any) => {
                return total + (product.cost * product.quantity);
            }, 0);
        }
        console.log(data)
        const newVoucher = await voucherService.create({
            ...data,
            authUser: data.authUser ? data.authUser : userId,
            voucherNumber: newVoucherNumber,
            voucherGroupId: voucherGrpdetails?.id,
            createdBy: userId
        })


        if (data.refVoucherNumber) {
            await voucherService.updateVoucherNumber({ refVoucherNumber: data.refVoucherNumber, returnValue: data?.returnValue, isRef: true, voucherId: newVoucher.voucherNumber, status: data?.status })
        }
        if (voucherGrpdetails?.inventoryMode === "PLUS") {
            const newVoucherCenter = await voucherCenter.create({
                centerId: data.centerId,
                voucherId: newVoucher.id,
                centerStatus: "IN"
            })
            if (!newVoucherCenter) {
                throw new Error("Failed to update Voucher Center to list association");
            }

            // if (data.productList) {
            //     const centerPromises = data.productList?.map(async (product: any) => {
            //         const avastock = await inventoryService.getFinalQuantity(product.productId, data.centerId);
            //         if (avastock){

            //             const voucherProduct = await productVoucherService.create({
            //                 cost: product.cost,
            //                 quantity: avastock- product.quantity,
            //                 remainingQty: product.quantity,
            //                 discount: product.discount,
            //                 stockStatus: data?.stockStatus,
            //                 MRP: product.MRP,
            //                 minPrice: product.minPrice,
            //                 sellingPrice: product.sellingPrice,
            //                 amount: product.amount,
            //                 voucherId: newVoucher.id,
            //                 productId: product.productId,
            //                 centerId: data.centerId
            //             });
            //         }

            //     });
            //     try {
            //         await Promise.all(centerPromises);
            //     } catch (error: any) {
            //         return response.status(500).json({ message: error.message });
            //     }
            // }
            if (data.productList) {
                const centerPromises = data.productList.map(async (product: any) => {
                    const avastock = await inventoryService.getFinalQuantity(product.productId, data.centerId);

                    if (avastock !== undefined) {
                        let quantity = 0;

                        if (avastock > 0) {
                            quantity = product.quantity;
                        } else {
                            const absStock = Math.abs(avastock);
                            quantity = product.quantity > absStock ? product.quantity - absStock : 0;
                        }


                        const voucherProduct = await productVoucherService.create({
                            cost: product.cost,
                            quantity: product.quantity,
                            remainingQty: product.quantity,
                            discount: product.discount,
                            stockStatus: data?.stockStatus,
                            MRP: product.MRP,
                            minPrice: product.minPrice,
                            sellingPrice: product.sellingPrice,
                            amount: product.amount,
                            voucherId: newVoucher.id,
                            productId: product.productId,
                            centerId: data.centerId,
                            expDate: product.expiryDate,
                            batchNo: product.batchNo,
                            mfdate:product.mfdate,
                        });
                    }
                });

                try {
                    await Promise.all(centerPromises);
                } catch (error: any) {
                    return response.status(500).json({ message: error.message });
                }
            }

            if (voucherGrpdetails?.isAccount === false) {
                const inventoryPromise = data.productList.map(async (product: any) => {
                    if (data.voucherGroupname === 'STOCK-VERIFICATION') {
                        const avastock = await inventoryService.getFinalQuantity(product.productId, data.centerId);

                        if (avastock !== undefined) {
                            let quantity = 0;

                            if (avastock > 0) {
                                quantity = avastock + product.quantity;
                            } else {
                                const absStock = Math.abs(avastock);
                                quantity = product.quantity > absStock ? product.quantity - absStock : 0;
                            }

                            const inventory = await inventoryService.upsert({
                                productId: product.productId,
                                centerId: data.centerId,
                                quantity: avastock,
                                cost: product.cost,
                                minPrice: product.minPrice,
                                MRP: product.MRP,
                                sellingPrice: product.sellingPrice,
                            });
                            if (!inventory) {
                                throw new Error("Failed to update product to list association");
                            }
                        }

                    } else {
                        if (data.stockStatus === true) {

                            const inventory = await inventoryService.upsert({
                                productId: product.productId,
                                centerId: data.centerId,
                                quantity: product.quantity
                            });
                            if (!inventory) {
                                throw new Error("Failed to update product to list association");
                            }


                        }
                    }

                });

                try {
                    await Promise.all(inventoryPromise);
                } catch (error: any) {
                    return response.status(500).json({ message: error.message });
                }
            }
        }
        if (newVoucher) {
            return response.status(201).json({ message: "Transaction Saved Successfully", data: newVoucher });
        }
    } catch (error: any) {
        console.error("Error creating voucher:", error);  // Add more detailed logging
        return response.status(500).json({ message: error.message });
    }
}),

    voucherRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
        var data: any = request.body;
        try {

            if (!request.user) {
                return response.status(401).json({ message: "User not authorized" });
            }

            const userId = request.user.id;
            const voucherGrpdetails = await voucherGrpService.getbyname(data.voucherGroupname)
            const newVoucherNumber = await voucherService.generateVoucherNumber(voucherGrpdetails?.id)

            var totalCost = 0;
            var partyAcc: any;

            if (data?.partyId) {
                partyAcc = await partyService.get(data?.partyId)
            }
            if (data.productList) {
                totalCost = data.productList?.reduce((total: number, product: any) => {
                    return total + (product.cost * product.quantity);
                }, 0);
            }
            console.log(data)
            const newVoucher = await voucherService.create({
                ...data,
                authUser: data.authUser ? data.authUser : userId,
                voucherNumber: newVoucherNumber,
                voucherGroupId: voucherGrpdetails?.id,
                createdBy: userId
            })


            if (data.refVoucherNumber) {
                await voucherService.updateVoucherNumber({ refVoucherNumber: data.refVoucherNumber, returnValue: data?.returnValue, isRef: true, voucherId: newVoucher.voucherNumber, status: data?.status })
            }

            if (voucherGrpdetails?.inventoryMode === "DOUBLE") {
                const centerPromises = data.productList.map(async (product: any) => {
                    const voucherProduct = await productVoucherService.create({
                        cost: product.cost,
                        quantity: product.quantity,
                        discount: product.discount,
                        MRP: product.MRP,
                        minPrice: product.minPrice,
                        sellingPrice: product.sellingPrice,
                        amount: product.amount,
                        voucherId: newVoucher.id,
                        productId: product.productId,
                        centerId: data.fromCenterId,
                        toCenterId: data.toCenterId,
                        expDate: product.expiryDate,
                        batchNo: product.batchNo,
                        Packsize: data.Packsize,
                        Manufacture: data.Manufacture,
                        country: data.country,
                        usdRate:product.usdRate,
                        mfdate:product.mfdate,
                        
                    });
                    if (!voucherProduct) {
                        throw new Error("Failed to update product to list association");
                    }
                    try {
                        await Promise.all(centerPromises);
                    } catch (error: any) {
                        return response.status(500).json({ message: error.message });
                    }
                });
                if (data.fromCenterId) {
                    const newVoucherCenter = await voucherCenter.create({
                        centerId: data.fromCenterId,
                        voucherId: newVoucher.id,
                        centerStatus: "OUT"
                    })
                    if (!newVoucherCenter) {
                        throw new Error("Failed to update Voucher Center to list association");
                    }
                    const inventoryPromise = data.productList.map(async (product: any) => {
                        const inventory = await inventoryService.upsert({
                            productId: product.productId,
                            centerId: data.fromCenterId,
                            quantity: -(product.quantity),
                            batchNo: product.batchNo,
                            expDate: product.expiryDate,
                            mfdate:product.mfdate,
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
                if (data.toCenterId) {
                    const newVoucherCenter = await voucherCenter.create({
                        centerId: data.toCenterId,
                        voucherId: newVoucher.id,
                        centerStatus: "IN"
                    })
                    if (!newVoucherCenter) {
                        throw new Error("Failed to update Voucher Center to list association");
                    }
                    const inventoryPromise = data.productList.map(async (product: any) => {
                        const inventory = await inventoryService.upsert({
                            productId: product.productId,
                            centerId: data.toCenterId,
                            quantity: product.quantity,
                            batchNo: product.batchNo,
                            expDate: product.expiryDate,
                            mfdate:product.mfdate,
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
            }
            else {
                if (data.payment) {
                    const onlineTransfer = await paymentService.getbyname('Online Transfer');
                    const cash = await paymentService.getbyname('Cash');
                    const Cheque = await paymentService.getbyname('Cheque');
                    const Credit = await paymentService.getbyname('Credit');
                    const Advance = await paymentService.getbyname('Advance');

                    // Prepare payment vouchers
                    const paymentVouchers = [
                        { voucherId: newVoucher.id, paymentId: onlineTransfer?.id, paymentType: onlineTransfer?.type, amount: data.payment.onlineTransfer, refNumber: data.payment.refNumber },
                        { voucherId: newVoucher.id, paymentId: cash?.id, paymentType: cash?.type, amount: data.payment.cash },
                        { voucherId: newVoucher.id, paymentId: Cheque?.id, paymentType: Cheque?.type, amount: data.payment.cheque },
                        { voucherId: newVoucher.id, paymentId: Credit?.id, paymentType: Credit?.type, amount: data.payment.credit },
                        { voucherId: newVoucher.id, paymentId: Advance?.id, paymentType: Advance?.type, amount: data.payment.advance },
                    ].filter(record => record.paymentId && record.amount > 0);

                    let chequePaymentVoucher = null;

                    // Loop to create each payment voucher and capture the cheque payment voucher
                    for (const voucher of paymentVouchers) {
                        const createdVoucher = await paymentVoucherService.create(voucher);

                        // Check if this is the cheque voucher
                        if (voucher.paymentId === Cheque?.id) {
                            chequePaymentVoucher = createdVoucher;
                        }
                    }
                    // Now handle the cheque creation if applicable
                    if (data.payment.cheque > 0 && chequePaymentVoucher) {
                        const cheque = await chequeService.create({
                            chequeNumber: data.payment.chequenumber.toString(),
                            chequeBankName: data.payment.chequeBankName,
                            issueDate: data.date,
                            releaseDate: data.payment.releaseDate,
                            amount: data.payment.cheque,
                            chequeBookId: data.payment?.chequeBookId,
                            voucherId: newVoucher.id,
                            paymentVoucherId: chequePaymentVoucher.id,
                            creditDebit: data.payment.creditDebit,
                            createdBy: userId
                        });
                        if (data.payment?.chequeBookId !== undefined) {
                            await chequebookService.updatechequeRemaning(data.payment?.chequeBookId);
                        }
                    }

                    if (data.voucherGroupname === "INVOICE" && data.paidValue > 0) {
                        const invoiceDate = new Date(data.date);
                        invoiceDate.setHours(0, 0, 0, 0);

                        // Calculate the days difference (although in your current code, it's always zero)
                        const invoicedays = 0; // Consider calculating the difference with a reference date if needed

                        const rates = await commissionRateService.list();

                        // Filter rates and find the appropriate rate based on invoicedays
                        const rate = rates.find(rate => rate.days != null && invoicedays <= rate.days);

                        const commissionRate = rate?.commissionRate || "0%";
                        const commission = await commissionReportService.create({
                            date: data.date,
                            voucherId: newVoucher.id,
                            comRate: commissionRate,
                            amount: data.paidValue
                        });
                    }

                }

                if (data.voucherGroupname !== "DIRECT PAYMENT") {
                    if (data.selectedVoucherIds && data.amount > 0) {
                        let remainingAmount = data.amount; // Amount to be paid
                        const selectedVouchers = await voucherService.findManyByIds(data.selectedVoucherIds.map((v: any) => v.voucherId));

                        for (const voucher of selectedVouchers) {
                            // Safely handle the voucher.amount and voucher.paidValue as Decimal or number
                            const voucherAmount = voucher.amount instanceof Prisma.Decimal ? voucher.amount.toNumber() : (voucher.amount || 0);
                            const paidValue = voucher.paidValue instanceof Prisma.Decimal ? voucher.paidValue.toNumber() : (voucher.paidValue || 0);

                            const remainingVoucherAmount = voucherAmount - paidValue; // Remaining unpaid amount for this voucher

                            if (remainingAmount <= 0) {
                                break; // No remaining amount to distribute
                            }

                            // Calculate how much can be paid on this voucher
                            const payableAmount = Math.min(remainingVoucherAmount, remainingAmount);

                            if (payableAmount > 0) {
                                // Update the paidValue of the voucher
                                const updatedPaidValue = paidValue + payableAmount;

                                await voucherService.updatepaidValue({
                                    id: voucher.id,
                                    paidValue: updatedPaidValue
                                });
                                var selectedVoucher = await voucherService.getbyid(voucher.id)
                                await referVoucherService.create({
                                    refVoucherNumber: selectedVoucher?.voucherNumber,
                                    invoiceDate: selectedVoucher?.date,
                                    invoiceAmount: selectedVoucher?.amount,
                                    value: selectedVoucher?.value,
                                    settledAmount: updatedPaidValue,
                                    paidAmount: updatedPaidValue - paidValue,
                                    voucherId: newVoucher.id,
                                    createdBy: userId
                                });
                                if (selectedVoucher?.voucherNumber?.startsWith('INV')) {
                                    if (selectedVoucher.date) {
                                        const invoiceDate = new Date(selectedVoucher.date);
                                        const payDate = new Date(data.date);
                                        invoiceDate.setHours(0, 0, 0, 0);
                                        payDate.setHours(0, 0, 0, 0);

                                        const timeDifference = payDate.getTime() - invoiceDate.getTime();
                                        const dueDays = selectedVoucher.dueDays ?? 0;
                                        const invoicedays = (timeDifference / (1000 * 60 * 60 * 24) - dueDays);

                                        const rates = await commissionRateService.list();
                                        const rate = rates.find(rate => rate.days != null && invoicedays <= rate.days);

                                        console.log(dueDays, invoicedays, rate)

                                        const commissionRate = rate?.commissionRate || "0%";
                                        await commissionReportService.create({
                                            date: data.date,
                                            voucherId: selectedVoucher.id,
                                            comRate: commissionRate,
                                            amount: updatedPaidValue - paidValue
                                        });
                                    }
                                }

                                // Decrease the remaining amount by the amount just paid
                                remainingAmount -= payableAmount;
                            }
                        }

                        if (remainingAmount > 0) {
                            // If there's still some remaining amount that couldn't be distributed
                            return response.status(400).json({ message: "Payment exceeds total due for selected vouchers." });
                        }
                    }
                }

                if (data.journalEntries && data.journalEntries.length > 0) {
                    const journalEntries = data.journalEntries;

                    // Loop through each journal entry and create corresponding journalLine
                    for (let entry of journalEntries) {
                        var chartofAccId = entry.accountId
                        if (entry.accountId === "CASH") {
                            var cashchartofaccid = await chartofaccService.getbyname('CASH BOOK')
                            chartofAccId = cashchartofaccid?.id
                        }
                        if (entry.accountId === "Check") {
                            var pendingCheque = await chartofaccService.getbyname('PENDING CHEQUE')
                            chartofAccId = pendingCheque?.id
                        }
                        if (entry.accountId === "Expencess") {
                            var expencessacc = await chartofaccService.getbyname('EXPENCESS ACCOUNT')
                            chartofAccId = expencessacc?.id
                        }
                        if (entry.accountId === "PettyCash") {
                            var expencessacc = await chartofaccService.getbyname('PETTY CASH')
                            chartofAccId = expencessacc?.id
                        }
                        if (entry.accountId === "UserExp") {
                            var expencessacc = await chartofaccService.getbyname('USER EXPENCESS ACCOUNT')
                            chartofAccId = expencessacc?.id
                        }
                        if (entry.accountId === "Sales") {
                            var expencessacc = await chartofaccService.getbyname('SALES ACCOUNT')
                            chartofAccId = expencessacc?.id
                        }
                        if (entry.accountId === "INVENTORY") {
                            var inventoryAcc = await chartofaccService.getbyname('INVENTORY ACCOUNT')
                            chartofAccId = inventoryAcc?.id
                        }
                        if (entry.accountId === "IMPORT") {
                            var inventoryAcc = await chartofaccService.getbyname('IMPORT CONTROL ACCOUNT')
                            chartofAccId = inventoryAcc?.id
                        }
                        if (entry.accountId === "COST") {
                            var inventoryAcc = await chartofaccService.getbyname('COST OF SALES')
                            chartofAccId = inventoryAcc?.id
                        }
                        const journalLineData = {
                            voucherId: newVoucher.id, // Link to the created voucher
                            date: newVoucher.date, // Date of the voucher
                            chartofAccountId: chartofAccId, // Account ID from the journal entry
                            debitAmount: entry.debit || 0, // Debit amount if present
                            creditAmount: entry.credit || 0, // Credit amount if present
                            ref: entry.ref, // Reference number from the voucher
                            createdBy: userId, // Assuming `req.user.id` contains the user ID
                        };

                        await journalLineService.create(journalLineData);
                    }
                }

                if (data.iou && data.iou.length > 0) {
                    const iou = data.iou;
                    for (let entry of iou) {
                        const ioudata = {
                            voucherId: newVoucher.id,
                            userid: entry.userid,
                            amount: entry.amount,
                            createdBy: userId,
                        }
                        await pettyCashIOUService.create(ioudata);
                    }
                }

                if (data.productList) {
                    const centerPromises = data.productList?.map(async (product: any) => {
                        const voucherProduct = await productVoucherService.create({
                            cost: product.cost,
                            quantity: product.quantity,
                            remainingQty: product.quantity,
                            discount: product.discount,
                            stockStatus: data?.stockStatus,
                            MRP: product.MRP,
                            minPrice: product.minPrice,
                            sellingPrice: product.sellingPrice,
                            amount: product.amount,
                            voucherId: newVoucher.id,
                            productId: product.productId,
                            centerId: data.centerId,
                            expDate: product.expiryDate,
                            closingExpDate: product.costingExpiryDate,
                            batchNo: product.batchNo,
                            Packsize: product.Packsize,
                            Manufacture: product.Manufacture,
                            country: product.country,
                            usdRate:product.usdRate,
                            mfdate:product.mfdate,
                        });
                    });
                    try {
                        await Promise.all(centerPromises);
                    } catch (error: any) {
                        return response.status(500).json({ message: error.message });
                    }
                }

                if (voucherGrpdetails?.inventoryMode === "PLUS") {
                    const newVoucherCenter = await voucherCenter.create({
                        centerId: data.centerId,
                        voucherId: newVoucher.id,
                        centerStatus: "IN"
                    })
                    if (!newVoucherCenter) {
                        throw new Error("Failed to update Voucher Center to list association");
                    }
                    if (voucherGrpdetails?.isAccount === true) {
                        const inventoryPromise = data.productList.map(async (product: any) => {
                            if (data.stockStatus === true) {
                                if (data.voucherGroupname === 'GRN') {
                                    const inventory = await inventoryService.upsert({
                                        productId: product.productId,
                                        centerId: data.centerId,
                                        quantity: product.quantity,
                                        cost: product.cost,
                                        minPrice: product.minPrice,
                                        MRP: product.MRP,
                                        sellingPrice: product.sellingPrice,
                                        batchNo: product.batchNo,
                                        expDate: product.expiryDate,
                                        closingExpDate: product.costingExpiryDate,
                                        mfdate:product.mfdate,
                                    });
                                    if (!inventory) {
                                        throw new Error("Failed to update product to list association");
                                    }
                                } else {
                                    if (data.stockStatus === true) {
                                        const inventory = await inventoryService.upsert({
                                            productId: product.productId,
                                            centerId: data.centerId,
                                            quantity: product.quantity,
                                            batchNo: product.batchNo,
                                            expDate: product.expiryDate,
                                            closingExpDate: product.costingExpiryDate,
                                            mfdate:product.mfdate,
                                        });
                                        if (!inventory) {
                                            throw new Error("Failed to update product to list association");
                                        }
                                    }
                                }
                            }


                        });

                        try {
                            await Promise.all(inventoryPromise);
                        } catch (error: any) {
                            return response.status(500).json({ message: error.message });
                        }
                    }
                }

                if (voucherGrpdetails?.inventoryMode === "MINUS") {
                    const newVoucherCenter = await voucherCenter.create({
                        centerId: data.centerId,
                        voucherId: newVoucher.id,
                        centerStatus: "OUT"
                    })
                    if (!newVoucherCenter) {
                        throw new Error("Failed to update Voucher Center to list association");
                    }

                    if (data.stockStatus === true) {
                        const inventoryPromise = data.productList.map(async (product: any) => {
                            const inventory = await inventoryService.upsert({
                                productId: product.productId,
                                centerId: data.centerId,
                                quantity: -(product.quantity),
                                batchNo: product.batchNo,
                                expDate: product.expiryDate,
                                closingExpDate: product.costingExpiryDate,
                                mfdate:product.mfdate,
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
                }

                if (data.bankRecJournal && data.bankRecJournal.length > 0) {
                    const journalPromise = data.bankRecJournal?.map(async (record: any) => {
                        const bankRecJournal = await bankRecJournalService.create({
                            date: record.date,
                            voucherId: newVoucher.id,
                            chartofAccountId: record.chartofAccountId,
                            debitAmount: record.debitAmount,
                            creditAmount: record.creditAmount,
                            ref: record.ref,
                            isStatus: record.isStatus,
                            createdBy: userId
                        });
                        const updateJournalLine = await journalLineService.updateStatus({ isStatus: record.isStatus }, record.id);
                    });
                    try {
                        await Promise.all(journalPromise);
                    } catch (error: any) {
                        return response.status(500).json({ message: error.message });
                    }
                }
            }
            if (newVoucher) {
                return response.status(201).json({ message: "Transaction Saved Successfully", data: newVoucher });
            }
        } catch (error: any) {
            console.error("Error creating voucher:", error);  // Add more detailed logging
            return response.status(500).json({ message: error.message });
        }
    })

voucherRouter.put("/pendingVoucherApproval/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    var data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const userId = request.user.id;
        const voucherGroup = await voucherGrpService.getById(data.voucherGroupId)

        if (data.stockStatus === true) {
            if (voucherGroup?.inventoryMode === "PLUS") {
                const inventoryPromise = data.voucherProduct.map(async (product: any) => {
                    const inventory = await inventoryService.upsert({
                        productId: product.productId,
                        centerId: product.centerId,
                        quantity: product.quantity,
                        batchNo: product.batchNo,
                        expDate: product.expDate,
                        mfdate:product.mfdate,
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

            if (voucherGroup?.inventoryMode === "MINUS") {
                const inventoryCheckPromises = data.voucherProduct.map(async (product: any) => {
                    const inventoryStock = await inventoryService.getbycenterIdProductId(product.productId, product.centerId, product.batchNo);

                    if (Number(inventoryStock?.quantity ?? 0) < Number(product.quantity)) {
                        throw new Error(`Insufficient stock for product ${product.product.printName} Available Quantity is ${inventoryStock?.quantity ?? 0} `);
                    }
                });

                try {
                    await Promise.all(inventoryCheckPromises);
                } catch (error: any) {
                    return response.status(400).json({ message: error.message });
                }

                const inventoryPromise = data.voucherProduct.map(async (product: any) => {
                    const inventory = await inventoryService.upsert({
                        productId: product.productId,
                        centerId: product.centerId,
                        quantity: -(product.quantity),
                        batchNo: product.batchNo,
                        expDate: product.expDate,
                        mfdate:product.mfdate,
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
        }

        // Process journal entries if available
        if (data.journalEntries && data.journalEntries.length > 0) {
            const journalEntries = data.journalEntries;

            // Loop through each journal entry and create corresponding journalLine
            for (let entry of journalEntries) {
                var chartofAccId = entry.accountId
                if (entry.accountId === "CASH") {
                    var cashchartofaccid = await chartofaccService.getbyname('CASH BOOK')
                    chartofAccId = cashchartofaccid?.id
                }
                if (entry.accountId === "Check") {
                    var pendingCheque = await chartofaccService.getbyname('PENDING CHEQUE')
                    chartofAccId = pendingCheque?.id
                }
                if (entry.accountId === "Expencess") {
                    var expencessacc = await chartofaccService.getbyname('EXPENCESS ACCOUNT')
                    chartofAccId = expencessacc?.id
                }
                if (entry.accountId === "PettyCash") {
                    var expencessacc = await chartofaccService.getbyname('PETTY CASH')
                    chartofAccId = expencessacc?.id
                }
                if (entry.accountId === "UserExp") {
                    var expencessacc = await chartofaccService.getbyname('USER EXPENCESS ACCOUNT')
                    chartofAccId = expencessacc?.id
                }
                if (entry.accountId === "Sales") {
                    var expencessacc = await chartofaccService.getbyname('SALES ACCOUNT')
                    chartofAccId = expencessacc?.id
                }
                if (entry.accountId === "INVENTORY") {
                    var inventoryAcc = await chartofaccService.getbyname('INVENTORY ACCOUNT')
                    chartofAccId = inventoryAcc?.id
                }
                if (entry.accountId === "IMPORT") {
                    var inventoryAcc = await chartofaccService.getbyname('IMPORT CONTROL ACCOUNT')
                    chartofAccId = inventoryAcc?.id
                }
                if (entry.accountId === "COST") {
                    var inventoryAcc = await chartofaccService.getbyname('COST OF SALES')
                    chartofAccId = inventoryAcc?.id
                }

                const journalLineData = {
                    voucherId: id.id,
                    date: data.date,
                    chartofAccountId: chartofAccId, // Account ID from the journal entry
                    debitAmount: entry.debit || 0, // Debit amount if present
                    creditAmount: entry.credit || 0, // Credit amount if present
                    ref: entry.ref, // Reference number from the voucher
                    createdBy: userId, // Assuming `req.user.id` contains the user ID
                };
                await journalLineService.create(journalLineData);
            }
        }

        if (data.payment) {
            const onlineTransfer = await paymentService.getbyname('Online Transfer');
            const cash = await paymentService.getbyname('Cash');
            const Cheque = await paymentService.getbyname('Cheque');
            const Credit = await paymentService.getbyname('Credit');

            // Prepare payment vouchers
            const paymentVouchers = [
                { voucherId: id.id, paymentId: onlineTransfer?.id, paymentType: onlineTransfer?.type, amount: data.payment.onlineTransfer, refNumber: data.payment.refNumber },
                { voucherId: id.id, paymentId: cash?.id, paymentType: cash?.type, amount: data.payment.cash },
                { voucherId: id.id, paymentId: Cheque?.id, paymentType: Cheque?.type, amount: data.payment.cheque },
                { voucherId: id.id, paymentId: Credit?.id, paymentType: Credit?.type, amount: data.payment.credit }
            ].filter(record => record.paymentId && record.amount > 0);

            let chequePaymentVoucher = null;

            // Loop to create each payment voucher and capture the cheque payment voucher
            for (const voucher of paymentVouchers) {
                const createdVoucher = await paymentVoucherService.create(voucher);

                // Check if this is the cheque voucher
                if (voucher.paymentId === Cheque?.id) {
                    chequePaymentVoucher = createdVoucher;
                }

            }
            // Now handle the cheque creation if applicable
            if (data.payment.cheque > 0 && chequePaymentVoucher) {

                const cheque = await chequeService.create({
                    chequeNumber: data.payment.chequenumber.toString(),
                    chequeBankName: data.payment.chequeBankName,
                    issueDate: data.date,
                    releaseDate: data.payment.releaseDate,
                    amount: data.payment.cheque,
                    chequeBookId: data.payment?.chequeBookId,
                    voucherId: id.id,
                    paymentVoucherId: chequePaymentVoucher.id,
                    creditDebit: data.payment.creditDebit,
                    createdBy: userId
                });
                if (data.payment?.chequeBookId !== undefined) {
                    await chequebookService.updatechequeRemaning(data.payment?.chequeBookId);
                }
            }

            if (voucherGroup?.voucherName === "INVOICE" && data.paidValue > 0) {
                const invoiceDate = new Date(data.date);
                invoiceDate.setHours(0, 0, 0, 0);

                // Calculate the days difference (although in your current code, it's always zero)
                const invoicedays = 0; // Consider calculating the difference with a reference date if needed

                const rates = await commissionRateService.list();

                // Filter rates and find the appropriate rate based on invoicedays
                const rate = rates.find(rate => rate.days != null && invoicedays <= rate.days);

                const commissionRate = rate?.commissionRate || "0%";
                const commission = await commissionReportService.create({
                    date: data.date,
                    voucherId: id.id,
                    comRate: commissionRate,
                    amount: data.paidValue
                });
            }
        }

        // Process voucher product if available
        if (data.voucherProduct && data.voucherProduct.length > 0) {
            const voucherProducts = data.voucherProduct;
            for (let product of voucherProducts) {
                const existingProduct = await productVoucherService.getbyVoucherId(product.id);
                if (existingProduct) {
                    await productVoucherService.updateVoucherProduct({ discount: product.discount, stockStatus: data?.stockStatus }, product.id);
                } else {
                    await productVoucherService.create(product);
                }
            }
        }

        data = {
            ...data,
            appovedBy: data.appovedBy ? data.appovedBy : userId
        }
        const updateVoucher = await voucherService.updatePendingVoucher(data, id);

        if (updateVoucher) {
            return response.status(201).json({ message: "Transaction Conformed Successfully", data: updateVoucher });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});

//PUT
voucherRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateVoucher = await voucherService.update(data, id)

        if (updateVoucher) {
            return response.status(201).json({ message: "Voucher Updated Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.put("/conform/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const userId = request.user.id;

        if (data.journalEntries && data.journalEntries.length > 0) {
            const journalEntries = data.journalEntries;

            // Loop through each journal entry and create corresponding journalLine
            for (let entry of journalEntries) {
                var partyDetails = await partyService.get(entry.accountId)
                var chartofAccId = partyDetails?.chartofAccountId

                if (entry.accountId === "IMPORT") {
                    var inventoryAcc = await chartofaccService.getbyname('IMPORT CONTROL ACCOUNT')
                    chartofAccId = inventoryAcc?.id
                }
                const journalLineData = {
                    voucherId: id.id,
                    date: data.date,
                    chartofAccountId: chartofAccId, // Account ID from the journal entry
                    debitAmount: entry.debit || 0, // Debit amount if present
                    creditAmount: entry.credit || 0, // Credit amount if present
                    ref: entry.ref, // Reference number from the voucher
                    createdBy: userId, // Assuming `req.user.id` contains the user ID
                };
                await journalLineService.create(journalLineData);
            }
        }

        const updateVoucher = await voucherService.updateConform(data, id)

        if (updateVoucher) {
            return response.status(201).json({ message: "Voucher Conform Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.put("/salesOrderCorrection/correct", async (request: Request, response: Response) => {
    try {
        const updateVoucher = await voucherService.pendingConform()

        if (updateVoucher) {
            return response.status(201).json(updateVoucher);
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

voucherRouter.put("/cancel/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateVoucher = await voucherService.voucherCancel(data, id)
        if (updateVoucher) {
            return response.status(201).json({ message: data.voucherGrpName + " Cancelled Successfully", data: updateVoucher });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})



