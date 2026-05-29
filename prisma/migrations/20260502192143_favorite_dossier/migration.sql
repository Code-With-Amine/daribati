-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "dossierId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_favorites_dossier_id" ON "Favorite"("dossierId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
