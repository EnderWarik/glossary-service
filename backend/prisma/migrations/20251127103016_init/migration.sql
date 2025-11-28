-- CreateTable
CREATE TABLE "terms" (
    "id" SERIAL NOT NULL,
    "term" VARCHAR(255) NOT NULL,
    "definition" TEXT NOT NULL,
    "synonyms" TEXT,
    "tags" TEXT,
    "source_title" VARCHAR(512),
    "source_authors" VARCHAR(512),
    "source_year" INTEGER,
    "source_link" VARCHAR(1024),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relations" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "target_id" INTEGER NOT NULL,
    "type" VARCHAR(64) NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terms_term_key" ON "terms"("term");

-- CreateIndex
CREATE INDEX "terms_term_idx" ON "terms"("term");

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
