-- CreateEnum
CREATE TYPE "TypeMovement" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "typePeriod" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'FREELANCE');

-- CreateEnum
CREATE TYPE "statusPage" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "typeMovementSave" AS ENUM ('CONTRIBUTION', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "typeInvestment" AS ENUM ('CONTRIBUTION', 'WITHDRAWAL', 'REVENUE', 'LOSS');

-- CreateEnum
CREATE TYPE "typeIntitution" AS ENUM ('BANK', 'CASH', 'CRYPTO', 'STOCKS', 'NEQUI', 'DAVIPLATA', 'OTHER');

-- CreateEnum
CREATE TYPE "statusUser" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "verify_email" BOOLEAN NOT NULL DEFAULT false,
    "time_zone" TEXT DEFAULT 'BOG',
    "google_id" TEXT,
    "status" "statusUser" DEFAULT 'ACTIVE',
    "language" TEXT DEFAULT 'es',
    "password_update" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions_users" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "status" TEXT DEFAULT 'on',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_pending" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_forgot" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_forgot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_configurations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pay_frequency" TEXT,
    "pay_day" TEXT,
    "pay_day_two" TEXT,
    "active_notifications" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_sections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "order" INTEGER,
    "is_global_workforce" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_pages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type_period" TEXT NOT NULL,
    "status" "statusPage" DEFAULT 'ACTIVE',
    "total_income" DECIMAL(65,30) DEFAULT 0.0,
    "total_expenses" DECIMAL(65,30) DEFAULT 0.0,
    "balance" DECIMAL(65,30) DEFAULT 0.0,
    "start_balance" DECIMAL(65,30) DEFAULT 0.0,
    "end_balance" DECIMAL(65,30) DEFAULT 0.0,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "financial_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_institutions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "typeIntitution",
    "balance_now" DECIMAL(65,30) DEFAULT 0.0,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type_consent" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "date_assigned" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paydays" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "day_month" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paydays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories_items" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "expected_amount" DECIMAL(65,30) DEFAULT 0.0,
    "is_recurrent" BOOLEAN DEFAULT false,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_adjustments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "financial_page_id" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" UUID NOT NULL,
    "financial_page_id" UUID NOT NULL,
    "category_item_id" UUID NOT NULL,
    "institution_financial_id" UUID NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type_movement" "TypeMovement" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_sections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_item_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "goal_savings" DECIMAL(65,30) DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_item_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type_investment" "typeInvestment" NOT NULL,
    "where_investment" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements_investment_accounts" (
    "id" UUID NOT NULL,
    "investment_account_id" UUID NOT NULL,
    "type_movement" "TypeMovement" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_investment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- CreateIndex
CREATE INDEX "sessions_users_user_id_idx" ON "sessions_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_pending_code_key" ON "users_pending"("code");

-- CreateIndex
CREATE UNIQUE INDEX "password_forgot_code_key" ON "password_forgot"("code");

-- CreateIndex
CREATE INDEX "financial_pages_user_id_idx" ON "financial_pages"("user_id");

-- AddForeignKey
ALTER TABLE "sessions_users" ADD CONSTRAINT "sessions_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_configurations" ADD CONSTRAINT "login_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_sections" ADD CONSTRAINT "budget_sections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_pages" ADD CONSTRAINT "financial_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_institutions" ADD CONSTRAINT "financial_institutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paydays" ADD CONSTRAINT "paydays_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "login_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_items" ADD CONSTRAINT "categories_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "budget_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_adjustments" ADD CONSTRAINT "balance_adjustments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_adjustments" ADD CONSTRAINT "balance_adjustments_financial_page_id_fkey" FOREIGN KEY ("financial_page_id") REFERENCES "financial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_financial_page_id_fkey" FOREIGN KEY ("financial_page_id") REFERENCES "financial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_category_item_id_fkey" FOREIGN KEY ("category_item_id") REFERENCES "categories_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_institution_financial_id_fkey" FOREIGN KEY ("institution_financial_id") REFERENCES "financial_institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sections" ADD CONSTRAINT "balance_sections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sections" ADD CONSTRAINT "balance_sections_category_item_id_fkey" FOREIGN KEY ("category_item_id") REFERENCES "categories_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_category_item_id_fkey" FOREIGN KEY ("category_item_id") REFERENCES "categories_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements_investment_accounts" ADD CONSTRAINT "movements_investment_accounts_investment_account_id_fkey" FOREIGN KEY ("investment_account_id") REFERENCES "investment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
