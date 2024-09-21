export const DST = 'BLS_SIG_BN254G1_XMD:KECCAK-256_SVDW_RO_NUL_'

export const chainInfo = {
    public_key:
        '14018a8127d0cd185f0d0cd168bec330c584581d46f77f41e8ee33ad600588e104961f20efbcec8ce5e176aa182bf141f7059cfb467e3b508bc6f36f227d5cf31c7baa2a010677e813ffca24b4ff5faf3348b2750201c85b126a480118b149f514d3e7aba46a99f40aac6507a2c6d6f3c7a6b38038786831e3e6b5b0adf5894b',
    period: 3,
    genesis_time: 1726958055,
    hash: 'f50064cd5f71a2e2de647940ac7fa2fd9f6128129ada163e971625ec9f082db2',
    groupHash: '3a7cd8aa1864ff0cf8837e1bf77dad871aaaa8f046041ccecce74ab4e029f30c',
    schemeID: 'bls-bn254-unchained-on-g1',
    metadata: { beaconID: 'default' },
}

export const beacons = [
    {
        round: 1,
        signature:
            '0d2cdded373210583d66d973f28b68adc4a5d52a39304a38343ee9d2e785f335098a1d16660304ceeabac9ddb80ec00916dcbe32ac8597b6295baac935f84648',
        randomness: '9ddf8ee8ff3f375f33c8f8fd142b648e1f3c134284423362e8796770ac43c1a6',
    },
    {
        round: 2,
        signature:
            '2b481ec543a44225ba184d09c83068f7e74b4d78d076cca67a1647418391e3fd1e739096fed5d0315e81beeec64058d5d31161f3e2e9df14d4af86a7c2fa1e92',
        randomness: '315b39f5df1b038c5f548d1c96e0ee816f70a09b0bdaccc4f40cb2e6bb7b3c5f',
    },
    {
        round: 3,
        signature:
            '2b71c198edfb7271be885f02227930d86e88884fc6870219898904748d37f49f03f4e39b955198e6638cd55c785d1e0f6da236539f9d18b84ab95eb2e92f691a',
        randomness: 'f4f91abe0819ab72e97e08658fef52f395bcfb270dccfb33b9286720083085f2',
    },
    {
        round: 10,
        signature:
            '0fd919ec1490bf01935f348837bd20f49f539c5adfd60ce29648fe16f8dbed8803bf3e8fb4c3cbce5dcb642333d81260a811cc432b2f7a687b9b7c2305ad01ee',
        randomness: 'a62a0e81920b40fb361f9106efb34199af1fbdb0c53db51f7acbad73e0d9d0bf',
    },
    {
        round: 40,
        signature:
            '23f7e78888e0bb376e9f70ded2d49546e300c913a401c1b59cc63626c5a6f3750cc5ef66ad1430b82a57aa94aa866dccd68213e66d5f35ff53b19c60dc008429',
        randomness: 'f6e126339b1aba7c12aec53a76b6a790dd649c8cdbeeb41d2a47024fb3d57fd4',
    },
]
