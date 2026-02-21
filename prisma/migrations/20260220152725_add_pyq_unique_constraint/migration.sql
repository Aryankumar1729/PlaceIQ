/*
  Warnings:

  - A unique constraint covering the columns `[question,companyId]` on the table `PYQ` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PYQ_question_companyId_key" ON "PYQ"("question", "companyId");
