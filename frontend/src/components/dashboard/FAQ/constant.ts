interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export const faqs: FAQItem[] = [
    {
        id: 1,
        question: "Is my vote really anonymous?",
        answer: "Yes. Your account confirms eligibility, then separates from your selections before the ballot is stored.",
    },
    {
        id: 2,
        question: "What if I'm absent on election day?",
        answer: "There is no early voting, but you can vote from any internet-connected device during polling hours.",
    },
    {
        id: 3,
        question: "Can I change my ballot after submitting?",
        answer: "No. Review every race carefully before tapping Submit; confirmed ballots cannot be reopened.",
    },
    {
        id: 4,
        question: "Do I have to vote in every race?",
        answer: "No. You may skip any office and still submit the rest of your ballot.",
    },
    {
        id: 5,
        question: "How are ties handled?",
        answer: "A tied race goes to a one-day runoff election on Oct 20 between the tied candidates.",
    },
    {
        id: 6,
        question: "When are results official?",
        answer: "The Election Board verifies totals and posts certified results at 5:00 PM on Oct 23.",
    },
];