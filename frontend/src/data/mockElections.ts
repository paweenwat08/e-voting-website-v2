export interface Candidate {
    id: number;
    candidateNumber: number;
    name: string;
    description: string;
    votes: number;
}
interface Election {
    id: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    status: "draft" | "scheduled" | "open" | "closed";
    candidates: Candidate[];
}

export interface MockElection {
    id: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    status: "draft" | "scheduled" | "open" | "closed";
    candidates: Candidate[];
}

// Mock data — อยู่ในไฟล์เดียวกัน
export const elections: Election[] = [
    {
        id: 1,
        title: "Student Council Election",
        description: "Choose your candidate and help shape the future of our school.",
        startAt: "2026-10-13T08:00:00",
        endAt: "2026-10-15T16:00:00",
        status: "open",
        candidates: [
            {
                id: 101,
                candidateNumber: 1,
                name: "Candidate One",
                description: "Focused on improving student activities and school life.",
                votes: 120,
            },
            {
                id: 102,
                candidateNumber: 2,
                name: "Candidate Two",
                description: "Committed to student well-being and better communication.",
                votes: 95,
            },
            {
                id: 103,
                candidateNumber: 3,
                name: "Candidate Three",
                description: "Promoting new ideas and more opportunities for students.",
                votes: 72,
            },
        ],
    },
    {
        id: 2,
        title: "Class Representative Election",
        description: "Select your class representative for the upcoming school year.",
        startAt: "2026-11-01T08:00:00",
        endAt: "2026-11-02T16:00:00",
        status: "scheduled",
        candidates: [
            {
                id: 201,
                candidateNumber: 1,
                name: "Alex Morgan",
                description: "Ready to represent the class and hear your ideas.",
                votes: 0,
            },
            {
                id: 202,
                candidateNumber: 2,
                name: "Jordan Lee",
                description: "Focused on teamwork and class activities.",
                votes: 0,
            },
        ],
    },
    // เพิ่มสถานะ CLOSED (การเลือกตั้งที่จบไปแล้ว)
    {
        id: 3,
        title: "Sports Club President Election",
        description: "Vote for the leader of the official School Sports Association.",
        startAt: "2026-09-10T08:00:00",
        endAt: "2026-09-12T16:00:00",
        status: "closed",
        candidates: [
            {
                id: 301,
                candidateNumber: 1,
                name: "Taylor Swift",
                description: "Promoting health, fitness, and modern sports facilities.",
                votes: 245,
            },
            {
                id: 302,
                candidateNumber: 2,
                name: "Chris Evans",
                description: "Creating equal opportunities for all student athletes.",
                votes: 189,
            },
            {
                id: 303,
                candidateNumber: 3,
                name: "Emma Watson",
                description: "Organizing intramural tournaments and e-sports events.",
                votes: 110,
            },
        ],
    },
    // เพิ่มสถานะ DRAFT (แบบร่างการเลือกตั้ง)
    {
        id: 4,
        title: "Library Committee Representative",
        description: "Selecting the student delegate for the school library board.",
        startAt: "2026-12-01T08:00:00",
        endAt: "2026-12-03T16:00:00",
        status: "draft",
        candidates: [
            {
                id: 401,
                candidateNumber: 1,
                name: "Sam Smith",
                description: "Advocating for longer library hours and digital resources.",
                votes: 0,
            },
            {
                id: 402,
                candidateNumber: 2,
                name: "Olivia Rodrigo",
                description: "Updating the book catalog with modern study spaces.",
                votes: 0,
            },
        ],
    },
];