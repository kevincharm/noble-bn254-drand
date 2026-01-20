import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bn254 } from '../src/index.js'
import { beacons, chainInfo, DST } from './data.js'

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
                assert.equal(isValid, true)
            })
        }
    })

    it('should sign and verify a message with a generated key', () => {
        const message = new TextEncoder().encode('hello bn254')
        const { secretKey, publicKey } = bn254.shortSignatures.keygen()
        const msgPoint = bn254.shortSignatures.hash(message)
        const signature = bn254.shortSignatures.sign(msgPoint, secretKey)
        const isValid = bn254.shortSignatures.verify(signature, msgPoint, publicKey)
        assert.equal(isValid, true)
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
