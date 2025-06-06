declare module "bun" {
    interface Env {
        DATABASE_URL: string;
        SECRET_KEY: string;
    }
}
