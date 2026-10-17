import * as ExpoCrypto from "expo-crypto";
// Auth-js otherwise falls back to Math.random/plain PKCE on some native runtimes.
// Supply the platform CSPRNG and SHA-256 only; never substitute a custom cipher.
const runtime = globalThis as typeof globalThis & { crypto: Crypto };
if (typeof runtime.crypto === "undefined") runtime.crypto = {} as Crypto;
if (typeof runtime.crypto.getRandomValues !== "function")
  runtime.crypto.getRandomValues =
    ExpoCrypto.getRandomValues as Crypto["getRandomValues"];
if (typeof runtime.crypto.subtle === "undefined")
  Object.defineProperty(runtime.crypto, "subtle", {
    value: {
      digest: async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        const name = typeof algorithm === "string" ? algorithm : algorithm.name;
        if (name.toUpperCase() !== "SHA-256")
          throw new Error("Unsupported digest");
        return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
      },
    },
  });
