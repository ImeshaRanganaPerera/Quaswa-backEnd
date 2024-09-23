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
    const userid = user.id;

    const customer = await db.partyGroup.create({
        data: { partyGroupName: "CUSTOMER" }
    })

    const supplier = await db.partyGroup.create({
        data: { partyGroupName: "SUPPLIER" }
    })

    await db.partyCategory.createMany({
        data: [
            { category: "WALKING CUSTOMER", partyGroupId: customer.id, createdBy: userid },
            { category: "COMMON SUPPLIER", partyGroupId: supplier.id, createdBy: userid }
        ]
    })

    // await db.brand.createMany({
    //     data: [
    //         { brandName: "BMW", createdBy: userid },
    //         { brandName: "TATA", createdBy: userid },
    //         { brandName: "TOYOTA", createdBy: userid },
    //     ]
    // });

    // await db.type.createMany({
    //     data: [
    //         { typeName: "OIL FILTER", createdBy: userid },
    //         { typeName: "RIM", createdBy: userid },
    //         { typeName: "BUFFER", createdBy: userid },
    //     ]
    // });

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

    const receivable = await db.accountGroup.create({
        data: { accountGroupName: 'Receivable', createdBy: userid }
    })

    const payable = await db.accountGroup.create({
        data: { accountGroupName: 'Payable', createdBy: userid }
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

    const inventorys = await db.chartofAccount.create({
        data: { accountName: "INVENTORY ACCOUNT", accountSubCategoryId: currentassets.id, accountGroupId: inventory.id, Opening_Balance: 0, createdBy: userid },
    })

    await db.chartofAccount.createMany({
        data: [
            { accountName: "REVENUE ACCOUNT", accountSubCategoryId: currentassets.id, accountGroupId: incomes.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "LIGHT BILL", accountSubCategoryId: currentLiabilites.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "CASH BOOK", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "BANK BOOK", accountSubCategoryId: currentassets.id, accountGroupId: bank.id, Opening_Balance: 0, createdBy: userid },
        ]
    })

    await db.voucherGroup.createMany({
        data: [
            { voucherName: "SALES", shortname: "INV", inventoryMode: InventoryMode.MINUS, isAccount: true, commonAccountId: inventorys.id, creditDebit: 'CREDIT' },
            { voucherName: "SALES-RETURN", shortname: "SALES-R", inventoryMode: InventoryMode.PLUS, isAccount: true, commonAccountId: inventorys.id, creditDebit: 'DEBIT' },
            { voucherName: "GRN", shortname: "GRN", inventoryMode: InventoryMode.PLUS, isAccount: true, commonAccountId: inventorys.id, creditDebit: 'DEBIT' },
            { voucherName: "PURCHASE-RETURN", shortname: "PURCHASE-R", inventoryMode: InventoryMode.MINUS, isAccount: true, commonAccountId: inventorys.id, creditDebit: 'CREDIT' },
            { voucherName: "STOCK-TRANSFER", shortname: "ST", inventoryMode: InventoryMode.DOUBLE, isAccount: false },
            { voucherName: "PURCHASE-ORDER", shortname: "PO", inventoryMode: InventoryMode.NONE, isAccount: false },
            { voucherName: "PAYMENT", shortname: "PAYMENT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "RECEIPT", shortname: "RECEIPT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "UTILITY-BILL-CREATE", shortname: "UTILITY-BC", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "UTILITY-BILL-PAYMENT", shortname: "UTILITY-BPAY", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "PETTY-CASH", shortname: "PETTY-CASH", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "SUPPLIER-BILL", shortname: "SUPPLIER-BC", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "JOURNAL-ENTRY", shortname: "JE", inventoryMode: InventoryMode.NONE, isAccount: true },
        ]
    });

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});