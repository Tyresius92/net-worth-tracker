declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRISMA_FIELD_ENCRYPTION_KEY: string;
    }
  }
}
