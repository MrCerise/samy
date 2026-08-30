-- CreateTable
CREATE TABLE "CommandAlias" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandRestriction" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelCommandSetting" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelCommandSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberCommandSetting" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCommandSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleSetting" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FakePermission" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FakePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandAlias_guildId_idx" ON "CommandAlias"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandAlias_guildId_alias_key" ON "CommandAlias"("guildId", "alias");

-- CreateIndex
CREATE INDEX "CommandRestriction_guildId_idx" ON "CommandRestriction"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandRestriction_guildId_command_roleId_key" ON "CommandRestriction"("guildId", "command", "roleId");

-- CreateIndex
CREATE INDEX "ChannelCommandSetting_guildId_idx" ON "ChannelCommandSetting"("guildId");

-- CreateIndex
CREATE INDEX "ChannelCommandSetting_channelId_idx" ON "ChannelCommandSetting"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelCommandSetting_guildId_channelId_command_key" ON "ChannelCommandSetting"("guildId", "channelId", "command");

-- CreateIndex
CREATE INDEX "MemberCommandSetting_guildId_idx" ON "MemberCommandSetting"("guildId");

-- CreateIndex
CREATE INDEX "MemberCommandSetting_userId_idx" ON "MemberCommandSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberCommandSetting_guildId_userId_command_key" ON "MemberCommandSetting"("guildId", "userId", "command");

-- CreateIndex
CREATE INDEX "ModuleSetting_guildId_idx" ON "ModuleSetting"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleSetting_guildId_module_key" ON "ModuleSetting"("guildId", "module");

-- CreateIndex
CREATE INDEX "FakePermission_guildId_idx" ON "FakePermission"("guildId");

-- CreateIndex
CREATE INDEX "FakePermission_roleId_idx" ON "FakePermission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "FakePermission_guildId_roleId_permission_key" ON "FakePermission"("guildId", "roleId", "permission");

-- AddForeignKey
ALTER TABLE "CommandAlias" ADD CONSTRAINT "CommandAlias_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandRestriction" ADD CONSTRAINT "CommandRestriction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelCommandSetting" ADD CONSTRAINT "ChannelCommandSetting_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCommandSetting" ADD CONSTRAINT "MemberCommandSetting_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSetting" ADD CONSTRAINT "ModuleSetting_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FakePermission" ADD CONSTRAINT "FakePermission_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
