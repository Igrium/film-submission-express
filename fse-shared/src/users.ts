/**
 * Represents a simple user, excluding the password.
 */
export interface SimpleUser {
    username: string,
    email: string,
    admin: boolean
}

/**
 * Represents a user with an unhashed password. DO NOT STORE!
 */
export interface UserWithPassword extends SimpleUser {
    password: string
}