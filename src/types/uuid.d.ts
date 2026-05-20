declare module "uuid" {
  export function v4(): string;
  export function v1(): string;
  export function v3(options?: { namespace: string; name: string }): string;
  export function v5(options?: { namespace: string; name: string }): string;
}
