/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
import { bn254 as _bn254, _postPrecompute } from '@noble/curves/bn254.js'
import { bls } from '@noble/curves/abstract/bls.js'
import { validateField, type IField } from '@noble/curves/abstract/modular.js'
import type { H2COpts } from '@noble/curves/abstract/hash-to-curve.js'
import type { AffinePoint, WeierstrassPoint } from '@noble/curves/abstract/weierstrass.js'
import type { Fp, Fp2 } from '@noble/curves/abstract/tower.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import {
    bytesToHex,
    bytesToNumberBE,
    concatBytes,
    hexToBytes,
    notImplemented,
    numberToBytesBE,
} from '@noble/curves/utils.js'

const { Fp, Fp2 } = _bn254.fields

function isAllZero(bytes: Uint8Array): boolean {
    for (const byte of bytes) if (byte !== 0) return false
    return true
}

function kyberG1FromBytes(bytes: Uint8Array): WeierstrassPoint<Fp> {
    const len = Fp.BYTES
    if (bytes.length === len && isAllZero(bytes)) return _bn254.G1.Point.ZERO
    if (bytes.length !== len * 2) throw new Error('invalid G1 byte length')
    const x = Fp.create(bytesToNumberBE(bytes.subarray(0, len)))
    const y = Fp.create(bytesToNumberBE(bytes.subarray(len, len * 2)))
    const point = _bn254.G1.Point.fromAffine({ x, y })
    point.assertValidity()
    return point
}

function kyberG1ToBytes(point: WeierstrassPoint<Fp>): Uint8Array {
    const len = Fp.BYTES
    if (point.equals(_bn254.G1.Point.ZERO)) return new Uint8Array(len)
    const { x, y } = point.toAffine()
    return concatBytes(numberToBytesBE(x, len), numberToBytesBE(y, len))
}

function kyberG2FromBytes(bytes: Uint8Array): WeierstrassPoint<Fp2> {
    const len = Fp.BYTES
    if (bytes.length !== len * 4) throw new Error('invalid G2 byte length')
    if (isAllZero(bytes)) return _bn254.G2.Point.ZERO
    const p = [
        bytes.subarray(len, len * 2),
        bytes.subarray(0, len),
        bytes.subarray(len * 3, len * 4),
        bytes.subarray(len * 2, len * 3),
    ].map((buf) => bytesToNumberBE(buf))
    const x = Fp2.create({ c0: p[0], c1: p[1] })
    const y = Fp2.create({ c0: p[2], c1: p[3] })
    const point = _bn254.G2.Point.fromAffine({ x, y })
    point.assertValidity()
    return point
}

function kyberG2ToBytes(point: WeierstrassPoint<Fp2>): Uint8Array {
    const len = Fp.BYTES
    const marshalSize = 4 * len
    if (point.equals(_bn254.G2.Point.ZERO)) return new Uint8Array(marshalSize)
    const { x, y } = point.toAffine()
    const { re: x0, im: x1 } = Fp2.reim(x)
    const { re: y0, im: y1 } = Fp2.reim(y)
    return concatBytes(
        numberToBytesBE(x1, len),
        numberToBytesBE(x0, len),
        numberToBytesBE(y1, len),
        numberToBytesBE(y0, len),
    )
}

function kyberG1FromHex(hex: string): WeierstrassPoint<Fp> {
    return kyberG1FromBytes(hexToBytes(hex))
}

function kyberG2FromHex(hex: string): WeierstrassPoint<Fp2> {
    return kyberG2FromBytes(hexToBytes(hex))
}

function kyberG1ToHex(point: WeierstrassPoint<Fp>): string {
    return bytesToHex(kyberG1ToBytes(point))
}

function kyberG2ToHex(point: WeierstrassPoint<Fp2>): string {
    return bytesToHex(kyberG2ToBytes(point))
}

function SVDWFpIsSquare<T>(Fp: IField<T>) {
    return (u: T) => {
        const x = Fp.pow(u, (Fp.ORDER - 1n) / 2n)
        if (Fp.eql(x, Fp.neg(Fp.ONE))) return false
        if (Fp.eql(x, Fp.ZERO)) return false
        if (Fp.eql(x, Fp.ONE)) return true
        throw new Error('Legendre failed')
    }
}

