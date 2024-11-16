import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js/*";
import { Request, RequestHandler, Response } from "express";

interface VerifyWorldIdRequestBody extends MiniAppWalletAuthSuccessPayload {
    nonce: string;
}

export const VerfiyWorldIdSignature: RequestHandler = async (
    req: Request< {}, {}, VerifyWorldIdRequestBody>,
    res: Response
) => {
    const { nonce, ...payload } = req.body;

    try {
        var result = await verifySiweMessage(payload, nonce);
        res.status(200).json({ ...result });
    } catch (err: any) {
        res.status(400).json({ isValid: false, error: err.message });
    }
}