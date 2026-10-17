export interface UpdateUserInput {
    firstname: string;
    lastname: string;
    status: "active" | "disabled";
}