import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as vocuherService from './voucher.service'
import * as voucherGrpService from '../voucherGroup/vouchergrp.service'
import * as voucherCenter from '../centerVoucher/centerVoucher.service'
import * as productVoucherService from '../voucherProduct/voucherProduct.service'
import * as inventoryService from '../inventory/inventory.service'
import * as productService from '../product/product.service'
import * as jounallineService from '../journalline/journalline.service'
import * as chartofaccService from '../ChartofAccount/chartofaccount.service'
import * as partyService from '../party/party.service'
import * as paymentService from '../payment/payment.service'
import * as paymentVoucherService from '../voucherPayment/voucherPayment.service'

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

voucherRouter.get("/voucherNumber/:vouchername", async (request: Request, response: Response) => {
    const vouchername: any = request.params.vouchername;
    try {
        const voucherGrpId = await voucherGrpService.getbyname(vouchername)
        const newVoucherNumber = await vocuherService.generateVoucherNumber(voucherGrpId?.id)
        if (newVoucherNumber) {
            return response.status(200).json({ data: newVoucherNumber });
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
        const vouchersbyGrp = await vocuherService.getVoucherbyGrp(voucherGrpId?.id)
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
        const voucherbyParty = await vocuherService.getVoucherbyParty(partyId)
        if (voucherbyParty) {
            return response.status(200).json({ data: voucherbyParty });
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
        const partyAcc = await partyService.get(data.partyId)
        var totalCost = 0;

        if (data.productList) {
            totalCost = data.productList?.reduce((total: number, product: any) => {
                return total + (product.cost * product.quantity);
            }, 0);
        }

        if (voucherGrpdetails?.inventoryMode === "DOUBLE") {
            const newVoucher = await vocuherService.create({
                ...data,
                voucherNumber: newVoucherNumber,
                voucherGroupId: voucherGrpdetails?.id,
                createdBy: userId
            })
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
                        quantity: -(product.quantity)
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
                        quantity: product.quantity
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
        }

        else {
            const newVoucher = await vocuherService.create({
                ...data,
                voucherNumber: newVoucherNumber,
                voucherGroupId: voucherGrpdetails?.id,
                createdBy: userId
            })

            console.log(data)

            if (data.payment) {
                const onlineTransfer = await paymentService.getbyname('Online Transfer')
                const cash = await paymentService.getbyname('Cash')
                const Cheque = await paymentService.getbyname('Cheque')
                const Credit = await paymentService.getbyname('Credit')

                const paymentVouchers = [
                    { voucherId: newVoucher.id, paymentId: onlineTransfer?.id, amount: data.payment.onlineTransfer },
                    { voucherId: newVoucher.id, paymentId: cash?.id, amount: data.payment.cash },
                    { voucherId: newVoucher.id, paymentId: Cheque?.id, amount: data.payment.cheque },
                    { voucherId: newVoucher.id, paymentId: Credit?.id, amount: data.payment.credit }
                ].filter(record => record.paymentId);

                const paymentVoucherResult = await paymentVoucherService.createMany(paymentVouchers);
            }

            if (data.productList) {
                const centerPromises = data.productList?.map(async (product: any) => {
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

                    if (data.voucherGroupname === 'GRN') {
                        const updateProductPrices = await productService.updatePrices({
                            cost: product.cost,
                            minPrice: product.minPrice,
                            MRP: product.MRP,
                            sellingPrice: product.sellingPrice
                        }, product.productId)
                        if (!updateProductPrices) {
                            throw new Error("Failed to update product prices association");
                        }
                    }
                    if (!voucherProduct) {
                        throw new Error("Failed to update product to list association");
                    }
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
                    if (data.voucherGroupname === 'GRN') {
                        try {
                            // Fetch necessary accounts concurrently
                            const [inventoryAccount, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("INVENTORY ACCOUNT"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (inventoryAccount?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: inventoryAccount.id,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: 0,
                                        creditAmount: amount,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }
                    else {
                        try {
                            // Fetch necessary accounts concurrently
                            const [inventoryAccount, revenueAccount, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("INVENTORY ACCOUNT"),
                                chartofaccService.getbyname("REVENUE ACCOUNT"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (inventoryAccount?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;
                                const profit = parseFloat(amount) - totalCost

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: inventoryAccount.id,
                                        debitAmount: totalCost,
                                        creditAmount: 0,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: 0,
                                        creditAmount: totalCost,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: revenueAccount?.id,
                                        debitAmount: profit,
                                        creditAmount: 0,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }
                }

                const inventoryPromise = data.productList.map(async (product: any) => {
                    const inventory = await inventoryService.upsert({
                        productId: product.productId,
                        centerId: data.centerId,
                        quantity: product.quantity
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

            if (voucherGrpdetails?.inventoryMode === "MINUS") {

                const newVoucherCenter = await voucherCenter.create({
                    centerId: data.centerId,
                    voucherId: newVoucher.id,
                    centerStatus: "OUT"
                })

                if (!newVoucherCenter) {
                    throw new Error("Failed to update Voucher Center to list association");
                }

                const inventoryPromise = data.productList.map(async (product: any) => {
                    const inventory = await inventoryService.upsert({
                        productId: product.productId,
                        centerId: data.centerId,
                        quantity: -(product.quantity)
                    });
                    if (!inventory) {
                        throw new Error("Failed to update product to list association");
                    }
                });

                if (voucherGrpdetails?.isAccount === true) {
                    if (data.voucherGroupname === 'SALES') {
                        try {
                            // Fetch necessary accounts concurrently
                            const [inventoryAccount, revenueAccount, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("INVENTORY ACCOUNT"),
                                chartofaccService.getbyname("REVENUE ACCOUNT"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (inventoryAccount?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;
                                const profit = parseFloat(amount) - totalCost

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: inventoryAccount.id,
                                        debitAmount: 0,
                                        creditAmount: totalCost,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: revenueAccount?.id,
                                        debitAmount: 0,
                                        creditAmount: profit,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }
                    else {
                        try {
                            // Fetch necessary accounts concurrently
                            const [inventoryAccount, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("INVENTORY ACCOUNT"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (inventoryAccount?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: inventoryAccount.id,
                                        debitAmount: 0,
                                        creditAmount: amount,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }
                }

                try {
                    await Promise.all(inventoryPromise);
                } catch (error: any) {
                    return response.status(500).json({ message: error.message });
                }
            }

            if (voucherGrpdetails?.inventoryMode === "NONE") {
                if (voucherGrpdetails?.isAccount === true) {
                    if (data.voucherGroupname === 'PAYMENT') {
                        try {
                            // Fetch necessary accounts concurrently
                            const [paymode, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("CASH"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (paymode?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: paymode.id,
                                        debitAmount: 0,
                                        creditAmount: amount,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    })

                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }

                    if (data.voucherGroupname === 'RECEIPT') {
                        try {
                            // Fetch necessary accounts concurrently
                            const [paymode, partyAccountId] = await Promise.all([
                                chartofaccService.getbyname("CASH"),
                                partyAcc?.chartofAccountId
                            ]);

                            // Ensure both accounts exist
                            if (paymode?.id && partyAccountId) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: paymode.id,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: partyAccountId,
                                        debitAmount: 0,
                                        creditAmount: amount,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }

                    if (data.voucherGroupname === 'PETTY-CASH') {
                        try {
                            // Fetch necessary accounts concurrently
                            const [paymode, chartOfAcc] = await Promise.all([
                                chartofaccService.getbyname("PETTY-CASH"),
                                chartofaccService.getbyname("Tea")
                            ]);

                            // Ensure both accounts exist
                            if (paymode?.id && chartOfAcc) {
                                const { id: voucherId } = newVoucher;
                                const { amount } = data;

                                // Create journal lines concurrently
                                await Promise.all([
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: chartOfAcc.id,
                                        debitAmount: amount,
                                        creditAmount: 0,
                                        createdBy: userId
                                    }),
                                    jounallineService.create({
                                        voucherId,
                                        chartofAccountId: paymode.id,
                                        debitAmount: 0,
                                        creditAmount: amount,
                                        createdBy: userId
                                    })
                                ]);
                            } else {
                                console.error("Invalid account details: Inventory or party account is missing.");
                            }
                        } catch (error) {
                            console.error("Error creating journal lines:", error);
                        }
                    }
                }
            }
            if (newVoucher) {
                return response.status(201).json({ message: "Voucher Created Successfully" });
            }
        }
    } catch (error: any) {
        console.error("Error creating voucher:", error);  // Add more detailed logging
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
