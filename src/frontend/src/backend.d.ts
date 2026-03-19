import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Estate {
    id: bigint;
    estateCare: string;
    userId: Principal;
    areaAcres: number;
    name: string;
    createdAt: bigint;
    location: string;
}
export interface RainfallLog {
    id: bigint;
    userId: Principal;
    date: string;
    notes: string;
    estateId: bigint;
    rainfallMM: number;
}
export interface LabourEntry {
    id: bigint;
    workType: string;
    wagePerDay: number;
    userId: Principal;
    date: string;
    numberOfDays: bigint;
    totalAmount: number;
    estateId: bigint;
    workerName: string;
}
export interface Forecast {
    id: bigint;
    userId: Principal;
    cropName: string;
    forecastDate: string;
    forecastNote: string;
    estateId: bigint;
}
export interface RevenueEntry {
    id: bigint;
    userId: Principal;
    date: string;
    description: string;
    estateId: bigint;
    amount: number;
}
export interface DailyLog {
    id: bigint;
    userId: Principal;
    date: string;
    pesticideMl: number;
    laborHours: number;
    fertilizerKg: number;
    estateId: bigint;
    rainfallMM: number;
}
export interface CropYield {
    id: bigint;
    yieldKg: number;
    userId: Principal;
    year: bigint;
    cropName: string;
    estateId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface UserRecord {
    principalId: Principal;
    name: string;
    role: string;
    createdAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeleteCropYield(yieldId: bigint): Promise<void>;
    adminDeleteDailyLog(logId: bigint): Promise<void>;
    adminDeleteEstate(estateId: bigint): Promise<void>;
    adminDeleteLabourEntry(entryId: bigint): Promise<void>;
    adminDeleteRainfallLog(logId: bigint): Promise<void>;
    adminDeleteRevenueEntry(entryId: bigint): Promise<void>;
    adminGetAllCropYields(): Promise<Array<CropYield>>;
    adminGetAllDailyLogs(): Promise<Array<DailyLog>>;
    adminGetAllEstates(): Promise<Array<Estate>>;
    adminGetAllLabourEntries(): Promise<Array<LabourEntry>>;
    adminGetAllRainfallLogs(): Promise<Array<RainfallLog>>;
    adminGetAllRevenueEntries(): Promise<Array<RevenueEntry>>;
    adminGetAllUserPrincipals(): Promise<Array<Principal>>;
    adminGetAllUsers(): Promise<Array<UserRecord>>;
    adminDeleteUserFromRegistry(user: Principal): Promise<void>;
    adminUpdateUserRole(user: Principal, role: UserRole): Promise<void>;
    adminResetAllUsers(token: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCropYield(yield: CropYield): Promise<bigint>;
    createDailyLog(log: DailyLog): Promise<bigint>;
    createEstate(estate: Estate): Promise<bigint>;
    createForecast(forecast: Forecast): Promise<bigint>;
    createLabourEntry(entry: LabourEntry): Promise<bigint>;
    createRainfallLog(log: RainfallLog): Promise<bigint>;
    createRevenueEntry(entry: RevenueEntry): Promise<bigint>;
    deleteCropYield(yieldId: bigint): Promise<void>;
    deleteDailyLog(logId: bigint): Promise<void>;
    deleteEstate(estateId: bigint): Promise<void>;
    deleteLabourEntry(entryId: bigint): Promise<void>;
    deleteRainfallLog(logId: bigint): Promise<void>;
    deleteRevenueEntry(entryId: bigint): Promise<void>;
    ensureUserInRegistry(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCropYield(yieldId: bigint): Promise<CropYield>;
    getDailyLog(logId: bigint): Promise<DailyLog>;
    getEstate(estateId: bigint): Promise<Estate>;
    getForecast(forecastId: bigint): Promise<Forecast>;
    getLabourEntry(entryId: bigint): Promise<LabourEntry>;
    getRainfallLog(logId: bigint): Promise<RainfallLog>;
    getRevenueEntry(entryId: bigint): Promise<RevenueEntry>;
    getTotalExpensesForUser(): Promise<number>;
    getTotalRainfallForUser(): Promise<number>;
    getTotalRevenueForUser(): Promise<number>;
    getUserCropYields(): Promise<Array<CropYield>>;
    getUserDailyLogs(): Promise<Array<DailyLog>>;
    getUserEstates(): Promise<Array<Estate>>;
    getUserForecasts(): Promise<Array<Forecast>>;
    getUserLabourEntries(): Promise<Array<LabourEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRainfallLogs(): Promise<Array<RainfallLog>>;
    getUserRevenueEntries(): Promise<Array<RevenueEntry>>;
    isCallerAdmin(): Promise<boolean>;
    claimAdminRole(secret: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
