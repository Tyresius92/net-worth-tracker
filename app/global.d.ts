interface Window {
  ENV: {
    STRIPE_PUBLIC_KEY: string;
  };
}

window.ENV = window.ENV || {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY: string;
      STRIPE_PUBLIC_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      PRISMA_FIELD_ENCRYPTION_KEY: string;
    }
  }
}