function mapToCurveSVDW<T>(
    Fp: IField<T>,
    opts: {
        A: T
        B: T
        Z: T
    },
) {
    validateField(Fp)
    if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
        throw new Error('mapToCurveSimpleSVDW: invalid opts')
    const isSquare = SVDWFpIsSquare(Fp)
    if (!Fp.isOdd) throw new Error('Fp.isOdd is not implemented!')

    const g = (x: T) => Fp.add(Fp.add(Fp.mul(Fp.mul(x, x), x), Fp.mul(opts.A, x)), opts.B)
    const two = Fp.add(Fp.ONE, Fp.ONE)
    const three = Fp.add(two, Fp.ONE)
    const four = Fp.add(three, Fp.ONE)
    const c1 = g(opts.Z)
    const c2 = Fp.mul(Fp.neg(opts.Z), Fp.inv(Fp.add(Fp.ONE, Fp.ONE)))
    const c3 = Fp.sqrt(
        Fp.mul(Fp.neg(c1), Fp.add(Fp.mul(three, Fp.mul(opts.Z, opts.Z)), Fp.mul(four, opts.A))),
    )
    const c4 = Fp.mul(
        Fp.mul(four, Fp.neg(c1)),
        Fp.inv(Fp.add(Fp.mul(three, Fp.mul(opts.Z, opts.Z)), Fp.mul(four, opts.A))),
    )
    return (u: T): AffinePoint<T> => {
        // prettier-ignore
        let tv1, tv2, tv3, tv4, x1, gx1, e1, x2, gx2, e2, x3, x, gx, y, e3;
        tv1 = Fp.mul(u, u)
        tv1 = Fp.mul(tv1, c1)
        tv2 = Fp.add(Fp.ONE, tv1)
        tv1 = Fp.sub(Fp.ONE, tv1)
        tv3 = Fp.mul(tv1, tv2)
        tv3 = Fp.inv(tv3)
        tv4 = Fp.mul(u, tv1)
        tv4 = Fp.mul(tv4, tv3)
        tv4 = Fp.mul(tv4, c3)
        x1 = Fp.sub(c2, tv4)
        gx1 = Fp.mul(x1, x1)
        gx1 = Fp.add(gx1, opts.A)
        gx1 = Fp.mul(gx1, x1)
        gx1 = Fp.add(gx1, opts.B)
        e1 = isSquare(gx1)
        x2 = Fp.add(c2, tv4)
        gx2 = Fp.mul(x2, x2)
        gx2 = Fp.add(gx2, opts.A)
        gx2 = Fp.mul(gx2, x2)
        gx2 = Fp.add(gx2, opts.B)
        e2 = isSquare(gx2) && !e1
        x3 = Fp.mul(tv2, tv2)
        x3 = Fp.mul(x3, tv3)
        x3 = Fp.mul(x3, x3)
        x3 = Fp.mul(x3, c4)
        x3 = Fp.add(x3, opts.Z)
        x = Fp.cmov(x3, x1, !!e1)
        x = Fp.cmov(x, x2, !!e2)
        gx = Fp.mul(x, x)
        gx = Fp.add(gx, opts.A)
        gx = Fp.mul(gx, x)
        gx = Fp.add(gx, opts.B)
        y = Fp.sqrt(gx)
        e3 = Fp.isOdd!(u) === Fp.isOdd!(y)
        y = Fp.cmov(Fp.neg(y), y, e3)
        return { x, y }
    }
}

const G1_SVDW = mapToCurveSVDW(Fp, {
    A: Fp.ZERO,
    B: 3n,
    Z: Fp.ONE,
})

const mapToCurveG1 = (scalars: bigint[]) => G1_SVDW(scalars[0])

const drandHtfBase: H2COpts = {
    DST: 'BLS_SIG_BN254G1_XMD:KECCAK-256_SVDW_RO_NUL_',
    p: Fp.ORDER,
    m: 1,
    k: 128,
    expand: 'xmd',
    hash: keccak_256,
}

const drandHtf = Object.freeze({
    ...drandHtfBase,
    encodeDST: 'BLS_SIG_BN254G1_XMD:KECCAK-256_SVDW_RO_NUL_',
}) as H2COpts

/**
 * bn254 (a.k.a. alt_bn128) pairing-friendly curve.
 * Contains G1 / G2 operations and pairings, plus drand helpers.
 */
export const bn254 = Object.freeze({
    ...bls(
        _bn254.fields,
        _bn254.G1.Point,
        _bn254.G2.Point,
        {
            ateLoopSize: _bn254.params.ateLoopSize,
            xNegative: false,
            twistType: _bn254.params.twistType,
            postPrecompute: _postPrecompute,
        },
        {
            mapToG1: mapToCurveG1,
            mapToG2: notImplemented,
            hasherOpts: drandHtf,
            hasherOptsG1: drandHtf,
            hasherOptsG2: { ...drandHtf, m: 2 },
        },
        {
            ShortSignature: {
                fromBytes: kyberG1FromBytes,
                fromHex: kyberG1FromHex,
                toBytes: kyberG1ToBytes,
                toHex: kyberG1ToHex,
            },
            LongSignature: {
                fromBytes: kyberG2FromBytes,
                fromHex: kyberG2FromHex,
                toBytes: kyberG2ToBytes,
                toHex: kyberG2ToHex,
            },
        },
    ),
    verifyShortSignature: (
        signature: Uint8Array | string,
        message: Uint8Array,
        publicKey: Uint8Array | string,
        opts?: { DST?: string | Uint8Array },
    ): boolean => {
        const sigPoint =
            typeof signature === 'string' ? kyberG1FromHex(signature) : kyberG1FromBytes(signature)
        const pubPoint =
            typeof publicKey === 'string' ? kyberG2FromHex(publicKey) : kyberG2FromBytes(publicKey)
        const msgPoint = bn254.shortSignatures.hash(message, opts?.DST)
        return bn254.shortSignatures.verify(sigPoint, msgPoint, pubPoint)
    },
})
