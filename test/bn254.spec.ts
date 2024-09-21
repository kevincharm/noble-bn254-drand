import { expect } from 'chai'
import { bn254 } from '../src'
import { keccak_256 } from '@noble/hashes/sha3'
import { beacons, chainInfo, DST } from './data'

describe('bn254', () => {
    describe('#verifyShortSignature on drand evmnet beacons', () => {
        for (const beacon of beacons) {
            it(`should verify round ${beacon.round}`, () => {
                const isValid = bn254.verifyShortSignature(
                    beacon.signature,
                    unchainedBeaconMessage(beacon),
                    chainInfo.public_key,
                    {
                        DST,
                    },
                )
                expect(isValid).to.eq(true)
            })
        }
    })
})

function roundBuffer(round: number) {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64BE(BigInt(round))
    return buffer
}

function unchainedBeaconMessage(beacon: any): Uint8Array {
    return keccak_256(roundBuffer(beacon.round))
}
