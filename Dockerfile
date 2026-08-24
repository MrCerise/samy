FROM oven/bun:1

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy the application source
COPY . .

# Generate the Prisma client against the bundled schema
RUN bunx prisma generate

# The bot's API listens on this port (override with the PORT env var)
EXPOSE 4000

# Apply migrations, then start the bot
CMD ["sh", "./docker-start.sh"]
