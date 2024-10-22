import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as partyService from './party.service'
import * as partyGroupService from '../partyGroup/partyGroup.service'
import * as chartOfAccService from '../ChartofAccount/chartofaccount.service'
import * as accSubCategory from '../accountSubCategory/accountSubCategory.service'
import * as accGrp from '../accountGroup/accountGroup.service'
import * as partyCategoryService from '../partyCategory/partyCategory.service'
import * as visitingCustomerService from '../visitedCustomer/visitedCustomer.service'
import multer from "multer";
import path from 'path';

export const partyRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/'); // Ensure this matches the folder name
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Give the file a unique name
    }
});

// Initialize the multer middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

//GET LIST
partyRouter.get("/", async (request: Request, response: Response) => {
    try {
        const partyGroup = await partyGroupService.getbyname('CUSTOMER')
        const party = await partyService.list(partyGroup?.id)
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
partyRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const party = await partyService.get(id)
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyRouter.get("/partygroup/:name", async (request: Request, response: Response) => {
    const name: any = request.params.name;
    const condition: boolean = request.query.condition === 'true';
    console.log(condition)
    try {
        const partyGroup = await partyGroupService.getbyname(name)
        const party = await partyService.getbyGroup(partyGroup?.id, condition)
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        if (!data.partyGroup) {
            return response.status(401).json({ message: "Party Group Undefined" });
        }

        const phoneNumber = await partyService.phoneNumberCheck(data.phoneNumber)
        if (phoneNumber?.phoneNumber === data.phoneNumber) {
            return response.status(401).json({ message: "Phone Number Already Exists" });
        }

        var subAcc;
        var accGroup
        var isverified = false
        var partycategory;
        var partyCateId;
        if (data.partyGroup === "SUPPLIER") {
            isverified = true
            subAcc = await accSubCategory.getbyname("CURRENT LIABILITIES")
            accGroup = await accGrp.getbyname("Payable")
            partycategory = await partyCategoryService.getbyname('COMMON SUPPLIER')
            partyCateId = partycategory?.id;
        }
        else {
            subAcc = await accSubCategory.getbyname("CURRENT ASSETS")
            accGroup = await accGrp.getbyname("Receivable")
            partyCateId = data.partyCategoryId
            // if (data.visitingCustomer) {
            //     partycategory = await partyCategoryService.getbyname('VISITING CUSTOMER')
            //     partyCateId = partycategory?.id;
            // } else {
            // }
        }

        const partyGroup = await partyGroupService.getbyname(data.partyGroup)
        if (!partyGroup) {
            return response.status(401).json({ message: "Party Group Invalid" });
        }

        const chartofacc = await chartOfAccService.create({ accountName: data.name, accountSubCategoryId: subAcc?.id, accountGroupId: accGroup?.id, Opening_Balance: data.Opening_Balance, createdBy: userId })

        const newParty = await partyService.create({ name: data?.name, nic: data?.nic, phoneNumber: data?.phoneNumber, creditPeriod: data?.creditPeriod, creditValue: data?.creditValue, address1: data?.address1, city: data?.city, address2: data?.address2, email: data?.email, chartofAccountId: chartofacc.id, isVerified: isverified, partyCategoryId: partyCateId, partyTypeId: data?.partyTypeId, partyGroupId: partyGroup?.id, createdBy: userId })

        if (data.visitingCustomer) {
            var visitingdata = {
                partyId: newParty.id,
                note: data.visitingCustomer.note,
                status: data.visitingCustomer.status,
                createdBy: userId
            }
            await visitingCustomerService.create(visitingdata)
        }

        if (newParty) {
            return response.status(201).json({ message: data.partyGroup + " Created Successfully", data: newParty });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})
//POST
partyRouter.post("/imageUpload", authenticate, upload.fields([{ name: 'shopImage' }, { name: 'brImage' }, { name: 'nicImage' }, { name: 'nicBackImage' }]),
    async (request: ExpressRequest, response: Response) => {
        const data: any = request.body;
        const files = request.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion

        try {
            if (!request.user) {
                return response.status(401).json({ message: "User not authorized" });
            }
            const userId = request.user.id;
            if (!data.partyGroup) {
                return response.status(401).json({ message: "Party Group Undefined" });
            }

            const phoneNumber = await partyService.phoneNumberCheck(data.phoneNumber)
            if (phoneNumber?.phoneNumber === data.phoneNumber) {
                return response.status(401).json({ message: "Phone Number Already Exists" });
            }

            console.log(files);  // This will show you the structure of files being uploaded

            // Handle image URLs safely
            const shopImageUrl = files.shopImage && files.shopImage[0] ? `/uploads/${files.shopImage[0].filename}` : null;
            const BRimageUrl = files.brImage && files.brImage[0] ? `/uploads/${files.brImage[0].filename}` : null;
            const nicImageUrl = files.nicImage && files.nicImage[0] ? `/uploads/${files.nicImage[0].filename}` : null;
            const nicBackImageUrl = files.nicBackImage && files.nicBackImage[0] ? `/uploads/${files.nicBackImage[0].filename}` : null;

            console.log('Shop Image URL:', shopImageUrl);
            console.log('BR Image URL:', BRimageUrl);
            console.log('NIC Image URL:', nicImageUrl);
            console.log('NIC Back Image URL:', nicBackImageUrl);

            const subAcc =
                data.partyGroup === "SUPPLIER"
                    ? await accSubCategory.getbyname("CURRENT LIABILITIES")
                    : await accSubCategory.getbyname("CURRENT ASSETS");
            const accGroup =
                data.partyGroup === "SUPPLIER"
                    ? await accGrp.getbyname("Payable")
                    : await accGrp.getbyname("Receivable");
            const partyCateId =
                data.partyGroup === "SUPPLIER"
                    ? (await partyCategoryService.getbyname('COMMON SUPPLIER'))?.id
                    : data.partyCategoryId;

            const partyGroup = await partyGroupService.getbyname(data.partyGroup);
            if (!partyGroup) {
                return response.status(401).json({ message: "Party Group Invalid" });
            }

            const chartofacc = await chartOfAccService.create({
                accountName: data.name,
                accountSubCategoryId: subAcc?.id,
                accountGroupId: accGroup?.id,
                Opening_Balance: data.Opening_Balance,
                createdBy: userId,
            });

            const newParty = await partyService.create({
                name: data.name,
                nic: data.nic,
                phoneNumber: data.phoneNumber,
                creditPeriod: data.creditPeriod,
                creditValue: data.creditValue,
                address1: data.address1,
                city: data.city,
                address2: data.address2,
                email: data.email,
                shopImage: shopImageUrl,
                BRimage: BRimageUrl,
                nicImage: nicImageUrl,
                nicBackImage: nicBackImageUrl,
                chartofAccountId: chartofacc.id,
                isVerified: data.partyGroup === "SUPPLIER",
                partyCategoryId: partyCateId,
                partyTypeId: data.partyTypeId,
                partyGroupId: partyGroup.id,
                createdBy: userId,
            });

            if (data.visitingCustomer) {
                const visitingCustomer = JSON.parse(data.visitingCustomer); // Parse the JSON string
                const visitingdata = {
                    partyId: newParty.id,
                    note: visitingCustomer.note,
                    status: visitingCustomer.status,
                    createdBy: userId,
                };
                await visitingCustomerService.create(visitingdata);
            }

            console.log(data)

            if (newParty) {
                return response.status(201).json({ message: `${data.partyGroup} Created Successfully`, data: newParty });
            }
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }
    }, (error: any, req: any, res: any, next: any) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        } else if (error) {
            return res.status(500).json({ message: error.message });
        }
        next();
    }
);

partyRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const oldphoneNumber = await partyService.get(id)
        if (oldphoneNumber?.phoneNumber !== data.phoneNumber) {
            const phoneNumber = await partyService.phoneNumberCheck(data.phoneNumber)
            if (phoneNumber?.phoneNumber === data.phoneNumber) {
                return response.status(401).json({ message: "Phone Number Already Exists" });
            }
        }


        var partyCateId;
        var partycategory;
        if (data.partyGroup === "SUPPLIER") {
            partycategory = await partyCategoryService.getbyname('COMMON SUPPLIER')
            partyCateId = partycategory?.id;
        }
        else {
            partyCateId = data.partyCategoryId
        }

        const updateparty = await partyService.update({ name: data.name, nic: data.nic, phoneNumber: data.phoneNumber, creditPeriod: data.creditPeriod, creditValue: data.creditValue, address1: data.address1, city: data?.city, address2: data.address2, isVerified: data?.isVerified, email: data.email, partyCategoryId: partyCateId }, id)
        const partyGroup = await partyGroupService.getbyid(updateparty.partyGroupId)

        const updatechartofAcc = await chartOfAccService.updates({ accountName: data.name }, updateparty.chartofAccountId)

        if (updateparty && updatechartofAcc) {
            return response.status(201).json({ message: partyGroup?.partyGroupName + " Updated Successfully", data: updateparty });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

partyRouter.put("/imageUpload/:id", authenticate, upload.fields([{ name: 'shopImage' }, { name: 'brImage' }, { name: 'nicImage' }, { name: 'nicBackImage' }]),
    async (request: ExpressRequest, response: Response) => {
        const id: any = request.params.id;
        const data: any = request.body;
        const files = request.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion

        try {
            if (!request.user) {
                return response.status(401).json({ message: "User not authorized" });
            }

            const oldphoneNumber = await partyService.get(id)
            if (oldphoneNumber?.phoneNumber !== data.phoneNumber) {
                const phoneNumber = await partyService.phoneNumberCheck(data.phoneNumber)
                if (phoneNumber?.phoneNumber === data.phoneNumber) {
                    return response.status(401).json({ message: "Phone Number Already Exists" });
                }
            }

            // Get the existing party data
            const existingParty = await partyService.get(id);
            if (!existingParty) {
                return response.status(404).json({ message: "Party not found" });
            }

            // Define partyCategoryId based on partyGroup
            let partyCateId;
            if (data.partyGroup === "SUPPLIER") {
                const partyCategory = await partyCategoryService.getbyname('COMMON SUPPLIER');
                partyCateId = partyCategory?.id;
            } else {
                partyCateId = data.partyCategoryId;
            }

            // Handle uploaded images
            const shopImageUrl = files.shopImage && files.shopImage[0] ? `/uploads/${files.shopImage[0].filename}` : existingParty.shopImage;
            const BRimageUrl = files.brImage && files.brImage[0] ? `/uploads/${files.brImage[0].filename}` : existingParty.BRimage;
            const nicImageUrl = files.nicImage && files.nicImage[0] ? `/uploads/${files.nicImage[0].filename}` : existingParty.nicImage;
            const nicBackImageUrl = files.nicBackImage && files.nicBackImage[0] ? `/uploads/${files.nicBackImage[0].filename}` : existingParty.nicBackImage;

            console.log('Shop Image URL:', shopImageUrl);
            console.log('BR Image URL:', BRimageUrl);
            console.log('NIC Image URL:', nicImageUrl);
            console.log('NIC Back Image URL:', nicBackImageUrl);

            // Update the party details
            const updatedParty = await partyService.updatewithImage({
                name: data.name,
                nic: data.nic,
                phoneNumber: data.phoneNumber,
                creditPeriod: data.creditPeriod,
                creditValue: data.creditValue,
                address1: data.address1,
                address2: data.address2,
                city: data.city,
                email: data.email,
                shopImage: shopImageUrl,
                BRimage: BRimageUrl,
                nicImage: nicImageUrl,
                nicBackImage: nicBackImageUrl,
                isVerified: data?.isVerified === 'true' ? true : false,
                partyCategoryId: partyCateId,
                partyGroupId: data.partyGroupId,
                partyTypeId: data.partyTypeId
            }, id);

            // Update the associated chart of accounts
            const chartOfAccount = await chartOfAccService.updates({
                accountName: data.name
            }, updatedParty.chartofAccountId);

            if (updatedParty && chartOfAccount) {
                return response.status(200).json({ message: "Customer Updated Successfully", data: updatedParty });
            }
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }
    },
    (error: any, req: any, res: any, next: any) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        } else if (error) {
            return res.status(500).json({ message: error.message });
        }
        next();
    }
);



