type Resolver = { resolve: (v: boolean) => void };

const resolvers = new Map<string, Resolver>();
const customContent = new Map<string, React.ReactNode>();

export const registerResolver = (id: string, resolve: (v: boolean) => void) => {
  resolvers.set(id, { resolve });
};

export const registerCustom = (key: string, node: React.ReactNode) => {
  customContent.set(key, node);
};

export const getCustom = (key: string | null) => {
  if (!key) return null;
  return customContent.get(key) ?? null;
};

export const clearCustom = (key: string | null) => {
  if (!key) return;
  customContent.delete(key);
};

export const resolveConfirm = (id: string | null, value: boolean) => {
  if (!id) return;
  const r = resolvers.get(id);
  if (r) {
    try {
      r.resolve(value);
    } finally {
      resolvers.delete(id);
    }
  }
};

export default { registerResolver, resolveConfirm };
