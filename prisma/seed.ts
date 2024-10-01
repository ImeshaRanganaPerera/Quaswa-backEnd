import { Role, InventoryMode } from "@prisma/client";
import { db } from "../src/utils/db.server"
import { format, toZonedTime } from 'date-fns-tz';
import { hash } from "bcrypt";

async function seed() {
    const currentDateTime = new Date();
    const timezone = 'Asia/Colombo';

    // const utcDateTime = format(toZonedTime(currentDateTime, timezone), 'yyyy-MM-dd HH:mm:ss.SSSXXX', { timeZone: 'UTC' });
    const hashedPassword = await hash("1234", 10);
    const user = await db.user.create({
        data: {
            name: "Admin",
            phoneNumber: "0000000000",  // Example phone number
            username: "admin",
            password: hashedPassword,
            role: Role.ADMIN,  // Using the Role enum
            isconform: true
        }
    });
    const userid = user.id;

    const CompanyDetails = await db.companyDetails.create({
        data: {
            companyName: "HITECH (PVT) LTD",
            address1: "Colombo",
            address2: "Sri Lanka",
            telPhone1: "0764533003",
            telPhone2: "0729451231",
            email: 'info@hitechlanka.lk',
        }
    })

    const customer = await db.partyGroup.create({
        data: { partyGroupName: "CUSTOMER" }
    })

    const supplier = await db.partyGroup.create({
        data: { partyGroupName: "SUPPLIER" }
    })

    await db.partyCategory.createMany({
        data: [
            { category: "WALKING CUSTOMER", partyGroupId: customer.id, createdBy: userid },
            { category: "VISITING CUSTOMER", partyGroupId: customer.id, isEditable: false, createdBy: userid },
            { category: "COMMON SUPPLIER", partyGroupId: supplier.id, createdBy: userid }
        ]
    })

    await db.discountLevel.create({
        data: { level: 'Cash Discount', createdBy: userid }
    })

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
    const Expencess = await db.accountSubCategory.create({
        data: { accountSubName: "Expencess", accountCategoryId: expencess.id, createdBy: userid },
    })

    const Incomes = await db.accountSubCategory.create({
        data: { accountSubName: "Income", accountCategoryId: income.id, createdBy: userid },
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
            { accountName: "EXPENCESS ACCOUNT", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "PURCHASE EXPENCESS", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "SALES ACCOUNT", accountSubCategoryId: Incomes.id, accountGroupId: incomes.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "USER EXPENCESS ACCOUNT", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "CASH BOOK", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "PETTY CASH", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "BANK BOOK", accountSubCategoryId: currentassets.id, accountGroupId: bank.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "PENDING CHEQUE", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
        ]
    })

    await db.voucherGroup.createMany({
        data: [
            { voucherName: "INVOICE", shortname: "INV", inventoryMode: InventoryMode.MINUS, isAccount: true, isSidemenu: true, category: "Sales", label: "Invoice" },
            { voucherName: "SALES-RETURN", shortname: "SALES-R", inventoryMode: InventoryMode.PLUS, isAccount: true, isSidemenu: true, category: "Sales", label: "Sales Return" },
            { voucherName: "SALES-ORDER", shortname: "SALES-O", inventoryMode: InventoryMode.NONE, isAccount: false, isSidemenu: true, category: "Sales", label: "Sales Order" },
            { voucherName: "GRN", shortname: "GRN", inventoryMode: InventoryMode.PLUS, isAccount: true, isSidemenu: true, category: "Inventory", label: "GRN" },
            { voucherName: "PURCHASE-RETURN", shortname: "PURCHASE-R", inventoryMode: InventoryMode.MINUS, isAccount: true, isSidemenu: true, category: "Inventory", label: "Purchase Return" },
            { voucherName: "STOCK-TRANSFER", shortname: "ST", inventoryMode: InventoryMode.DOUBLE, isAccount: false, isSidemenu: true, category: "Inventory", label: "Stock Transfer" },
            { voucherName: "PURCHASE-ORDER", shortname: "PO", inventoryMode: InventoryMode.NONE, isAccount: false, isSidemenu: true, category: "Inventory", label: "Purchase Order" },
            { voucherName: "PAYMENT", shortname: "PAYMENT", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Payment" },
            { voucherName: "DIRECT PAYMENT", shortname: "PAYMENT-D", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Direct Payment" },
            { voucherName: "RECEIPT", shortname: "RECEIPT", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Recipt" },
            { voucherName: "UTILITY-BILL-CREATE", shortname: "UTILITY-BC", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Utility Bill Create" },
            { voucherName: "UTILITY-BILL-PAYMENT", shortname: "UTILITY-BPAY", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Utility Bill Payment" },
            { voucherName: "PETTY-CASH", shortname: "PC", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Petty Cash" },
            { voucherName: "PETTY-CASH-IOU", shortname: "PC-IOU", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Petty Cash IOU" },
            { voucherName: "SUPPLIER-BILL", shortname: "SUPPLIER-BC", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Supplier Bill" },
            { voucherName: "JOURNAL-ENTRY", shortname: "JE", inventoryMode: InventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Journal Entry" },
        ]
    });

    await db.proofimage.createMany({
        data: [
            {name: 'BR Image'},
            {name: 'NIC Image'},
            {name: 'Shop Imge'},
        ]
    })

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});