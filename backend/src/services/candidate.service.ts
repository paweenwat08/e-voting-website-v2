import connection from "../config/database.js";

import {
    checkCandidateEligibility
} from "./candidateEligibility.service.js";

export const createCandidate = async (
    identityId: number,
    electionId: number,
    candidateNumber: number,
    description: string | null
) => {
    // 1. Check candidate eligibility
    const eligibility =
        await checkCandidateEligibility(
            identityId,
            electionId
        );

    if (!eligibility) {
        return {
            success: false,
            reason: "Candidate is not eligible"
        };
    }

    // 2. Check election
    const electionResult = await connection.query(
        `
        SELECT
            id,
            status
        FROM elections
        WHERE id = $1
        LIMIT 1
        `,
        [electionId]
    );

    const election = electionResult.rows[0] ?? null;

    if (!election) {
        return {
            success: false,
            reason: "Election not found"
        };
    }

    // 3. Check duplicate candidate number
    const existingCandidateResult =
        await connection.query(
            `
            SELECT
                id
            FROM candidates
            WHERE election_id = $1
              AND candidate_number = $2
            LIMIT 1
            `,
            [
                electionId,
                candidateNumber
            ]
        );

    const existingCandidate =
        existingCandidateResult.rows[0] ?? null;

    if (existingCandidate) {
        return {
            success: false,
            reason: "Candidate number already exists"
        };
    }

    // 4. Create candidate
    const result = await connection.query(
        `
        INSERT INTO candidates (
            identity_id,
            election_id,
            candidate_number,
            description
        )
        VALUES (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING
            id,
            identity_id,
            election_id,
            candidate_number,
            description,
            created_at,
            updated_at
        `,
        [
            identityId,
            electionId,
            candidateNumber,
            description
        ]
    );

    return {
        success: true,
        candidate: result.rows[0]
    };
};

export const getCandidatesByElection = async (
    electionId: number
) => {
    const result = await connection.query(
        `
        SELECT
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
            c.created_at,
            c.updated_at,
            i.firstname,
            i.lastname
        FROM candidates c
        INNER JOIN identities i
            ON c.identity_id = i.id
        WHERE c.election_id = $1
        ORDER BY c.candidate_number ASC
        `,
        [electionId]
    );

    return result.rows;
};

export const getCandidateById = async (
    candidateId: number
) => {
    const result = await connection.query(
        `
        SELECT
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
            c.created_at,
            c.updated_at,
            i.firstname,
            i.lastname
        FROM candidates c
        INNER JOIN identities i
            ON c.identity_id = i.id
        WHERE c.id = $1
        LIMIT 1
        `,
        [candidateId]
    );

    return result.rows[0] ?? null;
};
