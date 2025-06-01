-- CreateTable
CREATE TABLE `center` (
    `id` VARCHAR(191) NOT NULL,
    `centerName` VARCHAR(191) NOT NULL,
    `mode` ENUM('VIRTUAL', 'PHYSICAL') NOT NULL DEFAULT 'VIRTUAL',
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companyDetails` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `telPhone1` VARCHAR(191) NULL,
    `telPhone2` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nic` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `dateofbirth` DATETIME(3) NULL,
    `target` DECIMAL(65, 30) NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `isconform` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('ADMIN', 'MANAGER', 'SALESMEN') NOT NULL DEFAULT 'SALESMEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_nic_key`(`nic`),
    UNIQUE INDEX `user_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userCenter` (
    `centerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`centerId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partyGroup` (
    `id` VARCHAR(191) NOT NULL,
    `partyGroupName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `party` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nic` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `creditPeriod` VARCHAR(191) NULL,
    `creditValue` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `shopImage` VARCHAR(191) NULL,
    `BRimage` VARCHAR(191) NULL,
    `nicImage` VARCHAR(191) NULL,
    `nicBackImage` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NULL,
    `partyCategoryId` VARCHAR(191) NULL,
    `partyTypeId` VARCHAR(191) NULL,
    `chartofAccountId` VARCHAR(191) NULL,
    `partyGroupId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `party_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partyCategory` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `partyGroupId` VARCHAR(191) NOT NULL,
    `isEditable` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partyType` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vistingCustomer` (
    `id` VARCHAR(191) NOT NULL,
    `partyId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proofimage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partyproofimage` (
    `partyId` VARCHAR(191) NOT NULL,
    `proofimageId` VARCHAR(191) NOT NULL,
    `imageName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`partyId`, `proofimageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucherGroup` (
    `id` VARCHAR(191) NOT NULL,
    `voucherName` VARCHAR(191) NOT NULL,
    `shortname` VARCHAR(191) NOT NULL,
    `inventoryMode` ENUM('PLUS', 'MINUS', 'DOUBLE', 'NONE') NOT NULL,
    `isAccount` BOOLEAN NOT NULL,
    `label` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `isSidemenu` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucher` (
    `id` VARCHAR(191) NOT NULL,
    `voucherNumber` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `totalDebit` DECIMAL(65, 30) NULL,
    `totalCredit` DECIMAL(65, 30) NULL,
    `value` DECIMAL(65, 30) NULL,
    `firstPay` DECIMAL(65, 30) NULL,
    `amount` DECIMAL(65, 30) NULL,
    `location` VARCHAR(191) NULL,
    `paidValue` DECIMAL(65, 30) NULL,
    `returnValue` DECIMAL(65, 30) NULL,
    `refNumber` VARCHAR(191) NULL,
    `refVoucherNumber` VARCHAR(191) NULL,
    `isRef` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `stockStatus` BOOLEAN NULL DEFAULT true,
    `dueDays` INTEGER NULL,
    `isPayment` BOOLEAN NOT NULL DEFAULT true,
    `isconform` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `startingValue` DECIMAL(65, 30) NULL,
    `endingValue` DECIMAL(65, 30) NULL,
    `partyId` VARCHAR(191) NULL,
    `chartofAccountId` VARCHAR(191) NULL,
    `voucherGroupId` VARCHAR(191) NOT NULL,
    `authUser` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `appovedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `discountId` VARCHAR(191) NULL,

    UNIQUE INDEX `voucher_voucherNumber_key`(`voucherNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucherProduct` (
    `id` VARCHAR(191) NOT NULL,
    `cost` DECIMAL(65, 30) NOT NULL,
    `quantity` DECIMAL(65, 30) NOT NULL,
    `discount` VARCHAR(191) NOT NULL,
    `MRP` DECIMAL(65, 30) NOT NULL,
    `minPrice` DECIMAL(65, 30) NULL,
    `sellingPrice` DECIMAL(65, 30) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `remainingQty` DECIMAL(65, 30) NULL,
    `isdisabale` BOOLEAN NOT NULL DEFAULT false,
    `stockStatus` BOOLEAN NULL DEFAULT true,
    `voucherId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `centerId` VARCHAR(191) NULL,
    `toCenterId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `expDate` DATETIME(3) NULL,
    `closingExpDate` DATETIME(3) NULL,
    `batchNo` VARCHAR(191) NULL,
    `Packsize` VARCHAR(191) NULL,
    `Manufacture` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `usdRate` DECIMAL(65, 30) NULL,
    `lkrAmount` DECIMAL(65, 30) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pettycashIOU` (
    `id` VARCHAR(191) NOT NULL,
    `userid` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NULL,
    `spent` DECIMAL(65, 30) NULL,
    `returnDate` DATETIME(3) NULL,
    `returnAmount` DECIMAL(65, 30) NULL,
    `voucherId` VARCHAR(191) NOT NULL,
    `isReturn` BOOLEAN NOT NULL DEFAULT false,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pettyCashIOUDetails` (
    `id` VARCHAR(191) NOT NULL,
    `refnumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NULL,
    `pettycashIOUId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referVouchers` (
    `id` VARCHAR(191) NOT NULL,
    `refVoucherNumber` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `invoiceAmount` DECIMAL(65, 30) NOT NULL,
    `value` DECIMAL(65, 30) NULL,
    `settledAmount` DECIMAL(65, 30) NOT NULL,
    `paidAmount` DECIMAL(65, 30) NOT NULL,
    `voucherId` VARCHAR(191) NOT NULL,
    `isdelete` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucherCenter` (
    `centerId` VARCHAR(191) NOT NULL,
    `voucherId` VARCHAR(191) NOT NULL,
    `centerStatus` ENUM('IN', 'OUT') NOT NULL,

    PRIMARY KEY (`centerId`, `voucherId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentVoucher` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `paymentType` VARCHAR(191) NULL,
    `refNumber` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `voucherId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand` (
    `id` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brand_brandName_key`(`brandName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `type` (
    `id` VARCHAR(191) NOT NULL,
    `typeName` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `type_typeName_key`(`typeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oemnumber` (
    `productId` VARCHAR(191) NOT NULL,
    `OEMnumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`OEMnumber`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commissionLevel` (
    `id` VARCHAR(191) NOT NULL,
    `commissionlevel` VARCHAR(191) NOT NULL,
    `days` INTEGER NULL,
    `commissionRate` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commissionReport` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `voucherId` VARCHAR(191) NOT NULL,
    `comRate` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` VARCHAR(191) NOT NULL,
    `unit` ENUM('PCS') NOT NULL DEFAULT 'PCS',
    `itemCode` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NOT NULL,
    `printName` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `ExpnotifDays` INTEGER NULL,
    `criticalLevel` INTEGER NULL,
    `cost` DECIMAL(65, 30) NULL,
    `minPrice` DECIMAL(65, 30) NULL,
    `MRP` DECIMAL(65, 30) NULL,
    `sellingPrice` DECIMAL(65, 30) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `typeId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `Packsize` VARCHAR(191) NULL,
    `Manufacture` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,

    UNIQUE INDEX `product_itemCode_key`(`itemCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discountLevel` (
    `id` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `days` INTEGER NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productDiscountLevel` (
    `productId` VARCHAR(191) NOT NULL,
    `discountLevelId` VARCHAR(191) NOT NULL,
    `discountRate` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`productId`, `discountLevelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `productId` VARCHAR(191) NOT NULL,
    `centerId` VARCHAR(191) NOT NULL,
    `batchNo` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(65, 30) NULL,
    `expDate` DATETIME(3) NULL,
    `closingExpDate` DATETIME(3) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_productId_centerId_batchNo_key`(`productId`, `centerId`, `batchNo`),
    PRIMARY KEY (`productId`, `centerId`, `batchNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accountCategory` (
    `id` VARCHAR(191) NOT NULL,
    `accCategory` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accountSubCategory` (
    `id` VARCHAR(191) NOT NULL,
    `accountSubName` VARCHAR(191) NOT NULL,
    `accountCategoryId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accountGroup` (
    `id` VARCHAR(191) NOT NULL,
    `accountGroupName` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chartofAccount` (
    `id` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `accountSubCategoryId` VARCHAR(191) NULL,
    `accountGroupId` VARCHAR(191) NULL,
    `Opening_Balance` DECIMAL(65, 30) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chequeBook` (
    `id` VARCHAR(191) NOT NULL,
    `chequeBookNumber` VARCHAR(191) NOT NULL,
    `totalCheques` INTEGER NOT NULL,
    `startNumber` VARCHAR(191) NOT NULL,
    `endNumber` VARCHAR(191) NOT NULL,
    `remainingCheques` INTEGER NOT NULL,
    `chartofAccountId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cheque` (
    `id` VARCHAR(191) NOT NULL,
    `chequeNumber` VARCHAR(191) NOT NULL,
    `chequeBankName` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NULL,
    `releaseDate` DATETIME(3) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `month` VARCHAR(191) NULL,
    `year` VARCHAR(191) NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `creditDebit` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `chequeBookId` VARCHAR(191) NULL,
    `voucherId` VARCHAR(191) NULL,
    `paymentVoucherId` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cheque_chequeNumber_key`(`chequeNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journalLine` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `voucherId` VARCHAR(191) NULL,
    `chartofAccountId` VARCHAR(191) NOT NULL,
    `debitAmount` DECIMAL(65, 30) NULL,
    `creditAmount` DECIMAL(65, 30) NULL,
    `ref` VARCHAR(191) NULL,
    `isStatus` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankRecJournal` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `voucherId` VARCHAR(191) NULL,
    `chartofAccountId` VARCHAR(191) NOT NULL,
    `debitAmount` DECIMAL(65, 30) NULL,
    `creditAmount` DECIMAL(65, 30) NULL,
    `ref` VARCHAR(191) NULL,
    `isStatus` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `center` ADD CONSTRAINT `center_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userCenter` ADD CONSTRAINT `userCenter_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userCenter` ADD CONSTRAINT `userCenter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `party` ADD CONSTRAINT `party_partyCategoryId_fkey` FOREIGN KEY (`partyCategoryId`) REFERENCES `partyCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `party` ADD CONSTRAINT `party_partyTypeId_fkey` FOREIGN KEY (`partyTypeId`) REFERENCES `partyType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `party` ADD CONSTRAINT `party_chartofAccountId_fkey` FOREIGN KEY (`chartofAccountId`) REFERENCES `chartofAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `party` ADD CONSTRAINT `party_partyGroupId_fkey` FOREIGN KEY (`partyGroupId`) REFERENCES `partyGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `party` ADD CONSTRAINT `party_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partyCategory` ADD CONSTRAINT `partyCategory_partyGroupId_fkey` FOREIGN KEY (`partyGroupId`) REFERENCES `partyGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partyCategory` ADD CONSTRAINT `partyCategory_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partyType` ADD CONSTRAINT `partyType_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vistingCustomer` ADD CONSTRAINT `vistingCustomer_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vistingCustomer` ADD CONSTRAINT `vistingCustomer_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partyproofimage` ADD CONSTRAINT `partyproofimage_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partyproofimage` ADD CONSTRAINT `partyproofimage_proofimageId_fkey` FOREIGN KEY (`proofimageId`) REFERENCES `proofimage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_chartofAccountId_fkey` FOREIGN KEY (`chartofAccountId`) REFERENCES `chartofAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_voucherGroupId_fkey` FOREIGN KEY (`voucherGroupId`) REFERENCES `voucherGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_authUser_fkey` FOREIGN KEY (`authUser`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_appovedBy_fkey` FOREIGN KEY (`appovedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucher` ADD CONSTRAINT `voucher_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `discountLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucherProduct` ADD CONSTRAINT `voucherProduct_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucherProduct` ADD CONSTRAINT `voucherProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucherProduct` ADD CONSTRAINT `voucherProduct_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pettycashIOU` ADD CONSTRAINT `pettycashIOU_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pettycashIOU` ADD CONSTRAINT `pettycashIOU_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pettycashIOU` ADD CONSTRAINT `pettycashIOU_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pettyCashIOUDetails` ADD CONSTRAINT `pettyCashIOUDetails_pettycashIOUId_fkey` FOREIGN KEY (`pettycashIOUId`) REFERENCES `pettycashIOU`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pettyCashIOUDetails` ADD CONSTRAINT `pettyCashIOUDetails_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referVouchers` ADD CONSTRAINT `referVouchers_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referVouchers` ADD CONSTRAINT `referVouchers_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucherCenter` ADD CONSTRAINT `voucherCenter_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voucherCenter` ADD CONSTRAINT `voucherCenter_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentVoucher` ADD CONSTRAINT `paymentVoucher_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentVoucher` ADD CONSTRAINT `paymentVoucher_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand` ADD CONSTRAINT `brand_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `type` ADD CONSTRAINT `type_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oemnumber` ADD CONSTRAINT `oemnumber_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissionLevel` ADD CONSTRAINT `commissionLevel_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissionReport` ADD CONSTRAINT `commissionReport_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discountLevel` ADD CONSTRAINT `discountLevel_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productDiscountLevel` ADD CONSTRAINT `productDiscountLevel_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productDiscountLevel` ADD CONSTRAINT `productDiscountLevel_discountLevelId_fkey` FOREIGN KEY (`discountLevelId`) REFERENCES `discountLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productDiscountLevel` ADD CONSTRAINT `productDiscountLevel_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accountSubCategory` ADD CONSTRAINT `accountSubCategory_accountCategoryId_fkey` FOREIGN KEY (`accountCategoryId`) REFERENCES `accountCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accountSubCategory` ADD CONSTRAINT `accountSubCategory_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accountGroup` ADD CONSTRAINT `accountGroup_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chartofAccount` ADD CONSTRAINT `chartofAccount_accountSubCategoryId_fkey` FOREIGN KEY (`accountSubCategoryId`) REFERENCES `accountSubCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chartofAccount` ADD CONSTRAINT `chartofAccount_accountGroupId_fkey` FOREIGN KEY (`accountGroupId`) REFERENCES `accountGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chartofAccount` ADD CONSTRAINT `chartofAccount_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chequeBook` ADD CONSTRAINT `chequeBook_chartofAccountId_fkey` FOREIGN KEY (`chartofAccountId`) REFERENCES `chartofAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chequeBook` ADD CONSTRAINT `chequeBook_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cheque` ADD CONSTRAINT `cheque_chequeBookId_fkey` FOREIGN KEY (`chequeBookId`) REFERENCES `chequeBook`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cheque` ADD CONSTRAINT `cheque_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cheque` ADD CONSTRAINT `cheque_paymentVoucherId_fkey` FOREIGN KEY (`paymentVoucherId`) REFERENCES `paymentVoucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cheque` ADD CONSTRAINT `cheque_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journalLine` ADD CONSTRAINT `journalLine_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journalLine` ADD CONSTRAINT `journalLine_chartofAccountId_fkey` FOREIGN KEY (`chartofAccountId`) REFERENCES `chartofAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journalLine` ADD CONSTRAINT `journalLine_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankRecJournal` ADD CONSTRAINT `bankRecJournal_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankRecJournal` ADD CONSTRAINT `bankRecJournal_chartofAccountId_fkey` FOREIGN KEY (`chartofAccountId`) REFERENCES `chartofAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankRecJournal` ADD CONSTRAINT `bankRecJournal_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
