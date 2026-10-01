import connection from "../config/database.js";

import {
    createVotingAuthorization
} from "./votingAuthorization.service.js";


export const createVoterEligibility = async (
    identityId: string,
    electionId: string
) => {
    const existingResult = await connection.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
        FROM voter_eligibilities
        WHERE identity_id = $1
          AND election_id = $2
        LIMIT 1
        `,
        [
            identityId,
            electionId
        ]
    );

    if (existingResult.rows[0]) {
        return {
            success: false,
            reason: "Voter eligibility already exists"
        };
    }

    const eligibilityResult = await connection.query(
        `
        INSERT INTO voter_eligibilities (
            identity_id,
            election_id,
            status
        )
        VALUES (
            $1,
            $2,
            'eligible'
        )
        RETURNING
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
        `,
        [
            identityId,
            electionId
        ]
    );

    const eligibility = eligibilityResult.rows[0];

    const authorization = await createVotingAuthorization(
        identityId,
        electionId
    );

    return {
        success: true,
        eligibility,
        authorization
    };
};


export const findVoterEligibility = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
        FROM voter_eligibilities
        WHERE identity_id = $1
          AND election_id = $2
        LIMIT 1
        `,
        [
            identityId,
            electionId
        ]
    );

    return result.rows[0] ?? null;
};


export const checkVoterEligibility = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status
        FROM voter_eligibilities
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'eligible'
        LIMIT 1
        `,
        [
            identityId,
            electionId
        ]
    );

    return result.rows[0] ?? null;
};


export const getVoterEligibilitiesByElection = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
        FROM voter_eligibilities
        WHERE election_id = $1
        ORDER BY identity_id ASC
        `,
        [
            electionId
        ]
    );

    return result.rows;
};