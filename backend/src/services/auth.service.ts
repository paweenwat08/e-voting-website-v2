import bcrypt from "bcrypt";
import crypto from "node:crypto";
import connection from "../config/database.js";

export const hashPassword = async (
    password: string
): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (
    password: string,
    passwordHash: string
): Promise<boolean> => {
    return bcrypt.compare(password, passwordHash);
};

export const findIdentityByUserId = async (
    userId: string
) => {
    const result = await connection.query(
        `
        SELECT
            id,
            user_id,
            firstname,
            lastname,
            password_hash,
            role,
            status,
            created_at,
            updated_at
        FROM identities
        WHERE user_id = $1
        LIMIT 1
        `,
        [userId.trim()]
    );

    return result.rows[0] ?? null;
};

export const createSession = async (
    identityId: number
) => {
    const sessionToken = crypto
        .randomBytes(32)
        .toString("hex");

    const sessionTokenHash = crypto
        .createHash("sha256")
        .update(sessionToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 60 * 60 * 1000 //60 นาที
    );

    const result = await connection.query(
        `
        INSERT INTO sessions (
            identity_id,
            session_token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            identity_id,
            expires_at,
            created_at,
            updated_at
        `,
        [
            identityId,
            sessionTokenHash,
            expiresAt
        ]
    );

    return {
        sessionToken,
        session: result.rows[0]
    };
};

export const authenticateUser = async (
    userId: string,
    password: string
) => {
    const identity = await findIdentityByUserId(userId);

    if (!identity) {
        return null;
    }

    if (identity.status === "disabled") {
        return null;
    }

    const isMatch = await comparePassword(
        password,
        identity.password_hash
    );

    if (!isMatch) {
        return null;
    }

    return identity;
};

export const createUser = async (
    userId: string,
    firstname: string,
    lastname: string,
    password: string,
    role: "voter" | "admin" = "voter"
) => {
    const passwordHash = await hashPassword(password);

    const result = await connection.query(
        `
        INSERT INTO identities (
            user_id,
            firstname,
            lastname,
            password_hash,
            role,
            status
        )
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING
            id,
            user_id,
            firstname,
            lastname,
            role,
            status,
            created_at,
            updated_at
        `,
        [
            userId.trim(),
            firstname.trim(),
            lastname.trim(),
            passwordHash,
            role
        ]
    );

    return result.rows[0];
};