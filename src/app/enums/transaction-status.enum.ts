/**
 * Enum representing the possible statuses of a transaction.
 *
 * - `SUCCESS`: Indicates that the transaction was completed successfully.
 * - `ALREADY_CREATED`: Indicates that the transaction or entity already exists.
 * - `ERROR`: Indicates that an error occurred during the transaction.
 */
export enum TransactionStatus {
    SUCCESS = 'SUCCESS',
    ALREADY_CREATED = 'ALREADY_CREATED',
    ERROR = 'ERROR',
}