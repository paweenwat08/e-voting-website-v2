import { getLocalDateKey } from "../../../utils/Date";
import { type ScheduleElection, } from "../../../services/scheduleService";
interface ElectionEvent {
    id: string;
    date: string;
    title: string;
    description?: string;
}

export function createElectionEvents(
    elections: ScheduleElection[]
): ElectionEvent[] {
    return elections.flatMap((election) => {
        const startDate = getLocalDateKey(election.startAt);
        const endDate = getLocalDateKey(election.endAt);

        return [
            {
                id: `${election.id}-start`,
                date: startDate,
                title: `${election.title} — Starts`,
                description: election.description
                    ? `${election.description} (Status: ${election.status})`
                    : `Election starts. Status: ${election.status}`,
            },
            {
                id: `${election.id}-end`,
                date: endDate,
                title: `${election.title} — Ends`,
                description: `Election ends. Status: ${election.status}`,
            },
        ];
    });
}