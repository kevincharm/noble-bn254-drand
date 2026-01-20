# noble-bn254-drand

BLS signatures on BN254 for drand.

## Installation

You must also install `@noble/curves@^2.0.1` as a peer dependency.

```bash
pnpm add @noble/curves@^2 @kevincharm/noble-bn254-drand@^1
```

## Notable features

- Hash-to-curve used is [SVDW from RFC9380](https://datatracker.ietf.org/doc/html/rfc9380/#svdw).
- Hash function used is keccak256.
- Signatures implemented on G1 only (short signatures).
- (De-)serialisation is from/to [Kyber](https://github.com/dedis/kyber) format, and does not support point compression.
