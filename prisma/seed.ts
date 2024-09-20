import { Role, InventoryMode } from "@prisma/client";
import { db } from "../src/utils/db.server"
import { format, toZonedTime } from 'date-fns-tz';
import { hash } from "bcrypt";
import { create } from '../src/components/voucherPayment/voucherPayment.service';


async function seed() {
    const currentDateTime = new Date();
    const timezone = 'Asia/Colombo';

    const utcDateTime = format(toZonedTime(currentDateTime, timezone), 'yyyy-MM-dd HH:mm:ss.SSSXXX', { timeZone: 'UTC' });
    const hashedPassword = await hash("1234", 10);
    const user = await db.user.create({
        data: {
            name: "Admin",
            phoneNumber: "0000000000",  // Example phone number
            username: "admin",
            password: hashedPassword,
            role: Role.ADMIN,  // Using the Role enum
        }
    });

    await db.partyGroup.createMany({
        data: [
            { partyGroupName: "CUSTOMER" },
            { partyGroupName: "SUPPLIER" }
        ]
    });

    await db.voucherGroup.createMany({
        data: [
            { voucherName: "SALES", shortname: "INV", inventoryMode: InventoryMode.MINUS, isAccount: true },
            { voucherName: "SALES-RETURN", shortname: "SALES-R", inventoryMode: InventoryMode.PLUS, isAccount: true },
            { voucherName: "GRN", shortname: "GRN", inventoryMode: InventoryMode.PLUS, isAccount: true },
            { voucherName: "PURCHASE-RETURN", shortname: "PURCHASE-R", inventoryMode: InventoryMode.MINUS, isAccount: true },
            { voucherName: "STOCK-TRANSFER", shortname: "ST", inventoryMode: InventoryMode.DOUBLE, isAccount: false },
            { voucherName: "PURCHASE-ORDER", shortname: "PO", inventoryMode: InventoryMode.NONE, isAccount: false },
            { voucherName: "PAYMENT", shortname: "PAYMENT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "RECEIPT", shortname: "RECEIPT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "UTILITY-BILL-CREATE", shortname: "UTILITY-BC", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "UTILITY-BILL-PAYMENT", shortname: "UTILITY-BPAY", inventoryMode: InventoryMode.NONE, isAccount: true },
        ]
    });
    const userid = user.id;

    await db.brand.createMany({
        data: [
            { brandName: "BMW", createdBy: userid },
            { brandName: "TATA", createdBy: userid },
            { brandName: "TOYOTA", createdBy: userid },
        ]
    });

    await db.type.createMany({
        data: [
            { typeName: "OIL FILTER", createdBy: userid },
            { typeName: "RIM", createdBy: userid },
            { typeName: "BUFFER", createdBy: userid },
        ]
    });

    await db.payment.createMany({
        data: [
            { type: "Cash" },
            { type: "Online Transfer" },
            { type: "Cheque" },
            { type: "Credit" },
            { type: "Petty Cash" },
        ]
    });

    const assets = await db.accountCategory.create({
        data:
            { accCategory: "ASSETS" },
    });

    const liabilities = await db.accountCategory.create({
        data:
            { accCategory: "LIABILITIES" },
    });

    const equity = await db.accountCategory.create({
        data:
            { accCategory: "EQUITY" },
    });

    const income = await db.accountCategory.create({
        data:
            { accCategory: "INCOME" },
    });

    const expencess = await db.accountCategory.create({
        data:
            { accCategory: "EXPENCESS" },
    });

    const fixassets = await db.accountSubCategory.create({
        data: { accountSubName: "FIX ASSETS", accountCategoryId: assets.id, createdBy: userid },
    })

    const currentassets = await db.accountSubCategory.create({
        data: { accountSubName: "CURRENT ASSETS", accountCategoryId: assets.id, createdBy: userid }
    })

    const fixliabilities = await db.accountSubCategory.create({
        data: { accountSubName: "FIX LIABILITIES", accountCategoryId: liabilities.id, createdBy: userid },
    })
    const currentLiabilites = await db.accountSubCategory.create({
        data: { accountSubName: "CURRENT LIABILITIES", accountCategoryId: liabilities.id, createdBy: userid },
    })

    const cash = await db.accountGroup.create({
        data: { accountGroupName: 'Cash & Cash Equivalents', createdBy: userid }
    })

    const bank = await db.accountGroup.create({
        data: { accountGroupName: 'Bank', createdBy: userid }
    })

    const debtor = await db.accountGroup.create({
        data: { accountGroupName: 'Debtor', createdBy: userid }
    })

    const vendor = await db.accountGroup.create({
        data: { accountGroupName: 'Vendor', createdBy: userid }
    })

    const acexpencess = await db.accountGroup.create({
        data: { accountGroupName: 'Expencess', createdBy: userid }
    })

    const incomes = await db.accountGroup.create({
        data: { accountGroupName: 'Income', createdBy: userid }
    })

    const inventory = await db.accountGroup.create({
        data: { accountGroupName: 'Inventory', createdBy: userid }
    })

    await db.chartofAccount.createMany({
        data: [
            { accountName: "INVENTORY ACCOUNT", accountSubCategoryId: currentassets.id, accountGroupId: inventory.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "REVENUE ACCOUNT", accountSubCategoryId: currentassets.id, accountGroupId: incomes.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "LIGHT BILL", accountSubCategoryId: currentassets.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "CASH", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "BANK", accountSubCategoryId: currentassets.id, accountGroupId: bank.id, Opening_Balance: 0, createdBy: userid },
        ]
    })

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});