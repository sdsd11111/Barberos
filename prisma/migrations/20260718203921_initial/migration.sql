-- CreateTable
CREATE TABLE "Barbershop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "evolutionInstance" TEXT NOT NULL,
    "evolutionApiKey" TEXT NOT NULL,
    "requiredCuts" INTEGER NOT NULL DEFAULT 5,
    "googleMapsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Barbershop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberStaff" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BARBER',

    CONSTRAINT "BarberStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberCustomer" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "name" TEXT,
    "cutsCount" INTEGER NOT NULL DEFAULT 0,
    "sessionState" TEXT NOT NULL DEFAULT 'IDLE',
    "lastVisitAt" TIMESTAMP(3),

    CONSTRAINT "BarberCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberVisit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "staffId" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarberVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_whatsappNumber_key" ON "Barbershop"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BarberCustomer_barbershopId_whatsapp_key" ON "BarberCustomer"("barbershopId", "whatsapp");

-- AddForeignKey
ALTER TABLE "BarberStaff" ADD CONSTRAINT "BarberStaff_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberCustomer" ADD CONSTRAINT "BarberCustomer_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
