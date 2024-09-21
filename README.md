# noble-bn254-drand

As found at [@noble/curves/bn254](https://github.com/paulmillr/noble-curves/blob/c13d9d0dca752d2a45675c3b1508beb2eb3981ca/src/bn254.ts), but with hash-to-curve & signature implementations specifically tailored for [drand](https://drand.love) evmnet.

## Notable features

-   Hash-to-curve used is [SVDW from RFC9380](https://datatracker.ietf.org/doc/html/rfc9380/#svdw).
-   Hash function used is keccak256.
-   Signatures implemented on G1 only (short signatures).
-   (De-)serialisation is from/to [Kyber](https://github.com/dedis/kyber) format, and does not support point compression.
