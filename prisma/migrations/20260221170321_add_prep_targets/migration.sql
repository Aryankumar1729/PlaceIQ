-- CreateTable
CREATE TABLE "PrepTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrepTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPYQProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pyqId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPYQProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrepTarget_userId_companyId_key" ON "PrepTarget"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPYQProgress_userId_pyqId_key" ON "UserPYQProgress"("userId", "pyqId");

-- AddForeignKey
ALTER TABLE "PrepTarget" ADD CONSTRAINT "PrepTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepTarget" ADD CONSTRAINT "PrepTarget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPYQProgress" ADD CONSTRAINT "UserPYQProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPYQProgress" ADD CONSTRAINT "UserPYQProgress_pyqId_fkey" FOREIGN KEY ("pyqId") REFERENCES "PYQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
