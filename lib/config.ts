export const APP_MODE = process.env.NEXT_PUBLIC_APP_ENV as 'mock' | 'sandbox' | 'production'
export const IS_MOCK = APP_MODE === 'mock'
export const IS_SANDBOX = APP_MODE === 'sandbox'
