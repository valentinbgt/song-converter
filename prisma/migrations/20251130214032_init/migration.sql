-- CreateTable
CREATE TABLE "DailyTracks" (
    "id" BIGINT NOT NULL,
    "displayDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cover" TEXT NOT NULL,

    CONSTRAINT "DailyTracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTracks_id_key" ON "DailyTracks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTracks_displayDate_key" ON "DailyTracks"("displayDate");
